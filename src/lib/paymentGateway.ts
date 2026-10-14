import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ArtopayAdapter, type CreatePaymentLinkParams, type WebhookPayload } from '../server/artopayAdapter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const EVENTS_FILE = path.join(DATA_DIR, 'processed_events.json');

export interface ShopOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  baseAmount: number;
  uniqueCode: number;
  grossAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'AMOUNT_MISMATCH';
  paymentId?: string;
  paymentUrl?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  paymentMethod?: string;
  disputeReason?: string;
  notes?: string;
}

export class PaymentGateway {
  private adapter: ArtopayAdapter;
  private orders: Map<string, ShopOrder> = new Map();
  private processedEvents: Set<string> = new Set();
  private isProduction: boolean;
  private lockPromise: Promise<void> = Promise.resolve();

  constructor(adapter?: ArtopayAdapter) {
    this.adapter = adapter || new ArtopayAdapter();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initStorage();
  }

  /**
   * Initializes persistent disk storage for orders and idempotency events
   */
  private initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(ORDERS_FILE)) {
        const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
        const list: ShopOrder[] = JSON.parse(raw);
        for (const ord of list) {
          this.orders.set(ord.orderId, ord);
        }
      } else {
        this.persistOrders();
      }

      if (fs.existsSync(EVENTS_FILE)) {
        const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
        const list: string[] = JSON.parse(raw);
        for (const evt of list) {
          this.processedEvents.add(evt);
        }
      } else {
        this.persistEvents();
      }
    } catch (err) {
      console.error('[PaymentGateway] Storage initialization error:', err);
    }
  }

  private persistOrders() {
    try {
      const data = JSON.stringify(Array.from(this.orders.values()), null, 2);
      fs.writeFileSync(ORDERS_FILE, data, 'utf8');
    } catch (err) {
      console.error('[PaymentGateway] Failed to persist orders to disk:', err);
    }
  }

  private persistEvents() {
    try {
      const data = JSON.stringify(Array.from(this.processedEvents), null, 2);
      fs.writeFileSync(EVENTS_FILE, data, 'utf8');
    } catch (err) {
      console.error('[PaymentGateway] Failed to persist processed events:', err);
    }
  }

  /**
   * Concurrency-safe lock wrapper to prevent race conditions during order creation
   */
  private async acquireLock<T>(action: () => Promise<T> | T): Promise<T> {
    const previous = this.lockPromise;
    let release: () => void = () => {};
    this.lockPromise = new Promise(resolve => {
      release = resolve;
    });

    await previous;
    try {
      return await action();
    } finally {
      release();
    }
  }

  /**
   * Allocates a non-colliding unique code (100 - 999) for a given base amount.
   * Guarantees that concurrent checkouts with identical base amounts receive distinct unique codes.
   */
  private allocateUniqueCode(baseAmount: number, nowMs: number): number {
    const activeUsedCodes = new Set<number>();

    for (const ord of this.orders.values()) {
      if (ord.status === 'PENDING') {
        const expTime = new Date(ord.expiresAt).getTime();
        if (expTime > nowMs && ord.baseAmount === baseAmount) {
          activeUsedCodes.add(ord.uniqueCode);
        }
      }
    }

    // Hash or pseudorandom seed within 100..999, then find nearest available
    const seed = 100 + Math.floor(Math.random() * 899);
    for (let offset = 0; offset < 900; offset++) {
      const candidate = 100 + ((seed - 100 + offset) % 900);
      if (!activeUsedCodes.has(candidate)) {
        return candidate;
      }
    }

    // Extreme fallback: larger range if 900 concurrent identical orders exist
    return 1000 + (this.orders.size % 9000);
  }

  /**
   * Creates and persists a new shop order with concurrency-safe unique code & Artopay link
   */
  public async createCheckoutOrder(params: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    currency?: string;
    expiryMinutes?: number;
    returnUrl?: string;
    callbackUrl?: string;
  }): Promise<ShopOrder> {
    return await this.acquireLock(async () => {
      if (!params.items || params.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      // Exact integer arithmetic in IDR
      let baseAmount = 0;
      for (const item of params.items) {
        if (item.price <= 0 || item.quantity <= 0) {
          throw new Error(`Invalid price or quantity for item: ${item.name}`);
        }
        baseAmount += Math.round(item.price) * Math.round(item.quantity);
      }

      const now = new Date();
      const expiryMinutes = params.expiryMinutes || 60;
      const expiresAt = new Date(now.getTime() + expiryMinutes * 60000).toISOString();

      const uniqueCode = this.allocateUniqueCode(baseAmount, now.getTime());
      const grossAmount = baseAmount + uniqueCode;
      const orderId = `TP-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const linkParams: CreatePaymentLinkParams = {
        orderId,
        baseAmount,
        uniqueCode,
        grossAmount,
        currency: params.currency || 'IDR',
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone
        },
        items: params.items,
        expiryMinutes,
        returnUrl: params.returnUrl,
        callbackUrl: params.callbackUrl
      };

      let paymentResult: any;
      try {
        paymentResult = await this.adapter.createPaymentLink(linkParams);
      } catch (err: any) {
        console.error('[PaymentGateway] Artopay API invocation error:', err.message);
        throw err;
      }

      const newOrder: ShopOrder = {
        orderId,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        items: params.items,
        baseAmount,
        uniqueCode,
        grossAmount,
        currency: params.currency || 'IDR',
        status: 'PENDING',
        paymentId: paymentResult.paymentId,
        paymentUrl: paymentResult.paymentUrl,
        createdAt: now.toISOString(),
        expiresAt,
        notes: `Artopay Sandbox: ${this.adapter.isSandboxMode() ? 'YES' : 'NO'}`
      };

      this.orders.set(orderId, newOrder);
      this.persistOrders();

      return newOrder;
    });
  }

  public getOrder(orderId: string): ShopOrder | undefined {
    return this.orders.get(orderId);
  }

  public getAllOrders(): ShopOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Processes Artopay Webhook Notification with signature verification,
   * idempotency/replay protection, and exact amount match verification.
   */
  public async handleWebhook(
    rawBody: string | Buffer,
    signature: string,
    timestamp?: string
  ): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    orderId?: string;
    isDuplicate?: boolean;
  }> {
    return await this.acquireLock(async () => {
      // 1. Signature Verification
      const isValidSignature = this.adapter.verifyWebhookSignature(rawBody, signature, timestamp);
      if (!isValidSignature) {
        return {
          success: false,
          statusCode: 401,
          message: 'Invalid Artopay webhook signature'
        };
      }

      // 2. Parse Webhook Body
      let payload: WebhookPayload;
      try {
        payload = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'));
      } catch {
        return {
          success: false,
          statusCode: 400,
          message: 'Malformed JSON payload in webhook'
        };
      }

      const eventId = payload.event_id;
      if (!eventId) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing event_id in webhook notification'
        };
      }

      // 3. Idempotency / Replay Attack Guard
      if (this.processedEvents.has(eventId)) {
        return {
          success: true,
          statusCode: 200,
          isDuplicate: true,
          message: `Webhook event ${eventId} already processed (idempotent)`
        };
      }

      const orderData = payload.data;
      if (!orderData || !orderData.order_id) {
        return {
          success: false,
          statusCode: 400,
          message: 'Missing order_id in webhook payload data'
        };
      }

      // 4. Order Lookup
      const order = this.orders.get(orderData.order_id);
      if (!order) {
        return {
          success: false,
          statusCode: 404,
          message: `Order ${orderData.order_id} not found in database`
        };
      }

      // 5. Exact Amount Matching
      if (orderData.gross_amount !== order.grossAmount) {
        order.status = 'AMOUNT_MISMATCH';
        order.disputeReason = `Expected Rp ${order.grossAmount}, received Rp ${orderData.gross_amount}`;
        this.processedEvents.add(eventId);
        this.persistOrders();
        this.persistEvents();
        return {
          success: false,
          statusCode: 422,
          orderId: order.orderId,
          message: `Payment amount mismatch: Expected ${order.grossAmount}, got ${orderData.gross_amount}`
        };
      }

      // 6. Verify Status Update
      const incomingStatus = (orderData.status || '').toUpperCase();
      if (incomingStatus === 'PAID' || incomingStatus === 'SETTLED') {
        if (order.status === 'PENDING') {
          order.status = 'PAID';
          order.paidAt = orderData.paid_at || new Date().toISOString();
          order.paymentMethod = orderData.payment_method || 'ARTOPAY_OFFICIAL';
        }
      } else if (incomingStatus === 'EXPIRED') {
        if (order.status === 'PENDING') {
          order.status = 'EXPIRED';
        }
      } else if (incomingStatus === 'FAILED') {
        if (order.status === 'PENDING') {
          order.status = 'FAILED';
        }
      } else {
        return {
          success: false,
          statusCode: 400,
          message: `Unknown or unhandled payment status: ${incomingStatus}`
        };
      }

      // 7. Record Processed Event & Persist
      this.processedEvents.add(eventId);
      this.persistOrders();
      this.persistEvents();

      return {
        success: true,
        statusCode: 200,
        orderId: order.orderId,
        message: `Order ${order.orderId} successfully updated to ${order.status}`
      };
    });
  }

  /**
   * Strictly controls sandbox payment simulation.
   * Throws and blocks execution if NODE_ENV is production or if called without authorized flag.
   */
  public simulatePayment(orderId: string, isAdminAuthorized: boolean): ShopOrder {
    if (this.isProduction || process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY VIOLATION: Payment simulation is strictly prohibited in production environment');
    }

    if (!isAdminAuthorized) {
      throw new Error('Unauthorized simulation: simulation cannot be triggered by unauthenticated clients');
    }

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Cannot simulate payment: Order status is already ${order.status}`);
    }

    order.status = 'PAID';
    order.paidAt = new Date().toISOString();
    order.paymentMethod = 'SANDBOX_SIMULATION_AUTHORIZED';
    this.persistOrders();

    return order;
  }
}
