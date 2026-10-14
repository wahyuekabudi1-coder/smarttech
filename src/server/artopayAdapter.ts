import crypto from 'node:crypto';

export interface ArtopayConfig {
  apiKey: string;
  secretKey: string;
  sandbox?: boolean;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreatePaymentLinkParams {
  orderId: string;
  baseAmount: number;
  uniqueCode: number;
  grossAmount: number;
  currency?: string;
  customer: CustomerInfo;
  items: OrderItem[];
  returnUrl?: string;
  callbackUrl?: string;
  expiryMinutes?: number;
}

export interface ArtopayPaymentResponse {
  paymentId: string;
  orderId: string;
  paymentUrl: string;
  grossAmount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  expiredAt: string;
  rawResponse: Record<string, unknown>;
}

export interface WebhookPayload {
  event: string;
  event_id: string;
  timestamp?: string;
  data: {
    payment_id: string;
    order_id: string;
    gross_amount: number;
    status: 'PAID' | 'SETTLED' | 'PENDING' | 'EXPIRED' | 'FAILED';
    paid_at?: string;
    payment_method?: string;
    [key: string]: unknown;
  };
}

export class ArtopayAdapter {
  private apiKey: string;
  private secretKey: string;
  private isSandbox: boolean;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config?: Partial<ArtopayConfig>) {
    const envVal = (process.env.ARTOPAY_ENV || '').trim().toLowerCase();
    const isSandboxEnv = envVal === 'sandbox' || (envVal !== 'production' && process.env.ARTOPAY_SANDBOX !== 'false' && process.env.NODE_ENV !== 'production');
    this.isSandbox = config?.sandbox !== undefined ? config.sandbox : isSandboxEnv;
    this.apiKey = config?.apiKey || process.env.ARTOPAY_API_KEY || process.env.ARTOPAY_BUSINESS_UNIT_ID || (this.isSandbox ? 'sandbox_api_smarttech_test' : '');
    this.secretKey = config?.secretKey || process.env.ARTOPAY_SECRET_KEY || process.env.ARTOPAY_PRIVATE_KEY || (this.isSandbox ? 'sandbox_sec_smarttech_test' : '');
    
    const defaultUrl = this.isSandbox
      ? (process.env.ARTOPAY_SANDBOX_BASE_URL || 'https://api-sandbox.artopay.id/v1')
      : (process.env.ARTOPAY_PROD_BASE_URL || 'https://api.artopay.id/v1');

    this.baseUrl = config?.baseUrl || process.env.ARTOPAY_BASE_URL || defaultUrl;
    this.timeoutMs = config?.timeoutMs || 15000;
  }

  /**
   * Return masked key for audit logging without leaking secrets.
   */
  public getMaskedKey(): string {
    if (!this.apiKey) return '[NOT_CONFIGURED]';
    if (this.apiKey.length <= 8) return '****';
    return `${this.apiKey.slice(0, 4)}****${this.apiKey.slice(-4)}`;
  }

  public isSandboxMode(): boolean {
    return this.isSandbox;
  }

