// src/features/dashboard/DashboardPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../../i18n'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../../components/ui/Table'
import { formatNumber, formatIdr, formatCurrency, formatDateTime } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { usePaymentsStore } from '../payments/store'
import type { Payment } from '../payments/types'

interface RecentPayment {
  id: string
  provider: string
  providerRef?: string | null
  amount: number
  currency: string
  status: string
  createdAt: string
}

interface DashboardSummary {
  totalPayments: number
  completedCount: number
  pendingCount: number
  failedCount: number
  totalVolume: number
  mainCurrency: string
  lastUpdatedAt: string | null
  recentPayments: RecentPayment[]
  isLoading: boolean
  isError: boolean
}

function getMainCurrency(payments: Payment[]): string {
  if (!payments.length) return 'IDR'

  const counts = new Map<string, number>()
  for (const p of payments) {
    const curr = p.currency || 'IDR'
    counts.set(curr, (counts.get(curr) ?? 0) + 1)
  }

  let main = 'IDR'
  let max = 0
  for (const [curr, count] of counts.entries()) {
    if (count > max) {
      max = count
      main = curr
    }
  }

  return main
}

function getTotalVolumeForCurrency(payments: Payment[], mainCurrency: string): number {
  return payments
    .filter((p) => p.currency === mainCurrency && p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)
}

function getLastUpdatedAt(payments: Payment[]): string | null {
  if (!payments.length) return null

  let latestTime = 0
  let latestDate: string | null = null

  for (const p of payments) {
    const raw = p.updatedAt ?? p.createdAt
    const time = new Date(raw).getTime()
    if (Number.isFinite(time) && time > latestTime) {
      latestTime = time
      latestDate = raw
    }
  }

  return latestDate
}

function getRecentPayments(payments: Payment[], limit: number): RecentPayment[] {
  const sorted = [...payments].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return tb - ta
  })

  return sorted.slice(0, limit).map((p) => ({
    id: p.id,
    provider: p.provider,
    providerRef: p.providerRef,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt,
  }))
}

function useDashboardSummary(): DashboardSummary {
  const payments = usePaymentsStore((state) => state.payments)
  const isCreating = usePaymentsStore((state) => state.isCreating)
  const isRefreshing = usePaymentsStore((state) => state.isRefreshing)
  const error = usePaymentsStore((state) => state.error)

  return React.useMemo<DashboardSummary>(() => {
    const totalPayments = payments.length
    const completedCount = payments.filter((p) => p.status === 'succeeded').length
    const pendingCount = payments.filter((p) => p.status === 'pending').length
    const failedCount = payments.filter((p) => p.status === 'failed').length

    const mainCurrency = getMainCurrency(payments)
    const totalVolume = getTotalVolumeForCurrency(payments, mainCurrency)
    const lastUpdatedAt = getLastUpdatedAt(payments)
    const recentPayments = getRecentPayments(payments, 5)

    const isLoading = isCreating || isRefreshing
    const isError = Boolean(error)

    return {
      totalPayments,
      completedCount,
      pendingCount,
      failedCount,
      totalVolume,
      mainCurrency,
      lastUpdatedAt,
      recentPayments,
      isLoading,
      isError,
    }
  }, [payments, isCreating, isRefreshing, error])
}

function getStatusBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default' {
  const normalized = status.toLowerCase()

  if (normalized === 'succeeded' || normalized === 'completed' || normalized === 'success') {
    return 'success'
  }

  if (normalized === 'pending' || normalized === 'created' || normalized === 'processing') {
    return 'warning'
  }

  if (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'expired' ||
    normalized === 'chargeback'
  ) {
    return 'danger'
  }

  return 'muted'
}

