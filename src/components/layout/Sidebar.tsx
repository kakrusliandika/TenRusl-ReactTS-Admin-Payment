import React from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../../i18n'

const GITHUB_REPO_URL = 'https://github.com/kakrusliandika/TenRusl-ReactTS-Admin-Payment'

interface NavItem {
  to: string
  labelKey: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'common.nav.dashboard' },
  { to: '/payments', labelKey: 'common.nav.payments' },
  { to: '/users', labelKey: 'common.nav.users' },
]

export default function Sidebar(): React.ReactElement {
  const t = useT()

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-800 bg-slate-950/80">
      {/* Logo + title */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/30">
          {/* Logo utama, fallback ke inisial kalau logo.svg belum ada */}
          <img
            src="/logo.svg"
            alt={t('common.appName', 'TenRusl Admin')}
            className="h-6 w-6"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
            }}
          />
          <span className="pointer-events-none select-none text-sm font-semibold text-sky-400">
            TR
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-slate-50">
            {t('common.appName', 'TenRusl Admin')}
          </span>
          <span className="text-xs text-slate-400">
            {t('common.appDescription', 'Admin console for the TenRusl Payment Webhook Simulator.')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label={t('common.layout.sidebarTitle', 'Navigation')}
        className="flex-1 overflow-y-auto px-2 py-3"
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-slate-50 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-50',
                  ].join(' ')
                }
                end={item.to === '/'}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-[0.7rem] text-slate-400">
                  {item.to === '/' ? '🏠' : item.to === '/payments' ? '💳' : '👤'}
                </span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: link ke GitHub */}
      <div className="border-t border-slate-800 px-3 py-3 text-xs text-slate-500">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-900 hover:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900">
              <span className="text-[0.8rem]">◆</span>
            </span>
            <span className="truncate">{t('common.appName', 'TenRusl Admin')}</span>
          </span>
          <span className="ml-2 text-[0.7rem] uppercase tracking-wide text-slate-400">GitHub</span>
        </a>
      </div>
    </div>
  )
}
