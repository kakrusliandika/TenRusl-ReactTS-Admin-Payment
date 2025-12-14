import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  optional?: boolean
  /**
   * Opsi untuk dropdown, selain anak `<option>` manual.
   */
  options?: SelectOption[]
  /**
   * Placeholder yang muncul sebagai option disabled di paling atas.
   */
  placeholder?: string
}

/**
 * Select – dropdown form standar, cocok untuk provider, status, dsb.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      optional = false,
      className,
      options,
      placeholder,
      children,
      ...rest
    },
    ref,
  ) => {
    const selectId = id || rest.name || undefined
    const hasError = Boolean(error)

    const describedByIds: string[] = []
    if (helperText) describedByIds.push(`${selectId}-helper`)
    if (error) describedByIds.push(`${selectId}-error`)

    const showPlaceholder = placeholder && (rest.value === '' || typeof rest.value === 'undefined')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-1 text-xs font-medium text-slate-200"
          >
            <span>{label}</span>
            {optional && (
              <span className="text-[0.7rem] font-normal text-slate-500">(optional)</span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={classNames(
              'block w-full appearance-none rounded-md border bg-slate-950/80 px-3 py-2 pr-8 text-sm text-slate-50 shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              hasError
                ? 'border-rose-500/80 focus-visible:ring-rose-500'
                : 'border-slate-700 hover:border-slate-500',
              'cursor-pointer',
              className,
            )}
            aria-invalid={hasError || undefined}
            aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
            {...rest}
          >
            {showPlaceholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Arrow icon */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[0.7rem] text-slate-400"
          >
            ▼
          </span>
        </div>

        {helperText && !error && (
          <p
            id={selectId ? `${selectId}-helper` : undefined}
            className="text-[0.7rem] text-slate-400"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={selectId ? `${selectId}-error` : undefined}
            className="text-[0.7rem] text-rose-400"
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
