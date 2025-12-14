// src/features/payments/components/PaymentsTable.tsx

import React from 'react'
import { useT } from '../../../i18n'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/Card'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../../../components/ui/Table'
import { Pagination } from '../../../components/ui/Pagination'
import { Spinner } from '../../../components/ui/Spinner'
import { Button } from '../../../components/ui/Button'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { PaymentFilterBar, type PaymentFilterState } from './PaymentFilterBar'
import { usePaymentsStore } from '../store'
import { usePagination } from '../../../hooks/usePagination'
import { formatIdr, formatCurrency, formatDateTime } from '../../../lib/format'
import type { Payment } from '../types'
import { useToast } from '../../../hooks/useToast'

interface ProviderDisplay {
  label: string
  logoSrc: string
}

const PROVIDER_DISPLAY: Record<string, ProviderDisplay> = {
  xendit: { label: 'Xendit', logoSrc: '/img/providers/xendit.png' },
  midtrans: { label: 'Midtrans', logoSrc: '/img/providers/midtrans.png' },
  tripay: { label: 'Tripay', logoSrc: '/img/providers/tripay.png' },
  mock: { label: 'Mock', logoSrc: '/img/providers/mock.png' },
  airwallex: { label: 'Airwallex', logoSrc: '/img/providers/airwallex.png' },
  paypal: { label: 'PayPal', logoSrc: '/img/providers/paypal.png' },
  stripe: { label: 'Stripe', logoSrc: '/img/providers/stripe.png' },
  skrill: { label: 'Skrill', logoSrc: '/img/providers/skrill.png' },
  payoneer: { label: 'Payoneer', logoSrc: '/img/providers/payoneer.png' },
  paddle: { label: 'Paddle', logoSrc: '/img/providers/paddle.png' },
  oy: { label: 'OY!', logoSrc: '/img/providers/oy.png' },
  dana: { label: 'DANA', logoSrc: '/img/providers/dana.png' },
  doku: { label: 'DOKU', logoSrc: '/img/providers/doku.png' },
  lemonsqueezy: {
    label: 'Lemon Squeezy',
    logoSrc: '/img/providers/lemonsqueezy.png',
  },
  amazon_bwp: {
    label: 'Amazon BWP',
    logoSrc: '/img/providers/amazon_bwp.png',
  },
}

function getProviderDisplay(provider: string): ProviderDisplay {
  const normalized = provider.toLowerCase()
  return (
    PROVIDER_DISPLAY[normalized] ?? {
      label: provider || 'Unknown',
      logoSrc: '/img/providers/mock.png',
    }
  )
}

function filterPayments(payments: Payment[], filters: PaymentFilterState): Payment[] {
  const { provider, status, dateFrom, dateTo } = filters

  return payments.filter((payment) => {
    if (provider && payment.provider !== provider) return false
    if (status && payment.status !== status) return false

    if (dateFrom) {
      const from = new Date(dateFrom)
      const createdAt = new Date(payment.createdAt)
      if (createdAt < from) return false
    }

    if (dateTo) {
      const to = new Date(dateTo)
      // include seluruh hari dateTo
      to.setHours(23, 59, 59, 999)
      const createdAt = new Date(payment.createdAt)
      if (createdAt > to) return false
    }

    return true
  })
}

/**
 * PaymentsTable – tampilan utama daftar transaksi.
 * Mengambil data dari Payments store, punya filter, pagination,
 * logo provider, dan tombol refresh status.
 */
