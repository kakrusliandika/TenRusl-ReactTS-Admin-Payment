import type {
  ApiResult,
  ApiError,
  ApiClientConfig,
  HttpMethod,
  ErrorResponseBody,
} from '../types/api'

/**
 * Default timeout (ms) untuk setiap request HTTP.
 */
const DEFAULT_TIMEOUT_MS = 15_000

/**
 * Gabungkan baseUrl dengan path relatif.
 * - Kalau path sudah absolute (http/https), langsung dipakai apa adanya.
 * - Kalau path diawali "/", dia akan digabung dengan baseUrl.
 */
function buildUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')

  return `${normalizedBase}/${normalizedPath}`
}

/**
 * Buat X-Request-ID untuk tracing.
 * TenRusl backend punya CorrelationIdMiddleware yang pakai header `X-Request-ID`.
 */
function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  // Fallback sederhana kalau crypto.randomUUID tidak ada.
  const now = Date.now().toString(16)
  const rand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
  return `req_${now}_${rand}`
}

/**
 * Buat AbortController dengan timeout optional.
 */
function createAbortController(timeoutMs?: number): {
  controller: AbortController
  timeoutId: number | undefined
} {
  const controller = new AbortController()

  if (!timeoutMs || typeof window === 'undefined') {
    return { controller, timeoutId: undefined }
  }

  const timeoutId = window.setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  return { controller, timeoutId }
}

/**
 * Fungsionalitas inti: parse JSON (kalau ada), tapi tahan kalau body kosong.
 */
async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    // Kalau JSON tidak valid, kita lempar jenis error lain di tempat lain.
    throw new Error('Failed to parse JSON response')
  }
}

/**
 * Konversi ErrorResponseBody (Laravel) ke struktur validation yang lebih enak.
 */
function normalizeValidationErrors(body?: ErrorResponseBody): ApiError['validation'] {
  if (!body || !body.errors) return undefined

  return Object.entries(body.errors).map(([field, messages]) => ({
    field,
    messages: Array.isArray(messages) ? messages : [String(messages)],
  }))
}

/**
 * Bangun ApiError dari HTTP response yang gagal.
 */
async function buildHttpError(
  response: Response,
  url: string,
  method: HttpMethod,
): Promise<ApiError> {
  let body: ErrorResponseBody | unknown = null
  let parseFailed = false

  try {
    body = await parseJsonSafe<ErrorResponseBody>(response)
  } catch {
    parseFailed = true
  }

  const errorBody = (body ?? undefined) as ErrorResponseBody | undefined

  const messageFromBody =
    errorBody?.message || response.statusText || `Request failed with status ${response.status}`

  const validation = errorBody ? normalizeValidationErrors(errorBody) : undefined

  const base: ApiError = {
    kind: parseFailed ? 'parse' : 'http',
    status: response.status,
    message: messageFromBody,
    code: errorBody?.code,
    validation,
    url,
    method,
    raw: body ?? undefined,
  }

  // Ambil X-Request-ID dari response kalau ada, untuk tracing.
  const requestId = response.headers.get('X-Request-ID')
  if (requestId) {
    base.requestId = requestId
  }

  return base
}

/**
 * Bangun ApiError dari pengecualian fetch (network, abort, timeout, dsb).
 */
function buildTransportError(
  error: unknown,
  url: string,
  method: HttpMethod,
  timeoutMs: number,
): ApiError {
  const messageDefault = 'Network error while calling API'

  // AbortController timeout
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      kind: 'timeout',
      status: 0,
      message: `Request timed out after ${timeoutMs} ms`,
      url,
      method,
      cause: error,
    }
  }

  // Fetch biasanya melempar TypeError untuk network error (DNS, offline, dll).
  if (error instanceof TypeError) {
    return {
      kind: 'network',
      status: 0,
      message: error.message || messageDefault,
      url,
      method,
      cause: error,
    }
  }

  return {
    kind: 'unknown',
    status: 0,
    message: (error as Error)?.message || messageDefault,
    url,
    method,
    cause: error,
  }
}

/**
 * Normalisasi body JSON server:
 * - Kalau ada properti `data`, pakai itu sebagai payload utama.
 * - Kalau tidak ada, pakai body mentah sebagai data.
 */
function extractData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
    return (body as { data: unknown }).data as T
  }

  return body as T
}

