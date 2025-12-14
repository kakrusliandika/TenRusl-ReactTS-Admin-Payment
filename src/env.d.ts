/// <reference types="vite/client" />

/**
 * Strongly-typed environment variables exposed by Vite.
 * Extend this interface whenever you add new VITE_* variables.
 */
interface ImportMetaEnv {
  /**
   * Base URL for the TenRusl Payment Webhook Simulator API.
   *
   * Examples:
   * - Local: http://127.0.0.1:8000/api/v1
   * - Demo:  https://tenrusl.alwaysdata.net/payment-webhook-sim/api
   */
  readonly VITE_API_BASE_URL: string

  /**
   * Optional human-readable app name used in the UI.
   * Example: "TenRusl Admin"
   */
  readonly VITE_APP_NAME?: string

  /**
   * Optional environment marker used for diagnostics.
   * Example values: "development" | "staging" | "production"
   */
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
