/* eslint-disable react-refresh/only-export-components */
// src/components/ui/Toast.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Spinner } from './Spinner'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
  /**
   * Durasi tampil dalam ms. Default: 4000ms.
   * Jika 0 atau negatif, toast tidak auto-close.
   */
  durationMs?: number
  /**
   * Kalau true, tampilkan spinner kecil (mis. sedang memproses).
   */
  loading?: boolean
}

export interface Toast extends Required<Omit<ToastOptions, 'durationMs'>> {
  durationMs: number
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void
  showSuccess: (message: string, description?: string) => void
  showError: (message: string, description?: string) => void
  showInfo: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export interface ToastProviderProps {
  children: ReactNode
  /**
   * Durasi default toast (ms).
   */
  defaultDurationMs?: number
}

let globalToastId = 0

function createToastId(): string {
  globalToastId += 1
  return `toast_${globalToastId}`
}

/**
 * ToastProvider – bungkus di sekitar <App /> atau RouterProvider.
 */
export function ToastProvider({
  children,
  defaultDurationMs = 4000,
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? createToastId()
      const durationMs =
        typeof options.durationMs === 'number' ? options.durationMs : defaultDurationMs

      const toast: Toast = {
        id,
        title: options.title ?? '',
        description: options.description ?? '',
        variant: options.variant ?? 'info',
        durationMs,
        loading: options.loading ?? false,
      }

      setToasts((current) => [...current, toast])

      if (durationMs > 0 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          removeToast(id)
        }, durationMs)
      }
    },
    [defaultDurationMs, removeToast],
  )

  const showSuccess = useCallback(
    (message: string, description?: string) => {
      showToast({
        title: message,
        description,
        variant: 'success',
      })
    },
    [showToast],
  )

  const showError = useCallback(
    (message: string, description?: string) => {
      showToast({
        title: message,
        description,
        variant: 'error',
      })
    },
    [showToast],
  )

  const showInfo = useCallback(
    (message: string, description?: string) => {
      showToast({
        title: message,
        description,
        variant: 'info',
      })
    },
    [showToast],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess,
      showError,
      showInfo,
    }),
    [showToast, showSuccess, showError, showInfo],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook utama untuk memicu toast.
 *
 * const { showSuccess, showError } = useToast()
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

export interface ToastViewportProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

/**
 * ToastViewport – container posisi kanan atas.
 * Ini otomatis di-render dari dalam ToastProvider.
 */
function ToastViewport({ toasts, onDismiss }: ToastViewportProps): React.ReactElement | null {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>(toasts)

  useEffect(() => {
    setVisibleToasts(toasts)
  }, [toasts])

  if (!visibleToasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end px-4 py-4 sm:inset-x-auto sm:right-0 sm:top-4 sm:px-4">
      {/* aria-live untuk accessibility: screen reader bisa baca notifikasi */}
      <div
        className="flex w-full max-w-sm flex-col gap-2"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {visibleToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps): React.ReactElement {
  const { id, title, description, variant, loading } = toast

  const base =
    'pointer-events-auto w-full rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm transition-transform duration-150 ease-out sm:px-3.5 sm:py-2.5'

  const variantClass: Record<ToastVariant, string> = {
    success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-50',
    error: 'border-rose-500/40 bg-rose-950/80 text-rose-50',
    info: 'border-sky-500/40 bg-sky-950/80 text-sky-50',
  }

  const icon = variant === 'success' ? '✔' : variant === 'error' ? '⚠' : 'ℹ'

  const role = variant === 'error' ? 'alert' : 'status'

  return (
    <div className={classNames(base, variantClass[variant])} role={role}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-base sm:text-lg" aria-hidden="true">
          {loading ? <Spinner size={14} accent /> : icon}
        </div>
        <div className="flex-1">
          {title && (
            <div className="text-xs font-semibold leading-snug sm:text-sm sm:leading-snug">
              {title}
            </div>
          )}
          {description && (
            <div className="mt-0.5 text-[0.7rem] leading-snug text-slate-200/90 sm:text-xs">
              {description}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-[0.8rem] text-slate-100 hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
