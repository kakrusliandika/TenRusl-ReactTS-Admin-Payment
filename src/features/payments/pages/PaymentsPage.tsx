// src/features/payments/pages/PaymentsPage.tsx

import React from 'react'
import { useT } from '../../../i18n'
import { CreatePaymentForm } from '../components/CreatePaymentForm'
import { PaymentsTable } from '../components/PaymentsTable'
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcuts'

/**
 * PaymentsPage – halaman manajemen payments.
 *
 * Menggabungkan:
 *  - CreatePaymentForm (form buat payment baru)
 *  - PaymentsTable (tabel + filter bar untuk daftar payments)
 */
export default function PaymentsPage(): React.ReactElement {
  const t = useT()

  const formRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  // Shortcut: Ctrl+Shift+N → fokus ke form create payment
  useKeyboardShortcut('Ctrl+Shift+N', (event) => {
    event.preventDefault()
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  })

  // Shortcut: Ctrl+Shift+L → fokus ke daftar payments
  useKeyboardShortcut('Ctrl+Shift+L', (event) => {
    event.preventDefault()
    if (listRef.current) {
      listRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  })

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Intro atas halaman */}
      <section className="space-y-1">
        <p className="text-xs text-slate-400 sm:text-sm">
          {t(
            'payments.page.intro',
            'Create simulated payments and inspect their lifecycle across different providers.',
          )}
        </p>
        <p className="text-[0.7rem] text-slate-500 sm:text-xs">
          {t(
            'payments.page.shortcuts',
            'Keyboard shortcuts: Ctrl+Shift+N to jump to the create form, Ctrl+Shift+L to jump to the payments list.',
          )}
        </p>
      </section>

      {/* Grid utama: form + list */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Kolom kiri: form create payment */}
        <div ref={formRef} className="scroll-mt-24">
          <CreatePaymentForm />
        </div>

        {/* Kolom kanan: tabel payments (sudah termasuk PaymentFilterBar di dalamnya) */}
        <div ref={listRef} className="scroll-mt-24">
          <PaymentsTable />
        </div>
      </section>
    </div>
  )
}
