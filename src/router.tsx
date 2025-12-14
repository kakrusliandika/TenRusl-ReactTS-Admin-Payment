// src/router.tsx
/* eslint-disable react-refresh/only-export-components */

import React from 'react'
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import AppLayout from './AppLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import PaymentsPage from './features/payments/pages/PaymentsPage'
import UsersPage from './features/users/pages/UsersPage'

/**
 * Error boundary sederhana untuk route-level error.
 * Ini yang akan menggantikan "Unexpected Application Error!" default
 * dari React Router dengan tampilan yang lebih rapi.
 */
function RootErrorBoundary(): React.ReactElement {
  const error = useRouteError()

  let title = 'Unexpected application error'
  let message = 'Something went wrong. Please try again.'

  if (isRouteErrorResponse(error)) {
    title = error.statusText || title
    message = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    message = error.message || message
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-slate-400">{message}</p>
        <p className="text-xs text-slate-500 mt-2">
          If this keeps happening, try refreshing the page or checking the browser console for more
          details.
        </p>
      </div>
    </div>
  )
}

/**
 * Router utama TenRusl Admin:
 * - Shell ada di AppLayout
 * - Children: Dashboard (/), Payments (/payments), Users (/users)
 * - Fallback path: * → DashboardPage
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: '*',
        element: <DashboardPage />,
      },
    ],
  },
])
