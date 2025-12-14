// src/i18n/index.ts
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { LocaleCode, LocaleDefinition } from './locales'
import { FALLBACK_LOCALE_CODE } from './locales'
import {
  applyLocaleToDocument,
  detectInitialLocaleCode,
  ensureSupportedLocaleCode,
  resolveLocaleDefinition,
  storeLocaleCode,
} from './config'

// Import translation bundles.
// Pastikan di tsconfig.json ada `"resolveJsonModule": true`.
import enCommon from '../locales/en/common.json'
import enDashboard from '../locales/en/dashboard.json'
import enPayments from '../locales/en/payments.json'

import idCommon from '../locales/id/common.json'
import idDashboard from '../locales/id/dashboard.json'
import idPayments from '../locales/id/payments.json'

export type TranslationValue = string | TranslationRecord

export interface TranslationRecord {
  [key: string]: TranslationValue
}

/**
 * Namespaced messages untuk sebuah locale.
 * Contoh:
 * {
 *   common: { ... },
 *   dashboard: { ... },
 *   payments: { ... }
 * }
 */
export interface NamespacedMessages {
  [namespace: string]: TranslationRecord
}

/**
 * Bundles per locale code.
 *
 * EN dan ID punya file sendiri.
 * Locale lain untuk saat ini diarahkan ke bundle EN (fallback).
 */
const enMessages: NamespacedMessages = {
  common: enCommon as TranslationRecord,
  dashboard: enDashboard as TranslationRecord,
  payments: enPayments as TranslationRecord,
}

const idMessages: NamespacedMessages = {
  common: idCommon as TranslationRecord,
  dashboard: idDashboard as TranslationRecord,
  payments: idPayments as TranslationRecord,
}

const TRANSLATIONS: Record<LocaleCode, NamespacedMessages> = {
  en: enMessages,
  id: idMessages,
  ar: enMessages,
  de: enMessages,
  es: enMessages,
  hi: enMessages,
  ja: enMessages,
  ko: enMessages,
  pt: enMessages,
  ru: enMessages,
  th: enMessages,
  zh: enMessages,
}

/**
 * Ambil string dari nested object berdasarkan key bertitik:
 *   "common.appName"        -> messages.common.appName
 *   "payments.table.status" -> messages.payments.table.status
 */
function getNestedTranslation(
  messages: NamespacedMessages | undefined,
  key: string,
): string | undefined {
  if (!messages || !key) return undefined

  const segments = key.split('.')
  if (segments.length === 0) return undefined

  const [namespace, ...rest] = segments
  const ns = messages[namespace]
  if (!ns) return undefined

  let current: TranslationValue = ns

  for (const segment of rest) {
    if (typeof current === 'string') {
      // Sudah string tapi masih ada segment → key tidak valid.
      return undefined
    }

    const record = current as TranslationRecord
    const next = record[segment]
    if (typeof next === 'undefined') {
      return undefined
    }

    current = next
  }

  return typeof current === 'string' ? current : undefined
}

export interface I18nContextValue {
  /** Locale aktif, mis. "en" atau "id". */
  code: LocaleCode
  /** Definisi lengkap (label, flag, direction, dsb.). */
  locale: LocaleDefinition
  /**
   * Fungsi terjemahan:
   *   t('common.appName', 'TenRusl Admin')
   */
  t: (key: string, defaultValue?: string) => string
  /** Ganti locale aktif dan persist ke storage. */
  setLocale: (code: LocaleCode) => void
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export interface I18nProviderProps {
  children: ReactNode
  /** Opsional override awal; kalau tidak diset, akan autodetect. */
  initialLocaleCode?: LocaleCode
}

/**
 * Provider level atas:
 *  - menentukan locale awal (localStorage → browser language → default),
 *  - menyinkronkan <html lang/dir> + localStorage,
 *  - menyediakan t() + setLocale() ke seluruh app.
 */
export function I18nProvider(props: I18nProviderProps): React.ReactElement {
  const { children, initialLocaleCode } = props

  const [code, setCode] = useState<LocaleCode>(() => {
    if (initialLocaleCode) {
      return ensureSupportedLocaleCode(initialLocaleCode)
    }
    return detectInitialLocaleCode()
  })

  const locale = useMemo<LocaleDefinition>(() => resolveLocaleDefinition(code), [code])

  // Sinkronkan <html lang/dir> dan localStorage setiap kali locale berubah.
  useEffect(() => {
    applyLocaleToDocument(locale)
    storeLocaleCode(code)
  }, [code, locale])

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      const activeBundle = TRANSLATIONS[code]
      const fallbackBundle = TRANSLATIONS[FALLBACK_LOCALE_CODE]

      const fromActive = getNestedTranslation(activeBundle, key)
      if (typeof fromActive === 'string') return fromActive

      const fromFallback = getNestedTranslation(fallbackBundle, key)
      if (typeof fromFallback === 'string') return fromFallback

      // Terakhir: pakai defaultValue kalau ada, kalau tidak pakai key-nya sendiri.
      return defaultValue ?? key
    },
    [code],
  )

  const setLocale = useCallback((nextCode: LocaleCode) => {
    setCode(ensureSupportedLocaleCode(nextCode))
  }, [])

  const value: I18nContextValue = useMemo(
    () => ({
      code,
      locale,
      t,
      setLocale,
    }),
    [code, locale, t, setLocale],
  )

  // Gunakan createElement supaya file ini tetap .ts (tanpa JSX).
  return React.createElement(I18nContext.Provider, { value }, children)
}

/**
 * Hook untuk akses penuh context i18n (code, locale, t, setLocale).
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

/**
 * Hook singkat kalau hanya butuh fungsi t().
 */
export function useT(): I18nContextValue['t'] {
  return useI18n().t
}
