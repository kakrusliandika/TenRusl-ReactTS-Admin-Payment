import React from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../i18n'

export interface BreadcrumbsProps {
  pathname: string
}

interface Crumb {
  label: string
  to?: string
}

function buildBreadcrumbs(
  pathname: string,
  t: (key: string, defaultValue?: string) => string,
): Crumb[] {
  const trimmed = pathname.split('?')[0] || '/'
  if (trimmed === '/' || trimmed === '') {
    return [
      {
        label: t('common.nav.dashboard', 'Dashboard'),
      },
    ]
  }

  const segments = trimmed.replace(/^\/+/, '').split('/')
  const crumbs: Crumb[] = []

  // Home / Dashboard
  crumbs.push({
    label: t('common.nav.dashboard', 'Dashboard'),
    to: '/',
  })

  if (segments.length === 1) {
    const [first] = segments
    if (first === 'payments') {
      crumbs.push({
        label: t('common.nav.payments', 'Payments'),
      })
    } else if (first === 'users') {
      crumbs.push({
        label: t('common.nav.users', 'Users'),
      })
    } else {
      crumbs.push({
        label: first,
      })
    }

    return crumbs
  }

  // Multi-level path, contoh: /payments/123
  const [first, ...rest] = segments

  if (first === 'payments') {
    crumbs.push({
      label: t('common.nav.payments', 'Payments'),
      to: '/payments',
    })
  } else if (first === 'users') {
    crumbs.push({
      label: t('common.nav.users', 'Users'),
      to: '/users',
    })
  } else {
    crumbs.push({
      label: first,
      to: `/${first}`,
    })
  }

  // Sisanya dianggap detail / id
  let currentPath = `/${first}`
  for (const segment of rest) {
    currentPath += `/${segment}`

    const isLast = segment === rest[rest.length - 1]
    const label = isLast ? t('common.actions.details', 'Details') : segment

    crumbs.push({
      label,
      to: isLast ? undefined : currentPath,
    })
  }

  return crumbs
}

export default function Breadcrumbs({ pathname }: BreadcrumbsProps): React.ReactElement {
  const t = useT()
  const crumbs = buildBreadcrumbs(pathname, t)

  if (!crumbs.length) {
    return <nav aria-label="Breadcrumb" className="text-xs text-slate-400" />
  }

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const separator =
            index > 0 ? (
              <span key={`sep-${index}`} className="px-1 text-slate-600">
                /
              </span>
            ) : null

          const content =
            crumb.to && !isLast ? (
              <Link
                to={crumb.to}
                className="rounded px-1 py-0.5 text-slate-300 hover:bg-slate-900 hover:text-slate-100"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="rounded px-1 py-0.5 font-medium text-slate-200">{crumb.label}</span>
            )

          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {separator}
              {content}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
