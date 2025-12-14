import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'muted'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Badge – label kecil untuk status (completed, pending, failed, dll).
 */
export function Badge({
  variant = 'default',
  className,
  children,
  ...rest
}: BadgeProps): React.ReactElement {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide'

  const variantClass: Record<BadgeVariant, string> = {
    default: 'bg-slate-800 text-slate-100 border border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/40',
    info: 'bg-sky-500/10 text-sky-300 border border-sky-500/40',
    outline: 'bg-transparent text-slate-200 border border-slate-600',
    muted: 'bg-slate-900 text-slate-400 border border-slate-800',
  }

  return (
    <span className={classNames(base, variantClass[variant], className)} {...rest}>
      {children}
    </span>
  )
}
