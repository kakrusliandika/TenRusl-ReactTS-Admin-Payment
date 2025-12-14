import React from 'react'
import { Button } from './Button'
import { formatNumber } from '../../lib/format'

export interface PaginationProps {
  /** Halaman saat ini (1-based). */
  page: number
  /** Jumlah item per halaman. */
  pageSize: number
  /** Total item di server. */
  total: number
  /** Dipanggil ketika user pindah halaman. */
  onPageChange: (page: number) => void
  /** Optional: label kiri-kecil; default "Rows per page". */
  rowsPerPageLabel?: string
  /** Optional: apakah disabled (mis. saat loading). */
  disabled?: boolean
}

/**
 * Pagination – kontrol prev/next dengan info "Page X of Y".
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  rowsPerPageLabel = 'Rows per page',
  disabled = false,
}: PaginationProps): React.ReactElement {
  const totalPages = Math.max(1, Math.ceil(total / pageSize || 1))
  const currentPage = Math.min(Math.max(1, page), totalPages)

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  const handlePrev = () => {
    if (!canPrev || disabled) return
    onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (!canNext || disabled) return
    onPageChange(currentPage + 1)
  }

  return (
    <div className="flex flex-col items-center justify-between gap-2 px-1 py-2 text-xs text-slate-400 sm:flex-row sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-block">{rowsPerPageLabel}:</span>
        <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200">
          {formatNumber(pageSize)}
        </span>
        <span className="hidden text-slate-500 sm:inline-block">
          • {formatNumber(total)} total rows
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[0.75rem] text-slate-400">
          Page {formatNumber(currentPage)} of {formatNumber(totalPages)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handlePrev}
            disabled={!canPrev || disabled}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleNext}
            disabled={!canNext || disabled}
            aria-label="Next page"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  )
}
