// src/features/payments/store.ts

import { create } from 'zustand'
import type { Payment, CreatePaymentPayload, PaymentStatusQuery } from './types'
import { createPayment, getPaymentStatus } from './api'
import type { ApiError } from '../../types/api'

/**
 * Helper: ambil pesan error yang paling berguna dari ApiError.
 */
function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError | undefined

  if (!apiError || typeof apiError !== 'object') {
    return 'Unexpected error when communicating with payment API.'
  }

  // ApiClient sudah mengisi apiError.message dengan:
  // - message dari body (kalau ada)
  // - atau statusText
  // - atau fallback "Request failed with status XXX"
  if (apiError.message) {
    return apiError.message
  }

  // Kalau raw berisi objek dengan message, pakai itu
  const raw = apiError.raw as { message?: string } | undefined
  if (raw?.message) {
    return raw.message
  }

  return 'Unexpected error when communicating with payment API.'
}

/**
 * Shape utama store Payments.
 */
export interface PaymentsState {
  payments: Payment[]
  isCreating: boolean
  isRefreshing: boolean
  error: string | null

  /** Cari payment di state berdasarkan id. */
  getById: (id: string) => Payment | undefined

  /** Cari payment di state berdasarkan provider + providerRef. */
  getByProviderRef: (provider: string, providerRef: string) => Payment | undefined

  /** Reset pesan error global. */
  clearError: () => void

  /**
   * Buat payment baru via POST /payments.
   * - Men-set isCreating selama request berlangsung.
   * - Jika sukses: upsert ke array payments (prepend).
   * - Jika gagal: set error dan mengembalikan null.
   */
  createPayment: (
    payload: CreatePaymentPayload,
    options?: {
      idempotencyKey?: string
      requestId?: string
      signal?: AbortSignal
    },
  ) => Promise<Payment | null>

  /**
   * Refresh status payment via GET /payments/{provider}/{provider_ref}/status.
   * - Menggunakan provider + providerRef supaya kompatibel dengan API TenRusl.
   * - Jika payment belum ada di state, akan ditambahkan.
   */
  refreshPaymentStatus: (
    query: PaymentStatusQuery,
    options?: {
      requestId?: string
      signal?: AbortSignal
    },
  ) => Promise<Payment | null>
}

/**
 * Zustand store untuk fitur Payments.
 */
export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  isCreating: false,
  isRefreshing: false,
  error: null,

  getById: (id: string) => {
    return get().payments.find((p) => p.id === id)
  },

  getByProviderRef: (provider: string, providerRef: string) => {
    return get().payments.find((p) => p.provider === provider && p.providerRef === providerRef)
  },

  clearError: () => {
    set({ error: null })
  },

  async createPayment(payload, options) {
    set({ isCreating: true, error: null })

    try {
      const payment = await createPayment(payload, {
        idempotencyKey: options?.idempotencyKey,
        requestId: options?.requestId,
        signal: options?.signal,
      })

      set((state) => {
        const existingIndex = state.payments.findIndex((p) => p.id === payment.id)

        let nextPayments: Payment[]
        if (existingIndex === -1) {
          nextPayments = [payment, ...state.payments]
        } else {
          nextPayments = [...state.payments]
          nextPayments[existingIndex] = payment
        }

        return {
          payments: nextPayments,
          isCreating: false,
        }
      })

      return payment
    } catch (error) {
      const message = getErrorMessage(error)
      set({
        error: message,
        isCreating: false,
      })
      return null
    }
  },

  async refreshPaymentStatus(query, options) {
    set({ isRefreshing: true, error: null })

    try {
      const payment = await getPaymentStatus(query, {
        requestId: options?.requestId,
        signal: options?.signal,
      })

      set((state) => {
        const existingIndex = state.payments.findIndex((p) => p.id === payment.id)

        let nextPayments: Payment[]
        if (existingIndex === -1) {
          nextPayments = [payment, ...state.payments]
        } else {
          nextPayments = [...state.payments]
          nextPayments[existingIndex] = payment
        }

        return {
          payments: nextPayments,
          isRefreshing: false,
        }
      })

      return payment
    } catch (error) {
      const message = getErrorMessage(error)
      set({
        error: message,
        isRefreshing: false,
      })
      return null
    }
  },
}))
