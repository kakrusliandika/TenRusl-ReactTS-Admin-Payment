// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import { registerShortcut, type ShortcutHandler, type ShortcutOptions } from '../lib/keyboard'

/**
 * Konfigurasi single shortcut.
 *
 * combo: string kombinasi tombol, mis. "Ctrl+K", "Shift+Alt+P", "Meta+/".
 */
export interface KeyboardShortcutConfig {
  combo: string
  handler: ShortcutHandler
  options?: ShortcutOptions
}

/**
 * useKeyboardShortcut – hook untuk satu kombinasi tombol.
 *
 * Contoh:
 *   useKeyboardShortcut('Ctrl+K', (event) => {
 *     event.preventDefault()
 *     openCommandPalette()
 *   })
 */
export function useKeyboardShortcut(
  combo: string,
  handler: ShortcutHandler,
  options?: ShortcutOptions,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return

    const dispose = registerShortcut(combo, handler, options)
    return () => dispose()
  }, [combo, handler, enabled, options])
}

/**
 * useKeyboardShortcuts – hook untuk banyak kombinasi sekaligus.
 *
 * Contoh:
 *   useKeyboardShortcuts(
 *     [
 *       { combo: 'Ctrl+K', handler: openSearch },
 *       { combo: 'Shift+/', handler: openHelp },
 *     ],
 *     true,
 *   )
 *
 * Pastikan handler kamu dibungkus useCallback supaya tidak re-register
 * terlalu sering.
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutConfig[],
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled || shortcuts.length === 0) return

    const disposers = shortcuts.map((shortcut) =>
      registerShortcut(shortcut.combo, shortcut.handler, shortcut.options),
    )

    return () => {
      disposers.forEach((dispose) => dispose())
    }
  }, [shortcuts, enabled])
}
