import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export type CardProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Card – container umum dengan border & padding.
 */
export function Card({ className, ...rest }: CardProps): React.ReactElement {
  return (
    <div
      className={classNames(
        'trpw-card bg-slate-950/80 border border-slate-800/80 rounded-xl shadow-sm',
        'backdrop-blur-sm',
        className,
      )}
      {...rest}
    />
  )
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...rest }: CardHeaderProps): React.ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col gap-1 border-b border-slate-800 px-4 py-3 sm:px-5 sm:py-4',
        className,
      )}
      {...rest}
    />
  )
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, ...rest }: CardTitleProps): React.ReactElement {
  return (
    <h2
      className={classNames(
        'text-sm font-semibold leading-tight text-slate-50 sm:text-base',
        className,
      )}
      {...rest}
    />
  )
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...rest }: CardDescriptionProps): React.ReactElement {
  return <p className={classNames('text-xs text-slate-400 sm:text-sm', className)} {...rest} />
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...rest }: CardContentProps): React.ReactElement {
  return <div className={classNames('px-4 py-3 sm:px-5 sm:py-4', className)} {...rest} />
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, ...rest }: CardFooterProps): React.ReactElement {
  return (
    <div
      className={classNames(
        'flex items-center justify-end gap-2 border-t border-slate-800 px-4 py-2.5 sm:px-5 sm:py-3',
        className,
      )}
      {...rest}
    />
  )
}
