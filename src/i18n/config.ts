import {
  DEFAULT_LOCALE_CODE,
  FALLBACK_LOCALE_CODE,
  type LocaleCode,
  type LocaleDefinition,
  SUPPORTED_LOCALES,
  getLocaleByCode,
  matchSupportedLocale,
} from './locales'

export const LOCAL_STORAGE_KEY = 'tenrusl_admin_lang'

/**
 * Safely read the stored locale code from localStorage.
 * Returns null when not set or not accessible (e.g. SSR, privacy mode).
 */
export function getStoredLocaleCode(): LocaleCode | null {
  try {
    if (typeof window === 'undefined') return null

    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null

    const code = raw.toLowerCase() as LocaleCode
    const exists = SUPPORTED_LOCALES.some((locale) => locale.code === code)
    return exists ? code : null
  } catch {
    // Ignore storage access errors (private mode, disabled storage, etc.).
    return null
  }
}

/**
 * Persist the selected locale code in localStorage so that the choice
 * survives page reloads.
 */
export function storeLocaleCode(code: LocaleCode): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(LOCAL_STORAGE_KEY, code)
  } catch {
    // Ignore persistence errors (private mode, disabled storage, etc.).
  }
}

/**
 * Navigator with a safe "languages" property.
 */
type NavigatorWithLanguages = Navigator & {
  languages?: readonly string[]
}

/**
 * Try to infer a suitable locale from the browser settings.
 */
export function detectBrowserLocaleCode(): LocaleCode | null {
  if (typeof navigator === 'undefined') return null

  const candidates: string[] = []

  const nav = navigator as NavigatorWithLanguages

  if (Array.isArray(nav.languages)) {
    candidates.push(...nav.languages)
  }

  if (typeof nav.language === 'string') {
    candidates.push(nav.language)
  }

  for (const lang of candidates) {
    const match = matchSupportedLocale(lang)
    if (match) return match
  }

  return null
}

/**
 * Decide which locale should be used on first load.
 *
 * Priority:
 *   1. Value stored in localStorage
 *   2. Browser language
 *   3. DEFAULT_LOCALE_CODE fallback
 */
export function detectInitialLocaleCode(): LocaleCode {
  const stored = getStoredLocaleCode()
  if (stored) return stored

  const fromBrowser = detectBrowserLocaleCode()
  if (fromBrowser) return fromBrowser

  return DEFAULT_LOCALE_CODE
}

/**
 * Resolve full LocaleDefinition from a LocaleCode.
 */
export function resolveLocaleDefinition(code: LocaleCode): LocaleDefinition {
  return getLocaleByCode(code)
}

/**
 * Apply the locale to the <html> element: lang attribute + direction.
 * This is important for screen readers and RTL languages.
 */
export function applyLocaleToDocument(locale: LocaleDefinition): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.lang = locale.code
  root.dir = locale.direction === 'rtl' ? 'rtl' : 'ltr'
}

/**
 * Utility to get a safe fallback code when current code is not recognized.
 */
export function ensureSupportedLocaleCode(code: LocaleCode | string): LocaleCode {
  const normalized = (code ?? '').toString().toLowerCase() as LocaleCode
  const exists = SUPPORTED_LOCALES.some((locale) => locale.code === normalized)
  if (exists) return normalized
  return FALLBACK_LOCALE_CODE
}
