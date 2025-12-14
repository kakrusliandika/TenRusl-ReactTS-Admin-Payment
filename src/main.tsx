// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { I18nProvider } from './i18n'
import { ToastProvider } from './components/ui/Toast'

import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('#root element not found in index.html')
}

/**
 * Root render:
 * - I18nProvider → menyediakan konteks bahasa (t, setLocale, dll)
 * - ToastProvider → global toast/notification
 * - RouterProvider → seluruh halaman di-handle React Router
 *
 * React.StrictMode hanya aktif di dev untuk bantu deteksi side-effect yang tidak aman.
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </I18nProvider>
  </React.StrictMode>,
)
