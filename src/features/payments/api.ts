// src/features/payments/api.ts

import { apiClient } from '../../lib/api-client'
import type { CreatePaymentPayload, Payment, PaymentApiModel, PaymentStatusQuery } from './types'
import { mapPaymentFromApi } from './types'

export interface CreatePaymentOptions {
  idempotencyKey?: string
  requestId?: string
  signal?: AbortSignal
}

export interface GetPaymentStatusOptions {
  requestId?: string
  signal?: AbortSignal
}

/**
 * Helper: susun headers tambahan untuk request.
 * - Idempotency-Key → untuk POST /payments
 * - X-Request-ID    → override X-Request-ID default dari ApiClient (opsional)
 */
function buildHeaders(
  opts?:
    | (Pick<CreatePaymentOptions, 'idempotencyKey' | 'requestId'> &
        Pick<GetPaymentStatusOptions, 'requestId'>)
    | null,
): Record<string, string> | undefined {
  const headers: Record<string, string> = {}

  if (opts?.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey
  }

  if (opts?.requestId) {
    headers['X-Request-ID'] = opts.requestId
  }

  return Object.keys(headers).length ? headers : undefined
}

/**
 * POST /payments   (secara penuh: POST /api/v1/payments)
 *
 * Base URL sudah diset di apiClient (VITE_API_BASE_URL),
 * jadi di sini cukup pakai path relatif `/payments`.
 */
export async function createPayment(
  payload: CreatePaymentPayload,
  options: CreatePaymentOptions = {},
): Promise<Payment> {
  const headers = buildHeaders(options)

  const result = await apiClient.post<PaymentApiModel>('/payments', payload, {
    headers,
    signal: options.signal,
  })

  if (!result.ok) {
    // Lempar ApiError yang dibawa ApiResult supaya bisa ditangani di UI.
    throw result.error
  }

  return mapPaymentFromApi(result.data)
}

/**
 * GET /payments/{provider}/{provider_ref}/status
 * (secara penuh: GET /api/v1/payments/{provider}/{provider_ref}/status)
 */
export async function getPaymentStatus(
  query: PaymentStatusQuery,
  options: GetPaymentStatusOptions = {},
): Promise<Payment> {
  const { provider, providerRef } = query
  const headers = buildHeaders(options)

  const path = `/payments/${encodeURIComponent(provider)}/${encodeURIComponent(providerRef)}/status`

  const result = await apiClient.get<PaymentApiModel>(path, {
    headers,
    signal: options.signal,
  })

  if (!result.ok) {
    throw result.error
  }

  return mapPaymentFromApi(result.data)
}