export function PaymentsTable(): React.ReactElement {
  const t = useT()
  const { showError, showSuccess } = useToast()
  const { payments, isCreating, isRefreshing, refreshPaymentStatus } = usePaymentsStore()

  const [filters, setFilters] = React.useState<PaymentFilterState>({
    provider: '',
    status: '',
    dateFrom: null,
    dateTo: null,
  })

  const [refreshingId, setRefreshingId] = React.useState<string | null>(null)

  const filteredPayments = React.useMemo(
    () => filterPayments(payments, filters),
    [payments, filters],
  )

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    initialTotal: filteredPayments.length,
  })

  React.useEffect(() => {
    pagination.setTotal(filteredPayments.length)
    pagination.setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPayments.length])

  const { offset, limit, page, pageSize, setPage } = pagination

  const paginatedPayments = React.useMemo(
    () => filteredPayments.slice(offset, offset + limit),
    [filteredPayments, offset, limit],
  )

  const isBusy = isCreating || isRefreshing
  const hasData = filteredPayments.length > 0

  const handleRefreshStatus = async (payment: Payment) => {
    if (!payment.provider || !payment.providerRef) {
      showError(
        t('payments.refresh.error.missingRefTitle', 'Cannot refresh status'),
        t(
          'payments.refresh.error.missingRefBody',
          'This payment does not have a provider reference ID.',
        ),
      )
      return
    }

    setRefreshingId(payment.id)

    const updated = await refreshPaymentStatus({
      provider: payment.provider,
      providerRef: payment.providerRef,
    })

    setRefreshingId(null)

    if (!updated) {
      showError(
        t('payments.refresh.error.title', 'Failed to refresh payment status'),
        t(
          'payments.refresh.error.body',
          'The simulator could not fetch the latest status. Please try again.',
        ),
      )
      return
    }

    showSuccess(
      t('payments.refresh.success.title', 'Payment status updated'),
      t(
        'payments.refresh.success.body',
        'The latest status was fetched successfully from the simulator.',
      ),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('payments.table.title', 'Payments')}</CardTitle>
        <CardDescription>
          {t('payments.table.subtitle', 'List of simulated payments created via the webhook demo.')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Filter bar */}
        <PaymentFilterBar value={filters} onChange={setFilters} isBusy={isBusy} />

        {/* Table / state */}
        {isBusy && payments.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size={24} accent />
          </div>
        ) : !hasData ? (
          <p className="py-6 text-center text-[0.8rem] text-slate-400">
            {t(
              'payments.table.empty',
              'No payments found. Try adjusting filters or create a new payment.',
            )}
          </p>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t('payments.table.columns.id', 'ID')}</TableHeaderCell>
                  <TableHeaderCell>
                    {t('payments.table.columns.provider', 'Provider')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {t('payments.table.columns.providerRef', 'Provider ref')}
                  </TableHeaderCell>
                  <TableHeaderCell>{t('payments.table.columns.amount', 'Amount')}</TableHeaderCell>
                  <TableHeaderCell>{t('payments.table.columns.status', 'Status')}</TableHeaderCell>
                  <TableHeaderCell>
                    {t('payments.table.columns.createdAt', 'Created at')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {t('payments.table.columns.actions', 'Actions')}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map((payment) => {
                  const providerDisplay = getProviderDisplay(payment.provider)
                  const isRowRefreshing = refreshingId === payment.id || isRefreshing

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-[0.7rem]">{payment.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={providerDisplay.logoSrc}
                            alt={providerDisplay.label}
                            className="h-5 w-5 rounded-sm bg-slate-900 object-contain"
                            loading="lazy"
                          />
                          <span className="text-[0.8rem]">
                            {t(`payments.providers.${payment.provider}`, providerDisplay.label)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[0.75rem] text-slate-400">
                        {payment.providerRef || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {payment.currency === 'IDR'
                          ? formatIdr(payment.amount)
                          : formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[0.75rem] text-slate-300">
                        {formatDateTime(payment.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isRowRefreshing}
                          onClick={() => void handleRefreshStatus(payment)}
                          aria-label={t(
                            'payments.table.actions.refreshAria',
                            'Refresh payment status',
                          )}
                        >
                          {isRowRefreshing ? (
                            <span className="inline-flex items-center gap-1 text-[0.7rem]">
                              <Spinner size={12} accent />
                              <span>{t('payments.table.actions.refreshing', 'Refreshing…')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[0.75rem]">
                              <span aria-hidden="true">↻</span>
                              <span>{t('payments.table.actions.refresh', 'Refresh status')}</span>
                            </span>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="mt-2">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredPayments.length}
                onPageChange={setPage}
                disabled={isBusy}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