export default function DashboardPage(): React.ReactElement {
  const t = useT()
  const navigate = useNavigate()
  const summary = useDashboardSummary()

  const {
    totalPayments,
    completedCount,
    pendingCount,
    failedCount,
    totalVolume,
    mainCurrency,
    lastUpdatedAt,
    recentPayments,
    isLoading,
    isError,
  } = summary

  const completionRate = totalPayments > 0 ? (completedCount / totalPayments) * 100 : 0
  const failureRate = totalPayments > 0 ? (failedCount / totalPayments) * 100 : 0
  const hasRecent = recentPayments.length > 0

  const safeCompletionRate = Math.min(completionRate, 100)
  const safeFailureRate = Math.min(failureRate, 100)

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header utama dashboard */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
            {t('dashboard.title', 'Overview')}
          </h1>
          <p className="mt-1 max-w-2xl text-[0.85rem] text-slate-400 sm:text-sm">
            {t(
              'dashboard.subtitle',
              'High-level snapshot of your payment flows across all providers.',
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" type="button" variant="outline" onClick={() => navigate('/payments')}>
            {t('payments.table.title', 'Go to Payments')}
          </Button>
        </div>
      </header>

      {/* Kartu ringkasan atas */}
      <section aria-label={t('dashboard.title', 'Overview')}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total payments */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cards.totalPayments.label', 'Total payments')}</CardTitle>
              <CardDescription>
                {t(
                  'dashboard.cards.totalPayments.helpText',
                  'All payments created via the simulator.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl">
                  {formatNumber(totalPayments)}
                </div>
                <div className="mt-1 text-[0.7rem] text-slate-400 sm:text-[0.75rem]">
                  {t('dashboard.meta.lastUpdated', 'Last updated')}
                  {': '}
                  {lastUpdatedAt
                    ? formatDateTime(lastUpdatedAt)
                    : t('common.status.empty', 'No data available')}
                </div>
              </div>
              {isLoading && <Spinner size={18} accent />}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cards.completed.label', 'Completed')}</CardTitle>
              <CardDescription>
                {t(
                  'dashboard.cards.completed.helpText',
                  'Payments that were processed successfully.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-semibold text-emerald-300 sm:text-3xl">
                    {formatNumber(completedCount)}
                  </div>
                  <div className="mt-1 text-[0.7rem] text-slate-400 sm:text-[0.75rem]">
                    {t('dashboard.cards.completed.metaLabel', 'Success rate')}
                    {totalPayments > 0 && (
                      <span className="ml-1 text-emerald-300/80">
                        · {safeCompletionRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                {totalPayments > 0 && (
                  <Badge variant="success">
                    {t('dashboard.cards.completed.label', 'Completed')}
                  </Badge>
                )}
              </div>

              {/* Progress bar completion rate */}
              {totalPayments > 0 && (
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${safeCompletionRate}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cards.pending.label', 'Pending')}</CardTitle>
              <CardDescription>
                {t(
                  'dashboard.cards.pending.helpText',
                  'Payments that are still waiting for confirmation.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold text-amber-300 sm:text-3xl">
                  {formatNumber(pendingCount)}
                </div>
                <div className="mt-1 text-[0.7rem] text-slate-400 sm:text-[0.75rem]">
                  {t('dashboard.cards.pending.metaLabel', 'Awaiting updates')}
                </div>
              </div>
              {pendingCount > 0 && (
                <Badge variant="warning">{t('payments.status.pending', 'Pending')}</Badge>
              )}
            </CardContent>
          </Card>

          {/* Failed */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cards.failed.label', 'Failed')}</CardTitle>
              <CardDescription>
                {t('dashboard.cards.failed.helpText', 'Payments that could not be completed.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-semibold text-rose-300 sm:text-3xl">
                    {formatNumber(failedCount)}
                  </div>
                  <div className="mt-1 text-[0.7rem] text-slate-400 sm:text-[0.75rem]">
                    {t('dashboard.cards.failed.metaLabel', 'Failure rate')}
                    {totalPayments > 0 && (
                      <span className="ml-1 text-rose-300/80">· {safeFailureRate.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
                {failedCount > 0 && (
                  <Badge variant="danger">{t('payments.status.failed', 'Failed')}</Badge>
                )}
              </div>

              {/* Progress bar failure rate */}
              {totalPayments > 0 && (
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{ width: `${safeFailureRate}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Baris kedua: Volume + recent payments */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Volume card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.cards.volume.label', 'Payment volume')}</CardTitle>
            <CardDescription>
              {t('dashboard.cards.volume.helpText', 'Total payment amount across all providers.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-slate-50 sm:text-3xl">
                {totalVolume > 0
                  ? mainCurrency === 'IDR'
                    ? formatIdr(totalVolume)
                    : formatCurrency(totalVolume, mainCurrency)
                  : formatCurrency(0, mainCurrency)}
              </div>
              <span className="text-xs uppercase tracking-wide text-slate-500">{mainCurrency}</span>
            </div>

            <p className="mt-2 text-[0.75rem] text-slate-400">
              {t('dashboard.charts.byProvider.empty', 'No data yet for provider breakdown.')}
            </p>
            {/* TODO: future enhancement – mini chart by provider */}
          </CardContent>
        </Card>

        {/* Recent payments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>{t('dashboard.recent.title', 'Recent payments')}</CardTitle>
              <CardDescription>
                {t('dashboard.recent.subtitle', 'Latest activity across all payment providers.')}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" type="button" onClick={() => navigate('/payments')}>
              {t('payments.table.title', 'View all')}
            </Button>
          </CardHeader>
          <CardContent>
            {isError && (
              <div className="mb-3 rounded-md border border-rose-500/40 bg-rose-950/60 px-3 py-2 text-[0.75rem] text-rose-100">
                {t('common.toast.genericError', 'An unexpected error occurred. Please try again.')}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size={24} accent />
              </div>
            ) : !hasRecent ? (
              <p className="py-6 text-center text-[0.8rem] text-slate-400">
                {t(
                  'dashboard.recent.empty',
                  'No recent payments. Create a new payment from the Payments page.',
                )}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>{t('payments.table.columns.id', 'ID')}</TableHeaderCell>
                      <TableHeaderCell>
                        {t('payments.table.columns.provider', 'Provider')}
                      </TableHeaderCell>
                      <TableHeaderCell>
                        {t('payments.table.columns.providerRef', 'Provider reference')}
                      </TableHeaderCell>
                      <TableHeaderCell>
                        {t('payments.table.columns.amount', 'Amount')}
                      </TableHeaderCell>
                      <TableHeaderCell>
                        {t('payments.table.columns.status', 'Status')}
                      </TableHeaderCell>
                      <TableHeaderCell>
                        {t('payments.table.columns.createdAt', 'Created at')}
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-[0.7rem]">{payment.id}</TableCell>
                        <TableCell>{payment.provider}</TableCell>
                        <TableCell className="text-[0.75rem] text-slate-400">
                          {payment.providerRef || '—'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {payment.currency === 'IDR'
                            ? formatIdr(payment.amount)
                            : formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {t(`payments.status.${payment.status}`, payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-[0.75rem] text-slate-300">
                          {formatDateTime(payment.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
