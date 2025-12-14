# TenRusl ReactTS Admin Payment

Admin dashboard **React + TypeScript** untuk mengelola dan menguji alur pembayaran berbasis
**TenRusl Payment Webhook Simulator**. Proyek ini fokus pada:

- Form kompleks dengan validasi (React Hook Form + Zod).
- Tabel CRUD dan pagination (Payments & Users).
- Integrasi API dengan backend Laravel (TenRusl Payment Webhook Sim).
- State management ringan dengan Zustand.
- Kualitas: linting, testing, dan CI ready.

---

## Demo & Backend Reference

- Backend repo: https://github.com/kakrusliandika/TenRusl-Payment-Webhook-sim
- Backend demo: https://tenrusl.alwaysdata.net/payment-webhook-sim/

Aplikasi ini diasumsikan berkomunikasi dengan API TenRusl melalui base URL:

- Dev lokal (default Laravel):

  ```text
  http://127.0.0.1:8000/api/v1
  ```

- Demo hosted:

  ```text
  https://tenrusl.alwaysdata.net/payment-webhook-sim/api
  ```

Keduanya diatur lewat environment variable `VITE_API_BASE_URL`.

---

## Fitur Utama

- **Dashboard**
  - Ringkasan jumlah payments.
  - Total volume pembayaran.
  - Breakdown status (completed, pending, failed).

- **Payments**
  - Form "Create Payment" dengan:
    - Provider (mock/xendit/midtrans/dll).
    - Amount, currency, description, order ID (metadata).
    - Validasi schema (Zod) + error message yang jelas.
  - Tabel payments:
    - Daftar payment yang dibuat via UI.
    - Pagination dasar.
    - Tombol "Refresh" untuk perbarui status payment dari backend.
  - Integrasi idempotency:
    - Pengiriman header `Idempotency-Key` pada request create payment.

- **Users**
  - Tabel users (data dummy) sebagai contoh CRUD admin.
  - Form tambah/edit user sederhana (nama, email, role).
  - Dapat dikembangkan nanti untuk integrasi ke backend nyata.

- **Infra & Quality**
  - Vite + React + TypeScript.
  - Tailwind v4 (CSS-first, token warna mengikuti theme TenRusl).
  - ESLint + Prettier.
  - Vitest + Testing Library untuk unit/integration test level UI.
  - GitHub Actions CI (lint, test, build).

---

## Tech Stack

- **Frontend**
  - React 19
  - TypeScript
  - React Router DOM
  - React Hook Form
  - Zod
  - Zustand
  - Tailwind CSS v4

- **Tooling**
  - Vite
  - ESLint
  - Prettier
  - Vitest
  - @testing-library/react
  - GitHub Actions

---

## Getting Started

### Prasyarat

- Node.js 20 (disarankan pakai `nvm` dengan file `.nvmrc`).
- npm (default dari Node).

### 1. Clone repo

```bash
git clone <URL-REPO-INI> TenRusl-ReactTS-Admin-Payment
cd TenRusl-ReactTS-Admin-Payment
```

### 2. Setup environment

Salin file contoh environment:

```bash
cp .env.example .env
```

Lalu sesuaikan nilai `VITE_API_BASE_URL`:

- Untuk dev lokal:

  ```env
  VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
  ```

- Untuk demo hosted:

  ```env
  VITE_API_BASE_URL=https://tenrusl.alwaysdata.net/payment-webhook-sim/api
  ```

Pastikan backend TenRusl berjalan dan dapat diakses dari browser / dev server.

### 3. Install dependency

```bash
npm install
```

```bash
npm install -D @tailwindcss/postcss
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka alamat yang ditampilkan (biasanya `http://localhost:5173`) di browser.

---

## Script yang Tersedia

Dari `package.json`:

- `npm run dev`  
  Menjalankan Vite dev server.

- `npm run build`  
  Build project untuk production (`dist/`) dengan TypeScript build check.

- `npm i -D @testing-library/jest-dom`  
  Import @testing-library/jest-dom/vitest (sesuai rekomendasi Testing Library untuk Vitest).

- `npm run preview`  
  Menjalankan preview server untuk hasil build.

- `npm run test`  
  Menjalankan seluruh test menggunakan Vitest.

- `npm run test:watch`  
  Menjalankan test dalam mode watch.

- `npm run lint`  
  Menjalankan ESLint untuk memeriksa kualitas kode.

- `npm run format`  
  Menjalankan Prettier untuk mem-format file di `src/`.

---

## Struktur Project (ringkas)

```text
src/
  main.tsx         # Entry React
  router.tsx       # Definisi route (Dashboard, Payments, Users)
  AppLayout.tsx    # Layout utama (sidebar, topbar, content)

  index.css        # Import Tailwind + theme TenRusl

  lib/             # Utility umum (api-client, idempotency, formatting)
  types/           # Tipe API dan shared types
  components/      # Layout + UI primitives (Button, Card, Table, dst.)
  hooks/           # Hooks reusable (toast, pagination, keyboard shortcuts)

  features/
    dashboard/     # DashboardPage
    payments/      # API, store, components, PaymentsPage
    users/         # API/mock, store, components, UsersPage

  test/            # Setup test + fixtures + test unit/komponen
```

---

## Integrasi dengan TenRusl Payment Webhook Sim

Aplikasi ini diasosiasikan dengan backend:

- Repo: `TenRusl-Payment-Webhook-sim`
- Endpoint utama:
  - Create payment: `POST /payments`
  - Get payment detail (by id): `GET /payments/{id}`
  - Webhook simulator: `POST /webhooks/{provider}`

Semua request frontend akan diarahkan ke:

```text
{VITE_API_BASE_URL}/...
```

Contoh:

- Create payment → `POST {VITE_API_BASE_URL}/payments`
- Get payment detail → `GET {VITE_API_BASE_URL}/payments/{id}`

Cara kerja umum:

1. Form `Create Payment` mengumpulkan data (provider, amount, currency, dll).
2. Frontend mengirim request ke backend memakai API client, dengan header `Idempotency-Key` unik.
3. Respon backend disimpan di store Zustand dan ditampilkan di tabel.
4. Tombol `Refresh` di tabel memanggil endpoint get detail untuk memperbarui status terbaru (pending → completed/failed, dsb).

Detail payload & respons bisa dilihat lebih lanjut di dokumentasi backend TenRusl.

---

## Kontribusi

1. Fork repository.
2. Buat branch fitur: `feat/nama-fitur`.
3. Commit perubahan dengan pesan yang jelas.
4. Pastikan `npm run lint` dan `npm run test` lulus.
5. Buka Pull Request.

---

## Lisensi

Project ini menggunakan lisensi **MIT**.  
Lihat file [`LICENSE`](./LICENSE) untuk detail lengkap.
