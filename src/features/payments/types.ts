// src/features/payments/types.ts

/**
 * Status pembayaran sesuai OpenAPI TenRusl:
 * enum: [pending, succeeded, failed]
 */
export type PaymentStatus = 'pending' | 'succeeded' | 'failed'

/**
 * Bentuk Payment yang dipakai di frontend (camelCase).
 */
export interface Payment {
  id: string
  provider: string
  providerRef: string
  amount: number
  currency: string
  status: PaymentStatus
  meta?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

/**
 * Bentuk Payment mentah dari API (snake_case).
 * Mengikuti components.schemas.Payment di OpenAPI TenRusl.
 */
export interface PaymentApiModel {
  id: string
  provider: string
  provider_ref: string
  amount: number
  currency: string
  status: PaymentStatus
  meta?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * Envelope response standar dari TenRusl:
 * { "data": { ...payment... } }
 *
 * (Catatan: ApiClient sudah otomatis mengambil field `data`,
 * jadi di kebanyakan tempat kamu cukup pakai PaymentApiModel saja.)
 */
export interface PaymentEnvelopeApi {
  data: PaymentApiModel
}

/**
 * Payload untuk POST /payments.
 * Wajib: provider, amount, currency.
 * Opsional: description, meta, metadata (alias untuk meta).
 */
export interface CreatePaymentPayload {
  provider: string
  amount: number
  currency: string
  description?: string
  meta?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Parameter untuk cek status:
 * GET /payments/{provider}/{provider_ref}/status
 */
export interface PaymentStatusQuery {
  provider: string
  providerRef: string
}

/**
 * Helper: konversi dari bentuk API (snake_case)
 * ke bentuk yang dipakai di frontend (camelCase).
 */
export function mapPaymentFromApi(api: PaymentApiModel): Payment {
  return {
    id: api.id,
    provider: api.provider,
    providerRef: api.provider_ref,
    amount: api.amount,
    currency: api.currency,
    status: api.status,
    meta: api.meta ?? null,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  }
}
