import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /**
   * Teks kecil di bawah input untuk penjelasan tambahan.
   */
  helperText?: string
  /**
   * Pesan error yang akan men-trigger styling merah.
   */
  error?: string
  /**
   * Menandai field sebagai optional (default: false).
   */
  optional?: boolean
}

/**
 * Input – komponen input teks standar dengan label & error.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, helperText, error, optional = false, className, type = 'text', ...rest }, ref) => {
    const inputId = id || rest.name || undefined
    const hasError = Boolean(error)

    const describedByIds: string[] = []
    if (helperText) describedByIds.push(`${inputId}-helper`)
    if (error) describedByIds.push(`${inputId}-error`)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-xs font-medium text-slate-200"
          >
            <span>{label}</span>
            {optional && (
              <span className="text-[0.7rem] font-normal text-slate-500">(optional)</span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={classNames(
            'block w-full rounded-md border bg-slate-950/80 px-3 py-2 text-sm text-slate-50 shadow-sm',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            hasError
              ? 'border-rose-500/80 focus-visible:ring-rose-500'
              : 'border-slate-700 hover:border-slate-500',
            className,
          )}
          aria-invalid={hasError || undefined}
          aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
          {...rest}
        />

        {helperText && !error && (
          <p
            id={inputId ? `${inputId}-helper` : undefined}
            className="text-[0.7rem] text-slate-400"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p id={inputId ? `${inputId}-error` : undefined} className="text-[0.7rem] text-rose-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
