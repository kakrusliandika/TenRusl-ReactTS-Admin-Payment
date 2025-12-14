// src/App.tsx
import React from 'react'

/**
 * App
 *
 * Komponen ini hanya sebagai placeholder mandiri.
 * Jalur utama aplikasi tetap lewat `main.tsx` + `router.tsx`
 * yang menggunakan <AppLayout /> sebagai shell admin.
 *
 * Boleh dipakai untuk eksperimen kecil tanpa mengganggu router utama.
 */
function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-10">
        <div>
          <h1 className="text-lg font-semibold">TenRusl Admin – App placeholder</h1>
          <p className="mt-1 text-sm text-slate-400">
            Entry point utama aplikasi sudah diatur melalui <code>main.tsx</code> dan{' '}
            <code>router.tsx</code>. Komponen ini tidak dipakai di flow normal, tetapi tetap
            disediakan jika suatu saat kamu ingin entry terpisah untuk demo/POC.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
          <p>
            Untuk menjalankan admin panel lengkap, pastikan kamu membuka URL yang di-serve oleh Vite
            (misalnya <code>http://localhost:5173/</code>) dan routing akan diarahkan ke{' '}
            <code>AppLayout</code> beserta halaman Dashboard / Payments / Users.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
