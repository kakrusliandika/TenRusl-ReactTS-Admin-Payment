/**
 * Deskripsikan shortcut dalam bentuk string:
 *
 *   'Ctrl+K'
 *   'Shift+Alt+P'
 *   'Meta+/'      (Command di Mac)
 *
 * Lalu cocokkan dengan KeyboardEvent untuk handler.
 */

export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta'

export interface KeyCombo {
  key: string
  modifiers: ModifierKey[]
}

/**
 * Parse string kombinasi key jadi struktur KeyCombo.
 *
 * Contoh:
 *  parseKeyCombo('Ctrl+K') → { key: 'k', modifiers: ['ctrl'] }
 */
export function parseKeyCombo(combo: string): KeyCombo {
  const parts = combo.split('+').map((p) => p.trim())

  const modifiers: ModifierKey[] = []
  let key = ''

  for (const partRaw of parts) {
    const part = partRaw.toLowerCase()

    if (part === 'ctrl' || part === 'control') {
      modifiers.push('ctrl')
    } else if (part === 'alt' || part === 'option') {
      modifiers.push('alt')
    } else if (part === 'shift') {
      modifiers.push('shift')
    } else if (part === 'meta' || part === 'cmd' || part === 'command') {
      modifiers.push('meta')
    } else if (!key) {
      key = part
    }
  }

  return { key, modifiers }
}

/**
 * Cek apakah KeyboardEvent cocok dengan kombinasi key tertentu.
 */
export function isKeyComboMatch(event: KeyboardEvent, combo: KeyCombo): boolean {
  const pressedKey = event.key.toLowerCase()

  // Beberapa key spesial ("/", "?" dll) bisa memiliki variasi.
  if (combo.key && pressedKey !== combo.key) {
    return false
  }

  const required = new Set(combo.modifiers)

  if (
    required.has('ctrl') !==
    (event.ctrlKey || (event.metaKey && navigator.platform.includes('Mac')))
  ) {
    // Catatan: di Mac, kadang Command dipakai sebagai "ctrl". Kamu bisa adjust sesuai preferensi.
  }

  if (required.has('ctrl') !== event.ctrlKey) return false
  if (required.has('alt') !== event.altKey) return false
  if (required.has('shift') !== event.shiftKey) return false
  if (required.has('meta') !== event.metaKey) return false

  return true
}

/**
 * Callback untuk shortcut.
 */
export type ShortcutHandler = (event: KeyboardEvent) => void

export interface ShortcutOptions {
  /**
   * Element target tempat listener dipasang.
   * Default: window (global shortcut).
   */
  target?: Window | Document | HTMLElement
  /**
   * Kalau true, shortcut diabaikan ketika fokus sedang di input/textarea/select.
   * Default: true.
   */
  ignoreWhenEditing?: boolean
}

/**
 * Pasang shortcut keyboard global.
 *
 * Usage:
 *   const dispose = registerShortcut('Ctrl+K', (event) => {
 *     event.preventDefault()
 *     openSearch()
 *   })
 *
 *   // Saat unmount:
 *   dispose()
 */
export function registerShortcut(
  comboString: string,
  handler: ShortcutHandler,
  options: ShortcutOptions = {},
): () => void {
  const combo = parseKeyCombo(comboString)
  const target = options.target ?? window
  const ignoreWhenEditing = options.ignoreWhenEditing ?? true

  const listener = (event: KeyboardEvent) => {
    if (ignoreWhenEditing && isEditingElement(event.target)) {
      return
    }

    if (!isKeyComboMatch(event, combo)) {
      return
    }

    handler(event)
  }

  target.addEventListener('keydown', listener as EventListener)

  return () => {
    target.removeEventListener('keydown', listener as EventListener)
  }
}

/**
 * Cek apakah event target sedang di elemen input yang biasa dipakai user mengetik.
 */
function isEditingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName.toLowerCase()
  const editable = target.getAttribute('contenteditable')

  if (editable && editable !== 'false') return true

  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.getAttribute('role') === 'textbox'
  )
}

/**
 * Cari elemen fokus-able di dalam sebuah container.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'

  const nodes = Array.from(container.querySelectorAll<HTMLElement>(selector))

  return nodes.filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden') && el.tabIndex !== -1,
  )
}

/**
 * Fokus elemen pertama yang bisa difokus di dalam container.
 */
export function focusFirstFocusable(container: HTMLElement): void {
  const focusables = getFocusableElements(container)
  if (focusables.length > 0) {
    focusables[0].focus()
  }
}

/**
 * Fokus elemen terakhir yang bisa difokus di dalam container.
 */
export function focusLastFocusable(container: HTMLElement): void {
  const focusables = getFocusableElements(container)
  if (focusables.length > 0) {
    focusables[focusables.length - 1].focus()
  }
}
