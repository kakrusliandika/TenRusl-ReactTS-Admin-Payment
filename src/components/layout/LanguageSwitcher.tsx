import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { SUPPORTED_LOCALES } from '../../i18n/locales'

export default function LanguageSwitcher(): React.ReactElement {
  const { code, locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Tutup dropdown kalau klik di luar atau tekan ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (event.target instanceof Node && containerRef.current.contains(event.target)) {
        return
      }
      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  const handleSelect = (newCode: typeof code) => {
    setLocale(newCode)
    setOpen(false)
  }

  const current = locale

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 pl-1 pr-2 text-xs text-slate-200 shadow-sm hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-950">
          <img src={current.flagSrc} alt={current.flagAlt} className="h-full w-full object-cover" />
        </span>
        <span className="hidden max-w-[80px] truncate sm:inline-block">{current.label}</span>
        <span aria-hidden="true" className="inline-block text-[0.6rem] text-slate-400">
          ▼
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select language"
          className="absolute right-0 z-40 mt-2 w-40 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-lg"
        >
          <ul className="max-h-72 overflow-y-auto py-1 text-xs">
            {SUPPORTED_LOCALES.map((item) => {
              const isActive = item.code === code
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(item.code)}
                    className={[
                      'flex w-full items-center gap-2 px-2 py-1.5 text-left',
                      isActive ? 'bg-slate-800 text-slate-50' : 'text-slate-200 hover:bg-slate-900',
                    ].join(' ')}
                  >
                    <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                      <img
                        src={item.flagSrc}
                        alt={item.flagAlt}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span aria-hidden="true" className="ml-auto text-[0.7rem] text-sky-400">
                        ●
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
