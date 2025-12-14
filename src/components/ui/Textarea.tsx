import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  optional?: boolean
}

/**
 * Textarea – versi multi-baris untuk deskripsi, catatan, dsb.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, label, helperText, error, optional = false, className, rows = 4, ...rest }, ref) => {
    const textareaId = id || rest.name || undefined
    const hasError = Boolean(error)

    const describedByIds: string[] = []
    if (helperText) describedByIds.push(`${textareaId}-helper`)
    if (error) describedByIds.push(`${textareaId}-error`)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="flex items-center gap-1 text-xs font-medium text-slate-200"
          >
            <span>{label}</span>
            {optional && (
              <span className="text-[0.7rem] font-normal text-slate-500">(optional)</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={classNames(
            'block w-full rounded-md border bg-slate-950/80 px-3 py-2 text-sm text-slate-50 shadow-sm',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            hasError
              ? 'border-rose-500/80 focus-visible:ring-rose-500'
              : 'border-slate-700 hover:border-slate-500',
            'resize-y',
            className,
          )}
          aria-invalid={hasError || undefined}
          aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
          {...rest}
        />

        {helperText && !error && (
          <p
            id={textareaId ? `${textareaId}-helper` : undefined}
            className="text-[0.7rem] text-slate-400"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={textareaId ? `${textareaId}-error` : undefined}
            className="text-[0.7rem] text-rose-400"
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
