// src/test/fixtures/payments.ts

import type { Payment, PaymentStatus } from '../../features/payments/types'

/**
 * Helper untuk membuat objek Payment fixture.
 */
function makePayment(partial: Partial<Payment> & Pick<Payment, 'id'>): Payment {
  const now = new Date().toISOString()

  return {
    id: partial.id,
    provider: partial.provider ?? 'xendit',
    providerRef: partial.providerRef ?? 'REF-123',
    amount: partial.amount ?? 100_000,
    currency: partial.currency ?? 'IDR',
    status: partial.status ?? ('pending' as PaymentStatus),
    meta: partial.meta ?? null,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  }
}

/**
 * Satu payment pending di Xendit.
 */
export const paymentPendingXendit: Payment = makePayment({
  id: 'pay_xendit_pending_1',
  provider: 'xendit',
  providerRef: 'XENDIT-INV-001',
  amount: 150_000,
  currency: 'IDR',
  status: 'pending',
  meta: {
    order_id: 'ORDER-001',
  },
})

/**
 * Satu payment sukses di Midtrans.
 */
export const paymentSucceededMidtrans: Payment = makePayment({
  id: 'pay_midtrans_succeeded_1',
  provider: 'midtrans',
  providerRef: 'MID-TRX-001',
  amount: 250_000,
  currency: 'IDR',
  status: 'succeeded',
  meta: {
    order_id: 'ORDER-002',
  },
})

/**
 * Satu payment gagal di Tripay.
 */
export const paymentFailedTripay: Payment = makePayment({
  id: 'pay_tripay_failed_1',
  provider: 'tripay',
  providerRef: 'TRIPAY-FAIL-001',
  amount: 75_000,
  currency: 'IDR',
  status: 'failed',
  meta: {
    order_id: 'ORDER-003',
    reason: 'EXPIRED',
  },
})

/**
 * Payment multi-currency contoh (USD).
 */
export const paymentSucceededUsdStripe: Payment = makePayment({
  id: 'pay_stripe_usd_1',
  provider: 'stripe',
  providerRef: 'STR-USD-001',
  amount: 19_99, // misal 19.99 USD
  currency: 'USD',
  status: 'succeeded',
  meta: {
    product: 'demo-plan',
  },
})

/**
 * Array utama fixture payments yang bisa dipakai di banyak test.
 */
export const paymentsFixture: Payment[] = [
  paymentPendingXendit,
  paymentSucceededMidtrans,
  paymentFailedTripay,
  paymentSucceededUsdStripe,
]

/**
 * Helper untuk dapatkan salinan deep-ish (supaya aman dimutasi di test).
 */
export function getPaymentsFixtureClone(): Payment[] {
  return paymentsFixture.map((p) => ({
    ...p,
    meta: p.meta ? { ...p.meta } : p.meta,
  }))
}
