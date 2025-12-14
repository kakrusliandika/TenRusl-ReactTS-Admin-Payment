// src/test/utils/renderWithProviders.tsx

import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { I18nProvider } from '../../i18n'
import type { LocaleCode } from '../../i18n/locales'
import { ToastProvider } from '../../components/ui/Toast'

export interface ProvidersOptions {
  /**
   * Rute awal untuk MemoryRouter. Default: ['/'].
   */
  routeEntries?: MemoryRouterProps['initialEntries']
  /**
   * Locale awal untuk i18n. Default: 'en'.
   */
  initialLocaleCode?: LocaleCode
}

/**
 * Helper utama untuk render komponen dengan seluruh global provider:
 * - MemoryRouter (React Router)
 * - I18nProvider (multi-bahasa)
 * - ToastProvider (notifikasi)
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: ProvidersOptions & RenderOptions = {},
) {
  const { routeEntries = ['/'], initialLocaleCode = 'en', ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={routeEntries}>
        <I18nProvider initialLocaleCode={initialLocaleCode}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
