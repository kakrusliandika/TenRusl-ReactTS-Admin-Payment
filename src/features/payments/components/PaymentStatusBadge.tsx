// src/features/payments/components/PaymentStatusBadge.tsx
import React from 'react'
import type { PaymentStatus } from '../types'
import { Badge } from '../../../components/ui/Badge'
import { useT } from '../../../i18n'

function classNames(...classes: Array<string | null | false | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface PaymentStatusBadgeProps {
  status: PaymentStatus | string
  className?: string
}

/**
 * Mapping status → varian Badge.
 */
function getBadgeVariant(
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

  if (normalized === 'refunded' || normalized === 'partial_refund') {
    return 'info'
  }

  return 'muted'
}

/**
 * PaymentStatusBadge – badge kecil untuk status payment.
 */
export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps): React.ReactElement {
  const t = useT()
  const normalized = String(status || '').toLowerCase() || 'unknown'
  const variant = getBadgeVariant(normalized)

  const labelKey = `payments.status.${normalized}`
  const label = t(labelKey, status || 'Unknown')

  return (
    <Badge variant={variant} className={classNames('capitalize', className)}>
      {label}
    </Badge>
  )
}
