// src/components/ui/Table.tsx
import React from 'react'

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>

/**
 * Table – wrapper <table> dengan styling dasar.
 */
export function Table({ className, ...rest }: TableProps): React.ReactElement {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
      <table
        className={classNames(
          'min-w-full border-collapse text-left text-xs text-slate-200',
          className,
        )}
        {...rest}
      />
    </div>
  )
}

export type TableHeadProps = React.HTMLAttributes<HTMLTableSectionElement>

export function TableHead({ className, ...rest }: TableHeadProps): React.ReactElement {
  return <thead className={classNames('bg-slate-950/95', className)} {...rest} />
}

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

export function TableBody({ className, ...rest }: TableBodyProps): React.ReactElement {
  return <tbody className={classNames('divide-y divide-slate-800/80', className)} {...rest} />
}

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>

export function TableRow({ className, ...rest }: TableRowProps): React.ReactElement {
  return <tr className={classNames('hover:bg-slate-900/60', className)} {...rest} />
}

export type TableHeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement>

export function TableHeaderCell({ className, ...rest }: TableHeaderCellProps): React.ReactElement {
  return (
    <th
      className={classNames(
        'px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400',
        'border-b border-slate-800/80',
        className,
      )}
      {...rest}
    />
  )
}

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export function TableCell({ className, ...rest }: TableCellProps): React.ReactElement {
  return (
    <td
      className={classNames('px-3 py-2 align-middle text-[0.75rem] text-slate-200', className)}
      {...rest}
    />
  )
}
