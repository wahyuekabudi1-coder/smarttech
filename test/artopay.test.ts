import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { ArtopayAdapter } from '../src/server/artopayAdapter.ts';
import { PaymentGateway, type ShopOrder } from '../src/lib/paymentGateway.ts';

const TEST_SECRET = 'sec_sandbox_test_secret_999888777';
const TEST_API_KEY = 'api_sandbox_test_key_111222333';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ARTOPAY INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // Helper to generate legitimate HMAC-SHA256 signature for test payloads
  function signPayload(bodyStr: string, secret: string = TEST_SECRET): string {
    return crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
  }

  // Mock Adapter for Controlled Gateway Testing
  class MockArtopayAdapter extends ArtopayAdapter {
    public simulateApiFailure = false;

    constructor() {
      super({
        apiKey: TEST_API_KEY,
        secretKey: TEST_SECRET,
        sandbox: true,
        baseUrl: 'https://api-sandbox.artopay.id/v1'
      });
    }

    public override async createPaymentLink(params: any): Promise<any> {
      if (this.simulateApiFailure) {
        throw new Error('Artopay API Error: 500 Internal Server Error (Upstream Gateway Unreachable)');
      }
      return {
        paymentId: `AP-PAY-${params.orderId}`,
        orderId: params.orderId,
        paymentUrl: `https://checkout-sandbox.artopay.id/pay/AP-PAY-${params.orderId}`,
        grossAmount: params.grossAmount,
        status: 'PENDING',
        expiredAt: new Date(Date.now() + 3600000).toISOString(),
        rawResponse: { status: 'success', code: 201 }
      };
    }
  }

  const mockAdapter = new MockArtopayAdapter();
  const gateway = new PaymentGateway(mockAdapter);

  // --------------------------------------------------------------------------
  // TEST 1: API Failure Handling
  // --------------------------------------------------------------------------
  await test('1. API Failure: Graceful rejection without crashing or leaking secrets', async () => {
    mockAdapter.simulateApiFailure = true;

    let caughtError: any = null;
    try {
      await gateway.createCheckoutOrder({
        customerName: 'Ahmad Subagyo',
        customerEmail: 'ahmad@tumpang.shop',
        items: [{ id: 'ITM-01', name: 'Apel Tumpang Fresh', price: 50000, quantity: 2 }]
      });
    } catch (err) {
      caughtError = err;
    } finally {
      mockAdapter.simulateApiFailure = false;
    }

    assert.ok(caughtError, 'Expected error when Artopay API fails');
    assert.match(caughtError.message, /500 Internal Server Error/);
    assert.ok(!caughtError.message.includes(TEST_SECRET), 'Error message must not leak secret key');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Fake / Tampered Signature Rejection
  // --------------------------------------------------------------------------
  await test('2. Fake Signature: Webhook call with invalid signature is rejected (401)', async () => {
    const order = await gateway.createCheckoutOrder({
      customerName: 'Budi Hartono',
      customerEmail: 'budi@tumpang.shop',
      items: [{ id: 'ITM-02', name: 'Madu Alami', price: 120000, quantity: 1 }]
    });

    const fakePayload = JSON.stringify({
      event: 'payment.success',
      event_id: `EVT-${Date.now()}-1`,
      data: {
        payment_id: order.paymentId,
        order_id: order.orderId,
        gross_amount: order.grossAmount,
        status: 'PAID'
      }
    });

    const result = await gateway.handleWebhook(fakePayload, 'fake_forged_hmac_signature_999');

    assert.equal(result.statusCode, 401);
    assert.equal(result.success, false);
    assert.match(result.message, /Invalid Artopay webhook signature/);

    const freshOrder = gateway.getOrder(order.orderId);
    assert.equal(freshOrder?.status, 'PENDING', 'Order must stay PENDING when signature is fake');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Nominal / Amount Mismatch Rejection
  // --------------------------------------------------------------------------
  await test('3. Nominal Mismatch: Paid amount does not match expected unique code total', async () => {
    const order = await gateway.createCheckoutOrder({
      customerName: 'Citra Dewi',
      customerEmail: 'citra@tumpang.shop',
      items: [{ id: 'ITM-03', name: 'Kopi Tumpang Robusta', price: 75000, quantity: 1 }]
    });

    // Pay incorrect amount (e.g. base amount without unique code)
    const tamperedAmount = order.baseAmount;
    assert.notEqual(tamperedAmount, order.grossAmount);

    const mismatchPayload = JSON.stringify({
      event: 'payment.success',
      event_id: `EVT-${Date.now()}-2`,
      data: {
        payment_id: order.paymentId,
        order_id: order.orderId,
        gross_amount: tamperedAmount,
        status: 'PAID'
      }
    });

    const signature = signPayload(mismatchPayload);
    const result = await gateway.handleWebhook(mismatchPayload, signature);

    assert.equal(result.statusCode, 422);
    assert.equal(result.success, false);
    assert.match(result.message, /mismatch/i);

    const freshOrder = gateway.getOrder(order.orderId);
    assert.equal(freshOrder?.status, 'AMOUNT_MISMATCH');
    assert.ok(freshOrder?.disputeReason?.includes(`Expected Rp ${order.grossAmount}`));
  });

  // --------------------------------------------------------------------------
  // TEST 4: Duplicate Callback / Replay Attack Idempotency
  // --------------------------------------------------------------------------
  await test('4. Duplicate Callback: Idempotent handling of retransmitted event_id', async () => {
    const order = await gateway.createCheckoutOrder({
      customerName: 'Deni Saputra',
      customerEmail: 'deni@tumpang.shop',
      items: [{ id: 'ITM-04', name: 'Beras Organik', price: 150000, quantity: 1 }]
    });

    const eventId = `EVT-REPLAY-${Date.now()}`;
    const payload = JSON.stringify({
      event: 'payment.success',
      event_id: eventId,
      data: {
        payment_id: order.paymentId,
        order_id: order.orderId,
        gross_amount: order.grossAmount,
        status: 'PAID',
        paid_at: new Date().toISOString()
      }
    });

    const signature = signPayload(payload);

    // First arrival
    const firstResult = await gateway.handleWebhook(payload, signature);
    assert.equal(firstResult.statusCode, 200);
    assert.equal(firstResult.success, true);
    assert.equal(firstResult.isDuplicate, undefined);

    const paidOrder = gateway.getOrder(order.orderId);
    assert.equal(paidOrder?.status, 'PAID');

    // Second arrival (Replay / Network retry)
    const secondResult = await gateway.handleWebhook(payload, signature);
    assert.equal(secondResult.statusCode, 200);
    assert.equal(secondResult.success, true);
    assert.equal(secondResult.isDuplicate, true);
    assert.match(secondResult.message, /already processed/);
  });

  // --------------------------------------------------------------------------
  // TEST 5: Concurrent Checkout Unique Code Collision Prevention
  // --------------------------------------------------------------------------
  await test('5. Concurrent Checkout: 50 simultaneous checkouts get unique non-colliding totals', async () => {
    const promises: Promise<ShopOrder>[] = [];
    const identicalBasePrice = 85000;

    for (let i = 0; i < 50; i++) {
      promises.push(
        gateway.createCheckoutOrder({
          customerName: `Customer ${i}`,
          customerEmail: `cust${i}@test.com`,
          items: [{ id: 'ITM-CONC', name: 'Item Bersama', price: identicalBasePrice, quantity: 1 }]
        })
      );
    }

    const createdOrders = await Promise.all(promises);
    const allocatedCodes = new Set<number>();
    const allocatedGrossAmounts = new Set<number>();

    for (const ord of createdOrders) {
      assert.equal(ord.baseAmount, identicalBasePrice);
      assert.ok(ord.uniqueCode >= 100 && ord.uniqueCode <= 9999, 'Code must be valid');
      assert.equal(ord.grossAmount, ord.baseAmount + ord.uniqueCode);

      assert.ok(
        !allocatedCodes.has(ord.uniqueCode),
        `Collision detected! Code ${ord.uniqueCode} was allocated more than once concurrently`
      );

      allocatedCodes.add(ord.uniqueCode);
      allocatedGrossAmounts.add(ord.grossAmount);
    }

    assert.equal(allocatedCodes.size, 50, 'All 50 unique codes must be unique');
    assert.equal(allocatedGrossAmounts.size, 50, 'All 50 gross amounts must be unique');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Invalid / Unknown Payment Status Handling
  // --------------------------------------------------------------------------
  await test('6. Invalid Status: Unrecognized payment statuses do not mark order as PAID', async () => {
    const order = await gateway.createCheckoutOrder({
      customerName: 'Eka Wijaya',
      customerEmail: 'eka@tumpang.shop',
      items: [{ id: 'ITM-06', name: 'Teh Hijau', price: 40000, quantity: 1 }]
    });

    const invalidStatusPayload = JSON.stringify({
      event: 'payment.unknown',
      event_id: `EVT-${Date.now()}-INV`,
      data: {
        payment_id: order.paymentId,
        order_id: order.orderId,
        gross_amount: order.grossAmount,
        status: 'SOME_ILLEGAL_STATUS_UNKNOWN'
      }
    });

    const signature = signPayload(invalidStatusPayload);
    const result = await gateway.handleWebhook(invalidStatusPayload, signature);

    assert.equal(result.statusCode, 400);
    assert.equal(result.success, false);
    assert.match(result.message, /unhandled payment status/i);

    const freshOrder = gateway.getOrder(order.orderId);
    assert.equal(freshOrder?.status, 'PENDING');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Production Simulation Strict Guard
  // --------------------------------------------------------------------------
  await test('7. Production Simulation Guard: Blocked in production environment', async () => {
    const order = await gateway.createCheckoutOrder({
      customerName: 'Ferry Salim',
      customerEmail: 'ferry@tumpang.shop',
      items: [{ id: 'ITM-07', name: 'Gula Aren', price: 35000, quantity: 1 }]
    });

    // Case A: Missing authorization
    assert.throws(
      () => gateway.simulatePayment(order.orderId, false),
      /Unauthorized simulation/
    );

    // Case B: Production environment simulation attempt
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      assert.throws(
        () => gateway.simulatePayment(order.orderId, true),
        /SECURITY VIOLATION/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // --------------------------------------------------------------------------
  // TEST 8: Sensitive Data Leakage Protection
  // --------------------------------------------------------------------------
  await test('8. Secret Masking: API keys are masked and never printed raw in logs', async () => {
    const masked = mockAdapter.getMaskedKey();
    assert.ok(masked.startsWith('api_'), 'Masked key preserves prefix');
    assert.ok(masked.includes('****'), 'Masked key contains asterisks');
    assert.ok(!masked.includes(TEST_SECRET), 'Secret key must never be printed');
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite Fatal Exception:', err);
  process.exit(1);
});
