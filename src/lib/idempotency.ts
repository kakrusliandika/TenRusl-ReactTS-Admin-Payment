/**
 * Idempotency-Key generator.
 *
 * Backend TenRusl mengharapkan header:
 *   Idempotency-Key: <string>  pada `POST /api/v1/payments`. :contentReference[oaicite:3]{index=3}
 *
 * Di sini kita buat helper untuk menghasilkan nilai unik, tapi cukup simpel
 * dan bisa dibaca manusia (timestamp + random + optional prefix).
 */

export interface IdempotencyOptions {
  /** Prefix opsional, misalnya 'payment' → "payment_..." */
  prefix?: string
}

/**
 * Generate Idempotency-Key baru.
 *
 * Contoh hasil:
 *   "payment_20251207T123456Z_6f4c9f3b1a2e4"
 */
export function createIdempotencyKey(options: IdempotencyOptions = {}): string {
  const { prefix } = options

  // ISO timestamp tanpa milidetik: 2025-12-07T12:34:56Z → 20251207T123456Z
  const now = new Date()
  const iso = now.toISOString()
  const compactTimestamp =
    iso.slice(0, 4) + // year
    iso.slice(5, 7) + // month
    iso.slice(8, 10) + // day
    'T' +
    iso.slice(11, 13) + // hour
    iso.slice(14, 16) + // minute
    iso.slice(17, 19) + // second
    'Z'

  // Random segment
  let randomPart = ''

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    randomPart = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } else {
    randomPart = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      .toString(16)
      .slice(0, 14)
  }

  const core = `${compactTimestamp}_${randomPart}`

  return prefix ? `${prefix}_${core}` : core
}

/**
 * Convenience helper khusus untuk create payment.
 *
 * Biar pemanggilan di fitur jelas:
 *   const key = createPaymentIdempotencyKey();
 */
export function createPaymentIdempotencyKey(): string {
  return createIdempotencyKey({ prefix: 'payment' })
}
