// src/test/features/payments/CreatePaymentForm.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatePaymentForm } from '../../../features/payments/components/CreatePaymentForm'
import { usePaymentsStore } from '../../../features/payments/store'
import { paymentsFixture } from '../../fixtures/payments'
import { I18nProvider } from '../../../i18n'

// Mock useToast supaya tidak butuh provider Toast
vi.mock('../../../hooks/useToast', () => {
  return {
    useToast: () => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      dismiss: vi.fn(),
    }),
  }
})

/**
 * Helper render dengan I18nProvider,
 * supaya useT/useI18n tidak error.
 */
function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nProvider initialLocaleCode="en">{ui}</I18nProvider>)
}

describe('CreatePaymentForm', () => {
  const mockCreatePayment = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset & stub store Payments
    usePaymentsStore.setState((state) => ({
      ...state,
      payments: [],
      isCreating: false,
      error: null,
      createPayment: mockCreatePayment,
      clearError: mockClearError,
    }))
  })

  it('menampilkan error validasi ketika field wajib kosong dan tidak memanggil createPayment', async () => {
    const user = userEvent.setup()

    renderWithProviders(<CreatePaymentForm />)

    // Langsung submit tanpa isi apa pun
    const submitButton = screen.getByRole('button', {
      name: /create payment/i,
    })
    await user.click(submitButton)

    // Provider wajib
    expect(await screen.findByText(/provider is required/i)).toBeInTheDocument()

    // Amount > 0
    expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument()

    // Tidak ada panggilan ke createPayment
    expect(mockCreatePayment).not.toHaveBeenCalled()
  })

  it('memanggil createPayment dengan payload yang benar saat form valid', async () => {
    const user = userEvent.setup()

    // Stub createPayment mengembalikan satu payment valid
    mockCreatePayment.mockResolvedValueOnce(paymentsFixture[0])

    renderWithProviders(<CreatePaymentForm />)

    const providerSelect = screen.getByLabelText(/provider/i)
    const amountInput = screen.getByLabelText(/amount/i)
    const currencySelect = screen.getByLabelText(/currency/i)
    const orderIdInput = screen.getByLabelText(/order id/i)

    // Isi form
    await user.selectOptions(providerSelect, 'xendit')

    await user.clear(amountInput)
    await user.type(amountInput, '150000')

    await user.selectOptions(currencySelect, 'IDR')

    await user.type(orderIdInput, 'ORDER-TEST-001')

    const submitButton = screen.getByRole('button', {
      name: /create payment/i,
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalledTimes(1)
    })

    const [payload, options] = mockCreatePayment.mock.calls[0]

    expect(payload).toMatchObject({
      provider: 'xendit',
      amount: 150000,
      currency: 'IDR',
      meta: { order_id: 'ORDER-TEST-001' },
    })

    // Idempotency key harus dikirim
    expect(options).toBeDefined()
    expect(options.idempotencyKey).toBeDefined()
    expect(typeof options.idempotencyKey).toBe('string')
    expect(options.idempotencyKey.length).toBeGreaterThan(0)
  })
})
