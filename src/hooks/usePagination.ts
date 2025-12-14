// src/hooks/usePagination.ts
import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationOptions {
  /**
   * Halaman awal (1-based). Default: 1.
   */
  initialPage?: number
  /**
   * Jumlah item per halaman awal. Default: 10.
   */
  initialPageSize?: number
  /**
   * Total item awal. Default: 0.
   */
  initialTotal?: number
  /**
   * Minimum pageSize yang diizinkan. Default: 1.
   */
  minPageSize?: number
}

export interface UsePaginationResult {
  page: number
  pageSize: number
  total: number
  /**
   * Jumlah total halaman (minimal 1).
   */
  pageCount: number
  /**
   * Apakah bisa ke halaman berikutnya.
   */
  canNextPage: boolean
  /**
   * Apakah bisa ke halaman sebelumnya.
   */
  canPreviousPage: boolean
  /**
   * Pindah ke halaman berikutnya (jika memungkinkan).
   */
  nextPage: () => void
  /**
   * Pindah ke halaman sebelumnya (jika memungkinkan).
   */
  previousPage: () => void
  /**
   * Set halaman tertentu (akan di-clamp ke range [1, pageCount]).
   */
  setPage: (page: number) => void
  /**
   * Ubah ukuran halaman (akan re-clamp page sesuai total).
   */
  setPageSize: (size: number) => void
  /**
   * Update total items (biasanya dari API response).
   */
  setTotal: (total: number) => void
  /**
   * Offset 0-based untuk dipakai di query API (skip/offset).
   */
  offset: number
  /**
   * Limit yang bisa dipakai langsung di API, sama dengan pageSize.
   */
  limit: number
}

/**
 * usePagination – hook logika pagination reusable.
 *
 * Contoh:
 *   const {
 *     page, pageSize, total, nextPage, previousPage, setTotal
 *   } = usePagination({ initialPageSize: 20 })
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const { initialPage = 1, initialPageSize = 10, initialTotal = 0, minPageSize = 1 } = options

  const [page, setPageState] = useState<number>(initialPage < 1 ? 1 : initialPage)
  const [pageSize, setPageSizeState] = useState<number>(
    initialPageSize < minPageSize ? minPageSize : initialPageSize,
  )
  const [total, setTotalState] = useState<number>(initialTotal < 0 ? 0 : initialTotal)

  const pageCount = useMemo(() => {
    if (pageSize <= 0) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  const safeSetPage = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return
      const clamped = Math.min(Math.max(1, Math.floor(value)), pageCount)
      setPageState(clamped)
    },
    [pageCount],
  )

  const setPageSize = useCallback(
    (size: number) => {
      if (!Number.isFinite(size)) return
      const safe = Math.max(minPageSize, Math.floor(size) || minPageSize)
      setPageSizeState(safe)
      // Sesuaikan page supaya tidak lewat dari pageCount baru
      setPageState((currentPage) => {
        const newPageCount = Math.max(1, Math.ceil(total / safe || 1))
        return Math.min(currentPage, newPageCount)
      })
    },
    [minPageSize, total],
  )

  const setTotal = useCallback(
    (value: number) => {
      const sanitized = value < 0 ? 0 : Math.floor(value) || 0
      setTotalState(sanitized)
      // clamp page jika total mengecil
      setPageState((currentPage) => {
        if (pageSize <= 0) return 1
        const newPageCount = Math.max(1, Math.ceil(sanitized / pageSize || 1))
        return Math.min(currentPage, newPageCount)
      })
    },
    [pageSize],
  )

  const nextPage = useCallback(() => {
    setPageState((current) => Math.min(current + 1, pageCount))
  }, [pageCount])

  const previousPage = useCallback(() => {
    setPageState((current) => Math.max(current - 1, 1))
  }, [])

  const canNextPage = page < pageCount
  const canPreviousPage = page > 1

  const offset = (page - 1) * pageSize
  const limit = pageSize

  return {
    page,
    pageSize,
    total,
    pageCount,
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
    setPage: safeSetPage,
    setPageSize,
    setTotal,
    offset,
    limit,
  }
}
