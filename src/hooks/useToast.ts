// src/hooks/useToast.ts
import { useToast as useToastInternal, type ToastContextValue } from '../components/ui/Toast'

/**
 * useToast – hook untuk memanggil Toast dari mana saja.
 *
 * Contoh:
 *   const { showSuccess, showError } = useToast()
 *   showSuccess('Payment created', 'The simulated payment was sent successfully.')
 */
export function useToast(): ToastContextValue {
  return useToastInternal()
}

// Re-export tipe kalau butuh di tempat lain.
export type { ToastContextValue }
