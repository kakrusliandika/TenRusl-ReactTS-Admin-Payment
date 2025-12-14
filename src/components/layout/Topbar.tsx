import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useT } from '../../i18n'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'tenrusl_admin_theme'

function detectInitialTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'dark'

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }

    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch {
    // ignore storage / matchMedia errors
  }

  return 'dark'
}

function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = theme

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore storage error
  }
}

function getPageTitleKey(pathname: string): string {
  if (pathname === '/' || pathname === '') {
    return 'dashboard.title'
  }
  if (pathname.startsWith('/payments')) {
    return 'payments.title'
  }
  if (pathname.startsWith('/users')) {
    // kalau nanti ada file users.json, bisa ganti ke 'users.title'
    return 'common.nav.users'
  }
  return 'dashboard.title'
}

function getEnvLabel(): string | null {
  const appEnv = import.meta.env.VITE_APP_ENV
  if (!appEnv) return null
  return appEnv.toString().toUpperCase()
}

export default function Topbar(): React.ReactElement {
  const t = useT()
  const location = useLocation()
  const [theme, setTheme] = useState<ThemeMode>(() => detectInitialTheme())
  const envLabel = getEnvLabel()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const pageTitleKey = getPageTitleKey(location.pathname)
  const pageTitle =
    pageTitleKey === 'common.nav.users'
      ? t('common.nav.users', 'Users')
      : t(pageTitleKey, 'Dashboard')

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold tracking-tight text-slate-50 sm:text-base">
            {pageTitle}
          </h1>
          {envLabel && (
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-400">
              {envLabel}
            </span>
          )}
        </div>
        <p className="hidden text-xs text-slate-400 sm:block">
          {location.pathname.startsWith('/payments')
            ? t(
                'payments.subtitle',
                'Create and inspect simulated payments across multiple providers.',
              )
            : location.pathname.startsWith('/users')
              ? t('common.layout.sidebarSubTitle', 'Manage users and access for the simulator.')
              : t('dashboard.subtitle', 'High-level snapshot of your payment activity.')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-200 shadow-sm hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label={t('common.layout.themeToggle', 'Toggle light and dark theme')}
        >
          <span className="text-base" aria-hidden="true">
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </div>
  )
}
