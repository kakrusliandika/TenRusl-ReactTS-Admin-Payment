// src/features/payments/components/PaymentFilterBar.tsx
import React from 'react'
import { Select } from '../../../components/ui/Select'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useT } from '../../../i18n'

/**
 * Bentuk state filter yang dipakai PaymentsTable.
 */
export interface PaymentFilterState {
  provider: string
  status: string
  dateFrom: string | null
  dateTo: string | null
}

export interface PaymentFilterBarProps {
  value: PaymentFilterState
  onChange: (next: PaymentFilterState) => void
  /**
   * Jika true, tombol/field yang meng-trigger fetch bisa di-disable.
   */
  isBusy?: boolean
}

const PROVIDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All providers' },
  { value: 'xendit', label: 'Xendit' },
  { value: 'midtrans', label: 'Midtrans' },
  { value: 'tripay', label: 'Tripay' },
  { value: 'mock', label: 'Mock' },
  { value: 'airwallex', label: 'Airwallex' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'skrill', label: 'Skrill' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'paddle', label: 'Paddle' },
  { value: 'oy', label: 'OY!' },
  { value: 'dana', label: 'DANA' },
  { value: 'doku', label: 'DOKU' },
  { value: 'lemonsqueezy', label: 'Lemon Squeezy' },
  { value: 'amazon_bwp', label: 'Amazon BWP' },
]

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
]

export function PaymentFilterBar({
  value,
  onChange,
  isBusy = false,
}: PaymentFilterBarProps): React.ReactElement {
  const t = useT()

  const handleChange = (patch: Partial<PaymentFilterState>) => {
    onChange({
      ...value,
      ...patch,
    })
  }

  const handleReset = () => {
    onChange({
      provider: '',
      status: '',
      dateFrom: null,
      dateTo: null,
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-4">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Provider filter */}
        <Select
          label={t('payments.filters.provider.label', 'Provider')}
          value={value.provider}
          onChange={(event) => handleChange({ provider: event.target.value })}
          options={PROVIDER_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(`payments.providers.${opt.value || 'all'}`, opt.label),
          }))}
          placeholder={t('payments.filters.provider.placeholder', 'All providers')}
        />

        {/* Status filter */}
        <Select
          label={t('payments.filters.status.label', 'Status')}
          value={value.status}
          onChange={(event) => handleChange({ status: event.target.value })}
          options={STATUS_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(`payments.status.${opt.value || 'all'}`, opt.label),
          }))}
          placeholder={t('payments.filters.status.placeholder', 'All statuses')}
        />

        {/* Date range: from/to */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="date"
              label={t('payments.filters.dateFrom.label', 'From')}
              value={value.dateFrom ?? ''}
              onChange={(event) =>
                handleChange({
                  dateFrom: event.target.value || null,
                })
              }
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              label={t('payments.filters.dateTo.label', 'To')}
              value={value.dateTo ?? ''}
              onChange={(event) =>
                handleChange({
                  dateTo: event.target.value || null,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-end justify-start gap-2 sm:flex-col sm:items-end sm:justify-center">
        <Button type="button" size="sm" variant="outline" onClick={handleReset} disabled={isBusy}>
          {t('payments.filters.reset', 'Reset filters')}
        </Button>
      </div>
    </div>
  )
}
