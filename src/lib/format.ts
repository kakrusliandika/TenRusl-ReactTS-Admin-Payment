/**
 * Coba ambil locale default dari browser, kalau tidak ada pakai 'en-US'.
 */
function getDefaultLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language
  }
  return 'en-US'
}

/**
 * Format angka sebagai mata uang dengan Intl.NumberFormat.
 *
 * Contoh:
 *  formatCurrency(125000, 'IDR') → "Rp125.000,00" (di id-ID)
 *  formatCurrency(19.9, 'USD', 'en-US') → "$19.90"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string,
  locale?: string,
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '-'
  }

  const usedLocale = locale || getDefaultLocale()

  try {
    return new Intl.NumberFormat(usedLocale, {
      style: 'currency',
      currency,
      // Supaya tampilan lebih “billing-friendly”: 2 decimal default.
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback kalau Intl tidak support currency tertentu.
    return `${currency} ${amount.toLocaleString(usedLocale)}`
  }
}

/**
 * Helper khusus untuk Rupiah.
 *
 * Contoh:
 *  formatIdr(15000) → "Rp15.000,00"
 */
export function formatIdr(amount: number | null | undefined): string {
  return formatCurrency(amount, 'IDR', 'id-ID')
}

/**
 * Format angka biasa dengan grouping (1.000, 2.500, dst).
 */
export function formatNumber(value: number | null | undefined, locale?: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  const usedLocale = locale || getDefaultLocale()

  try {
    return new Intl.NumberFormat(usedLocale, {
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return value.toString()
  }
}

/**
 * Format timestamp (string ISO atau Date) ke format tanggal + waktu yang enak dibaca.
 *
 * Contoh:
 *  formatDateTime('2025-12-07T12:34:56Z', 'id-ID')
 */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  locale?: string,
): string {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const usedLocale = locale || getDefaultLocale()

  try {
    return new Intl.DateTimeFormat(usedLocale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: undefined,
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

/**
 * Format tanggal saja (tanpa waktu).
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  locale?: string,
): string {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const usedLocale = locale || getDefaultLocale()

  try {
    return new Intl.DateTimeFormat(usedLocale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

/**
 * Format relative time sederhana (misalnya “3 minutes ago”, “in 2 hours”).
 *
 * Ini optional helper untuk dashboard / log.
 */
export function formatRelativeTime(
  from: Date | string | number,
  to: Date | string | number = new Date(),
  locale?: string,
): string {
  const fromDate = from instanceof Date ? from : new Date(from)
  const toDate = to instanceof Date ? to : new Date(to)

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return '-'
  }

  const diffMs = fromDate.getTime() - toDate.getTime()
  const diffSec = Math.round(diffMs / 1000)

  const usedLocale = locale || getDefaultLocale()

  const rtf = new Intl.RelativeTimeFormat(usedLocale, { numeric: 'auto' })

  const absSec = Math.abs(diffSec)
  if (absSec < 60) return rtf.format(Math.round(diffSec), 'second')

  const diffMin = Math.round(diffSec / 60)
  const absMin = Math.abs(diffMin)
  if (absMin < 60) return rtf.format(diffMin, 'minute')

  const diffHours = Math.round(diffMin / 60)
  const absHours = Math.abs(diffHours)
  if (absHours < 24) return rtf.format(diffHours, 'hour')

  const diffDays = Math.round(diffHours / 24)
  const absDays = Math.abs(diffDays)
  if (absDays < 30) return rtf.format(diffDays, 'day')

  const diffMonths = Math.round(diffDays / 30)
  const absMonths = Math.abs(diffMonths)
  if (absMonths < 12) return rtf.format(diffMonths, 'month')

  const diffYears = Math.round(diffMonths / 12)
  return rtf.format(diffYears, 'year')
}
