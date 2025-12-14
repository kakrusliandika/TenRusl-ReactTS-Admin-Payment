/**
 * Generic HTTP method union.
 * Dipakai di ApiError untuk melacak request mana yang gagal.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'

/**
 * Envelope JSON generik untuk API TenRusl.
 *
 * Contoh dari backend:
 * {
 *   "data": {
 *     "id": "...",
 *     "provider": "mock",
 *     ...
 *   }
 * }
 *
 * TData bisa single object, array, atau apapun yang dikembalikan backend.
 */
export interface ApiEnvelope<TData = unknown> {
  data: TData
}

/**
 * Meta informasi pagination (opsional) yang bisa menyertai list response.
 * Disusun agar kompatibel dengan pola meta/pagination umum di API modern.
 *
 * Kamu bisa sesuaikan dengan bentuk JSON yang dipakai backend kalau nanti
 * ada endpoint yang benar-benar paginated.
 */
export interface PaginationMeta {
  /** Halaman saat ini (1-based). */
  currentPage: number
  /** Jumlah item per halaman. */
  perPage: number
  /** Total seluruh item di server. */
  total: number
  /** Halaman terakhir (opsional kalau backend tidak kirim). */
  lastPage?: number
  /** Index item awal di halaman ini (opsional). */
  from?: number | null
  /** Index item akhir di halaman ini (opsional). */
  to?: number | null
}

/**
 * Bentuk khusus envelope kalau isinya list.
 *
 * {
 *   "data": [ ... ],
 *   "meta": {
 *     "currentPage": 1,
 *     "perPage": 20,
 *     "total": 123,
 *     ...
 *   }
 * }
 */
export interface ApiListEnvelope<TItem = unknown> extends ApiEnvelope<TItem[]> {
  meta?: PaginationMeta
}

/**
 * Struktur errors bawaan Laravel untuk validasi JSON:
 *
 * {
 *   "message": "The given data was invalid.",
 *   "errors": {
 *     "field": [
 *       "The field is required."
 *     ]
 *   }
 * }
 *
 * Ini kita jadikan tipe supaya gampang diparse di ApiError.
 */
export type ValidationErrorMap = Record<string, string[]>

/**
 * Bentuk umum payload error yang mungkin dikirim backend.
 *
 * - Untuk validation error Laravel → `message` + `errors`.
 * - Untuk error lain, backend bisa tambahkan `code`, `details`, dsb.
 */
export interface ErrorResponseBody {
  /** Pesan utama error dari backend. */
  message: string
  /** Kode error machine-readable (opsional). */
  code?: string
  /** Map field → array pesan error (khusus validasi). */
  errors?: ValidationErrorMap
  /** Payload tambahan lain yang mungkin dikirim backend. */
  [key: string]: unknown
}

/**
 * Representasi error yang sudah "dirapikan" untuk dipakai di UI.
 *
 * Ini yang sebaiknya dikonsumsi komponen React (toast, form error, dsb),
 * bukan langsung pakai body JSON mentah.
 */
export interface ApiError {
  /**
   * Jenis error di level transport:
   *
   * - 'http'      → request sampai ke server, tapi status 4xx/5xx.
   * - 'network'   → tidak bisa connect (DNS, offline, dsb).
   * - 'timeout'   → request melebihi batas waktu yang diset client.
   * - 'abort'     → request dibatalkan (AbortController, navigasi, dsb).
   * - 'parse'     → gagal parse JSON.
   * - 'unknown'   → kasus lain di luar kategori di atas.
   */
  kind: 'http' | 'network' | 'timeout' | 'abort' | 'parse' | 'unknown'

  /** HTTP status code (kalau available, mis. 400/401/422/500). */
  status?: number

  /** Pesan user-friendly yang bisa langsung ditampilkan. */
  message: string

  /** Kode error dari backend kalau ada (mis. 'validation_error', dsb). */
  code?: string

  /**
   * Validation error yang sudah diflatten dari `errors` Laravel:
   *
   *   [
   *     { field: "amount", messages: ["The amount field is required."] },
   *     { field: "currency", messages: ["The currency field is required."] }
   *   ]
   */
  validation?: Array<{
    field: string
    messages: string[]
  }>

  /** ID request untuk tracing (mis. header X-Request-ID). */
  requestId?: string

  /** Informasi request yang gagal, berguna untuk logging dan debug. */
  url?: string
  method?: HttpMethod

  /** Body error mentah dari server (sudah di-parse JSON). */
  raw?: unknown

  /** Error asli yang memicu ApiError (mis. TypeError dari fetch). */
  cause?: unknown
}

/**
 * Hasil tinggi-level dari satu call HTTP.
 *
 * Pattern:
 *
 * const result: ApiResult<Payment> = await client.get(...);
 * if (result.ok) {
 *   // result.data: Payment
 * } else {
 *   // result.error: ApiError
 * }
 */
export type ApiResult<TData> =
  | {
      ok: true
      status: number
      data: TData
      error: null
    }
  | {
      ok: false
      status: number
      data: null
      error: ApiError
    }

/**
 * Hasil call HTTP yang mengembalikan list/paginated envelope.
 *
 * Biasanya TItem berupa PaymentRow, UserRow, dsb.
 */
export type ApiListResult<TItem> = ApiResult<ApiListEnvelope<TItem>>

/**
 * Konfigurasi dasar API client.
 *
 * Cocok dipakai di wrapper fetch seperti `lib/api-client.ts`.
 */
export interface ApiClientConfig {
  /** Base URL, mis. "https://tenrusl.alwaysdata.net/payment-webhook-sim/api". */
  baseUrl: string
  /** Header default yang akan selalu dikirim (Accept, X-Request-ID, dsb). */
  defaultHeaders?: Record<string, string>
  /** Timeout per request dalam millisecond (opsional). */
  timeoutMs?: number
}
