// src/test/features/payments/PaymentsTable.test.tsx

import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentsTable } from '../../../features/payments/components/PaymentsTable'
import { usePaymentsStore } from '../../../features/payments/store'
import { paymentsFixture, getPaymentsFixtureClone } from '../../fixtures/payments'
import { I18nProvider } from '../../../i18n'
import { ToastProvider } from '../../../components/ui/Toast'

/**
 * Helper render dengan provider yang sama seperti di aplikasi:
 * - I18nProvider → supaya useT/useI18n tidak error
 * - ToastProvider → supaya useToast tidak error
 */
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <I18nProvider initialLocaleCode="en">{ui}</I18nProvider>
    </ToastProvider>,
  )
}

describe('PaymentsTable', () => {
  beforeEach(() => {
    // Reset store sebelum tiap test
    usePaymentsStore.setState((state) => ({
      ...state,
      payments: [],
      isCreating: false,
      isRefreshing: false,
      error: null,
    }))
  })

  it('merender daftar payments dari store', () => {
    usePaymentsStore.setState((state) => ({
      ...state,
      payments: getPaymentsFixtureClone(),
    }))

    renderWithProviders(<PaymentsTable />)

    // Beberapa provider dari fixture muncul (boleh lebih dari satu node)
    expect(screen.getAllByText(/xendit/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/midtrans/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/tripay/i).length).toBeGreaterThan(0)

    // Kolom status juga muncul
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/succeeded/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/failed/i).length).toBeGreaterThan(0)
  })

  it('menerapkan pagination (hanya sebagian payment tampil di halaman pertama)', () => {
    // buat 15 payment berdasarkan fixture pertama
    const manyPayments = Array.from({ length: 15 }).map((_, idx) => ({
      ...paymentsFixture[0],
      id: `pay_test_${idx}`,
      providerRef: `REF_${idx}`,
    }))

    usePaymentsStore.setState((state) => ({
      ...state,
      payments: manyPayments,
    }))

    renderWithProviders(<PaymentsTable />)

    // default pageSize = 10 → hanya 10 ref pertama yang muncul
    expect(screen.getByText('REF_0')).toBeInTheDocument()
    expect(screen.getByText('REF_9')).toBeInTheDocument()

    // REF_10 belum ada di halaman pertama
    expect(screen.queryByText('REF_10')).not.toBeInTheDocument()
  })

  it('memiliki tombol reset filter (sebagai kontrol refresh/filter)', () => {
    usePaymentsStore.setState((state) => ({
      ...state,
      payments: getPaymentsFixtureClone(),
    }))

    renderWithProviders(<PaymentsTable />)

    // PaymentFilterBar menampilkan tombol "Reset filters"
    const resetButton = screen.getByRole('button', {
      name: /reset filters/i,
    })

    expect(resetButton).toBeInTheDocument()
  })
})
