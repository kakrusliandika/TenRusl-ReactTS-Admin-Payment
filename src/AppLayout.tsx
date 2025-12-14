import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Breadcrumbs from './components/layout/Breadcrumbs'
import LanguageSwitcher from './components/layout/LanguageSwitcher'

export default function AppLayout(): React.ReactElement {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-sky-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (hidden on small screens, can be replaced with a drawer later) */}
        <aside className="hidden border-r border-slate-800 bg-slate-950/80 backdrop-blur-sm md:flex md:w-64">
          <Sidebar />
        </aside>

        {/* Main column */}
        <div className="flex flex-1 flex-col">
          {/* Topbar + breadcrumbs */}
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6">
              <Topbar />
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="px-4 pb-3 sm:px-6">
              <Breadcrumbs pathname={location.pathname} />
            </div>
          </header>

          {/* Main content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