  /**
   * Generates official request signature for Artopay API headers
   */
  public generateRequestSignature(method: string, path: string, bodyString: string, timestamp: string): string {
    const payload = `${timestamp}:${method.toUpperCase()}:${path}:${bodyString}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Creates an official payment link via Artopay Sandbox/Production API
   */
  public async createPaymentLink(params: CreatePaymentLinkParams): Promise<ArtopayPaymentResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('ArtopayAdapter: Missing ARTOPAY_API_KEY or ARTOPAY_SECRET_KEY in environment');
    }

    const path = '/payment-links';
    const endpoint = `${this.baseUrl}${path}`;
    const timestamp = new Date().toISOString();

    const requestPayload = {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
      base_amount: params.baseAmount,
      unique_code: params.uniqueCode,
      currency: params.currency || 'IDR',
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone || ''
      },
      items: params.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      expiry_minutes: params.expiryMinutes || 60,
      return_url: params.returnUrl || '',
      callback_url: params.callbackUrl || ''
    };

    const bodyString = JSON.stringify(requestPayload);
    const signature = this.generateRequestSignature('POST', path, bodyString, timestamp);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Artopay-Timestamp': timestamp,
          'X-Artopay-Signature': signature
        },
        body: bodyString,
        signal: controller.signal
      });

      clearTimeout(timeout);

      const jsonText = await response.text();
      let responseBody: any;
      try {
        responseBody = JSON.parse(jsonText);
      } catch {
        throw new Error(`Artopay API returned non-JSON response (HTTP ${response.status}): ${jsonText.slice(0, 200)}`);
      }

      if (!response.ok || (responseBody.status && responseBody.status !== 'success')) {
        const errorMsg = responseBody.message || responseBody.error || `HTTP ${response.status}`;
        throw new Error(`Artopay Payment Link Failed: ${errorMsg}`);
      }

      const paymentData = responseBody.data || responseBody;
      const paymentUrl = paymentData.payment_url || paymentData.checkout_url || paymentData.redirect_url;

      if (!paymentUrl) {
        throw new Error('Artopay API response missing official payment_url');
      }

      return {
        paymentId: paymentData.payment_id || paymentData.id || `AP-${params.orderId}`,
        orderId: params.orderId,
        paymentUrl,
        grossAmount: paymentData.gross_amount || params.grossAmount,
        status: (paymentData.status || 'PENDING').toUpperCase() as any,
        expiredAt: paymentData.expired_at || new Date(Date.now() + (params.expiryMinutes || 60) * 60000).toISOString(),
        rawResponse: responseBody
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Artopay API request timed out after ${this.timeoutMs}ms`);
      }
      if (this.isSandbox && (err.name === 'TypeError' || err.message?.includes('fetch failed') || err.message?.includes('ENOTFOUND'))) {
        return {
          paymentId: `AP-PAY-${params.orderId}`,
          orderId: params.orderId,
          paymentUrl: `https://checkout-sandbox.artopay.id/pay/AP-PAY-${params.orderId}`,
          grossAmount: params.grossAmount,
          status: 'PENDING',
          expiredAt: new Date(Date.now() + (params.expiryMinutes || 60) * 60000).toISOString(),
          rawResponse: { mode: 'sandbox_simulation', upstream: 'offline' }
        };
      }
      throw err;
    }
  }

  /**
   * Verifies incoming webhook signature according to Artopay specification.
   * Compares HMAC-SHA256 securely using crypto.timingSafeEqual to prevent timing attacks.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, incomingSignature: string, timestamp?: string): boolean {
    if (!this.secretKey) {
      console.error('[ArtopayAdapter] Cannot verify webhook signature: Secret key is not configured.');
      return false;
    }

    if (!incomingSignature) {
      return false;
    }

    try {
      const bodyBuffer = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
      
      // Spec A: Signature is HMAC of rawBody
      const hmacRaw = crypto.createHmac('sha256', this.secretKey).update(bodyBuffer).digest('hex');
      
      // Spec B: Signature is HMAC of timestamp.rawBody
      const hmacWithTimestamp = timestamp
        ? crypto.createHmac('sha256', this.secretKey).update(`${timestamp}.${bodyBuffer.toString('utf8')}`).digest('hex')
        : null;

      const incSigBuffer = Buffer.from(incomingSignature.toLowerCase(), 'utf8');

      const matchesRaw = hmacRaw.length === incSigBuffer.length && 
        crypto.timingSafeEqual(Buffer.from(hmacRaw, 'utf8'), incSigBuffer);

      if (matchesRaw) return true;

      if (hmacWithTimestamp) {
        const matchesTs = hmacWithTimestamp.length === incSigBuffer.length &&
          crypto.timingSafeEqual(Buffer.from(hmacWithTimestamp, 'utf8'), incSigBuffer);
        if (matchesTs) return true;
      }

      return false;
    } catch (err) {
      console.error('[ArtopayAdapter] Signature verification exception:', err);
      return false;
    }
  }

  /**
   * Queries payment status directly from Artopay API
   */
  public async getPaymentStatus(paymentIdOrOrderId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('ArtopayAdapter: Missing API key');
    }

    const path = `/payments/${encodeURIComponent(paymentIdOrOrderId)}`;
    const endpoint = `${this.baseUrl}${path}`;
    const timestamp = new Date().toISOString();
    const signature = this.generateRequestSignature('GET', path, '', timestamp);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Artopay-Timestamp': timestamp,
        'X-Artopay-Signature': signature
      }
    });

    if (!res.ok) {
      throw new Error(`Artopay status query failed with HTTP ${res.status}`);
    }

    return await res.json();
  }
}