export interface RequestOptions {
  /** Query string params (akan di-encode ke URL). */
  query?: Record<string, string | number | boolean | null | undefined>
  /** Body JSON untuk request non-GET. */
  body?: unknown
  /** Header tambahan (meng-override default kalau key sama). */
  headers?: Record<string, string>
  /** Signal untuk cancel dari luar (opsional). */
  signal?: AbortSignal
  /** Timeout override per-call (ms). */
  timeoutMs?: number
}

/**
 * API client sederhana berbasis fetch untuk TenRusl.
 *
 * Usage:
 *   const client = createDefaultApiClient()
 *   const result = await client.post<Payment>('/payments', payload)
 */
export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly timeoutMs: number

  constructor(config: ApiClientConfig) {
    if (!config.baseUrl) {
      throw new Error('ApiClient: baseUrl is required')
    }

    this.baseUrl = config.baseUrl
    this.defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    }
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  /**
   * Helper untuk menyusun URL lengkap + query string.
   */
  private buildFullUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(buildUrl(this.baseUrl, path))

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        url.searchParams.set(key, String(value))
      })
    }

    return url.toString()
  }

  /**
   * Request generik.
   *
   * Data `TData` adalah bentuk payload final yang sudah dinormalisasi (biasanya isi `data`).
   */
  async request<TData>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResult<TData>> {
    const { query, body, headers, signal, timeoutMs } = options

    const url = this.buildFullUrl(path, query)
    const effectiveTimeout = timeoutMs ?? this.timeoutMs

    const { controller, timeoutId } = createAbortController(effectiveTimeout)

    // Merge signal external dengan controller internal (kalau ada)
    const combinedSignal = signal ? this.mergeSignals(signal, controller.signal) : controller.signal

    const requestId = createRequestId()

    const finalHeaders: HeadersInit = {
      ...this.defaultHeaders,
      'X-Request-ID': requestId,
      ...headers,
    }

    const init: RequestInit = {
      method,
      headers: finalHeaders,
      signal: combinedSignal,
    }

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, init)

      if (!response.ok) {
        const error = await buildHttpError(response, url, method)
        return {
          ok: false,
          status: error.status ?? response.status,
          data: null,
          error,
        }
      }

      // Success path
      const dataRaw = await parseJsonSafe<unknown>(response)
      const data = extractData<TData>(dataRaw)

      return {
        ok: true,
        status: response.status,
        data,
        error: null,
      }
    } catch (error) {
      const apiError = buildTransportError(error, url, method, effectiveTimeout)
      return {
        ok: false,
        status: apiError.status ?? 0,
        data: null,
        error: apiError,
      }
    } finally {
      if (typeof window !== 'undefined' && timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }

  /**
   * Merge dua AbortSignal jadi satu.
   * Kalau salah satu abort, request akan dibatalkan.
   */
  private mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
    const controller = new AbortController()

    const onAbortA = () => controller.abort(a.reason)
    const onAbortB = () => controller.abort(b.reason)

    if (a.aborted) {
      controller.abort(a.reason)
    } else if (b.aborted) {
      controller.abort(b.reason)
    } else {
      a.addEventListener('abort', onAbortA)
      b.addEventListener('abort', onAbortB)
    }

    // Cleanup listeners ketika controller ter-abort.
    controller.signal.addEventListener('abort', () => {
      a.removeEventListener('abort', onAbortA)
      b.removeEventListener('abort', onAbortB)
    })

    return controller.signal
  }

  // Convenience methods

  get<TData>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TData>('GET', path, options)
  }

  post<TData>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TData>('POST', path, { ...options, body })
  }

  put<TData>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TData>('PUT', path, { ...options, body })
  }

  patch<TData>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TData>('PATCH', path, { ...options, body })
  }

  delete<TData>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<TData>('DELETE', path, options)
  }
}

/**
 * Factory default: pakai VITE_API_BASE_URL dari environment.
 *
 * Pastikan di .env:
 *   VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
 * atau URL dev/demo lain (Laravel TenRusl).
 */
export function createDefaultApiClient(): ApiClient {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not defined')
  }

  const config: ApiClientConfig = {
    baseUrl,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    defaultHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }

  return new ApiClient(config)
}

/**
 * Instance singleton yang bisa langsung dipakai seluruh app.
 */
export const apiClient = createDefaultApiClient()
