// src/test/setup.ts

// Matcher tambahan: toBeInTheDocument, toHaveTextContent, dll.
// Untuk Vitest gunakan entry khusus:
import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Bersihkan DOM setelah setiap test
afterEach(() => {
  cleanup()
})

// OPTIONAL: bisa tambah config global lain di sini kalau perlu,
// misalnya mock console, timer, dsb.
// Contoh (kalau suatu saat dibutuhkan):
//
// import { vi, beforeAll, afterAll } from 'vitest'
//
// beforeAll(() => {
//   vi.spyOn(console, 'error').mockImplementation(() => {})
// })
//
// afterAll(() => {
//   ;(console.error as unknown as { mockRestore?: () => void }).mockRestore?.()
// })
