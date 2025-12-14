export type LocaleCode =
  | 'en'
  | 'id'
  | 'ar'
  | 'de'
  | 'es'
  | 'hi'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'ru'
  | 'th'
  | 'zh'

export type TextDirection = 'ltr' | 'rtl'

export interface LocaleDefinition {
  /** Short code used by translations and HTML lang attribute. */
  code: LocaleCode
  /** Human readable name shown in the language switcher. */
  label: string
  /** Path to the flag icon inside public/ (served from root). */
  flagSrc: string
  /** Accessible text for the flag icon. */
  flagAlt: string
  /** Text direction: left-to-right or right-to-left. */
  direction: TextDirection
}

/**
 * Ordered list of locales as they should appear in the UI.
 * Make sure every entry has a corresponding flag under /public/flags.
 */
export const SUPPORTED_LOCALES: LocaleDefinition[] = [
  {
    code: 'en',
    label: 'English',
    flagSrc: '/flags/en.png',
    flagAlt: 'Flag of English language',
    direction: 'ltr',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    flagSrc: '/flags/id.png',
    flagAlt: 'Bendera Indonesia',
    direction: 'ltr',
  },
  {
    code: 'ar',
    label: 'العربية',
    flagSrc: '/flags/ar.png',
    flagAlt: 'علم اللغة العربية',
    direction: 'rtl',
  },
  {
    code: 'de',
    label: 'Deutsch',
    flagSrc: '/flags/de.png',
    flagAlt: 'Flagge Deutschland',
    direction: 'ltr',
  },
  {
    code: 'es',
    label: 'Español',
    flagSrc: '/flags/es.png',
    flagAlt: 'Bandera de España',
    direction: 'ltr',
  },
  {
    code: 'hi',
    label: 'हिन्दी',
    flagSrc: '/flags/hi.png',
    flagAlt: 'Hindi flag',
    direction: 'ltr',
  },
  {
    code: 'ja',
    label: '日本語',
    flagSrc: '/flags/ja.png',
    flagAlt: '日本語の旗',
    direction: 'ltr',
  },
  {
    code: 'ko',
    label: '한국어',
    flagSrc: '/flags/ko.png',
    flagAlt: '한국어 국기',
    direction: 'ltr',
  },
  {
    code: 'pt',
    label: 'Português',
    flagSrc: '/flags/pt.png',
    flagAlt: 'Bandeira do Brasil/Portugal',
    direction: 'ltr',
  },
  {
    code: 'ru',
    label: 'Русский',
    flagSrc: '/flags/ru.png',
    flagAlt: 'Флаг русского языка',
    direction: 'ltr',
  },
  {
    code: 'th',
    label: 'ไทย',
    flagSrc: '/flags/th.png',
    flagAlt: 'ธงภาษาไทย',
    direction: 'ltr',
  },
  {
    code: 'zh',
    label: '中文',
    flagSrc: '/flags/zh.png',
    flagAlt: '中文旗帜',
    direction: 'ltr',
  },
]

/** Default language used when nothing else is specified. */
export const DEFAULT_LOCALE_CODE: LocaleCode = 'en'

/** Fallback language used when a key is missing in the active locale. */
export const FALLBACK_LOCALE_CODE: LocaleCode = 'en'

/**
 * Find a locale by exact code. Falls back to DEFAULT_LOCALE_CODE
 * when the provided code is not supported.
 */
export function getLocaleByCode(code: string | null | undefined): LocaleDefinition {
  const normalized = (code ?? '').toLowerCase() as LocaleCode
  const fromList =
    SUPPORTED_LOCALES.find((locale) => locale.code === normalized) ??
    SUPPORTED_LOCALES.find((locale) => locale.code === DEFAULT_LOCALE_CODE)

  if (!fromList) {
    // This should never happen unless SUPPORTED_LOCALES is empty.
    throw new Error('No locales configured in SUPPORTED_LOCALES')
  }

  return fromList
}

/**
 * Extract a supported LocaleCode from a browser language like "en-US" or "id-ID".
 */
export function matchSupportedLocale(browserLang: string | null | undefined): LocaleCode | null {
  if (!browserLang) return null

  const lowered = browserLang.toLowerCase()

  // Exact match first (e.g. "en", "id").
  const exact = SUPPORTED_LOCALES.find((locale) => locale.code === lowered)
  if (exact) return exact.code

  // Then try matching language part only (e.g. "en" from "en-US").
  const [langPart] = lowered.split('-')
  const byLang = SUPPORTED_LOCALES.find((locale) => locale.code === langPart)
  return byLang ? byLang.code : null
}

/** Convenience helper to check whether a locale is RTL. */
export function isRtlLocale(code: LocaleCode): boolean {
  const locale = getLocaleByCode(code)
  return locale.direction === 'rtl'
}
