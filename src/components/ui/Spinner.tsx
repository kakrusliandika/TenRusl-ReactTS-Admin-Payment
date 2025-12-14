// src/components/ui/Spinner.tsx
import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Ukuran spinner (px).
   * Default: 16 (h-4 w-4).
   */
  size?: number
  /**
   * Kalau true, akan pakai warna aksen (sky),
   * kalau false pakai warna teks default (slate).
   */
  accent?: boolean
}

/**
 * Spinner – indikator loading simpel.
 */
export function Spinner({
  size = 16,
  accent = false,
  className,
  ...rest
}: SpinnerProps): React.ReactElement {
  const dimensionClass =
    size <= 16 ? 'h-4 w-4' : size <= 20 ? 'h-5 w-5' : size <= 24 ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <div
      role="status"
      className={classNames('inline-flex items-center justify-center', className)}
      {...rest}
    >
      <span
        className={classNames(
          'inline-block animate-spin rounded-full border-2 border-t-transparent',
          dimensionClass,
          accent ? 'border-sky-400/80' : 'border-slate-300/70',
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
