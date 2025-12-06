# Arsitektur TenRusl ReactTS Admin Payment

Dokumen ini menjelaskan arsitektur front-end untuk proyek
**TenRusl ReactTS Admin Payment**: bagaimana kode diorganisasi, layer-layer utama,
dan alur data dari UI hingga API TenRusl.

---

## 1. Gambaran Umum Layer

Aplikasi dibangun dengan pendekatan **layered + feature-based**:

1. **UI Shell / Layout**
   - Berada di file seperti `AppLayout` dan komponen layout lain (Sidebar, Topbar).
   - Mengatur struktur visual utama (sidebar, header, konten).

2. **Routing Layer**
   - Didefinisikan di `router.tsx`.
   - Menghubungkan path URL (`/`, `/payments`, `/users`) ke halaman fitur.

3. **Feature Layer**
   - Setiap fitur memiliki folder sendiri di `src/features`:
     - `features/dashboard`
     - `features/payments`
     - `features/users`
   - Di dalam tiap fitur terdapat:
     - `pages/`  → halaman yang dihubungkan ke routing.
     - `components/` → komponen khusus fitur tersebut.
     - `api.ts` → fungsi pemanggil API untuk fitur itu.
     - `store.ts` → state management (Zustand) khusus fitur.
     - `types.ts` → definisi tipe data domain fitur.

4. **Shared Layer**
   - `src/components/ui` → komponen UI generik (Button, Card, Input, Table, dsb.).
   - `src/components/layout` → komponen layout yang dipakai lintas fitur.
   - `src/hooks` → hooks reusable (`useToast`, `usePagination`, dsb.).
   - `src/lib` → helper non-React (API client, helper idempotency, format angka/tanggal).
   - `src/types` → tipe global atau shared antar fitur.

5. **Test Layer**
   - `src/test` berisi setup test, fixtures, dan test untuk komponen maupun fitur.
   - Struktur mengikuti struktur fitur sehingga mudah dilokalisasi.

---

## 2. Organisasi Folder (Ringkas)

- `src/main.tsx`  
  Entry React, mengikat app ke elemen root di `index.html` dan memasang router.

- `src/router.tsx`  
  Mendaftarkan semua route (Dashboard, Payments, Users) dan menghubungkannya dengan layout.

- `src/AppLayout.tsx`  
  Shell admin: sidebar, topbar, dan outlet konten.

- `src/components/layout/*`  
  Komponen layout seperti `Sidebar`, `Topbar`, dan `Breadcrumbs`.

- `src/components/ui/*`  
  Building blocks UI generik: tombol, kartu, input, tabel, badge, dsb.

- `src/features/dashboard/*`  
  Halaman ringkasan metrik yang membaca state dari fitur payments.

- `src/features/payments/*`  
  Unit fitur utama untuk integrasi TenRusl Payment Webhook Sim.

- `src/features/users/*`  
  Contoh fitur CRUD users, awalnya dengan data dummy.

- `src/lib/*`  
  Utility seperti API client dan helper idempotency yang dipakai di beberapa fitur.

- `src/test/*`  
  Setup Vitest, fixtures, dan file test yang berkelompok per fitur/komponen.

---

## 3. Alur Data: Form → Zustand Store → API TenRusl

### 3.1. Dari User ke Form

1. Pengguna membuka halaman **Payments**.
2. Halaman menampilkan `CreatePaymentForm` dan tabel `PaymentsTable`.
3. Saat user mengisi form, React Hook Form mengelola state input dan validasi bersama Zod.

### 3.2. Validasi di Client

1. Saat tombol submit ditekan, React Hook Form:
   - Mengevaluasi schema Zod untuk memastikan field wajib terisi dengan format benar.
   - Jika invalid, menampilkan pesan error di bawah field yang relevan.
2. Jika valid, data form diteruskan ke action store Zustand (misalnya `createPayment`).

### 3.3. Store Zustand Sebagai Orkestra Fitur

1. Store `payments` menyimpan:
   - Daftar payments yang diketahui frontend.
   - State loading (sedang memanggil API atau tidak).
   - Error terakhir (jika ada).
2. Action `createPayment` melakukan beberapa langkah:
   - Menandai state sebagai loading.
   - Memanggil fungsi API `createPaymentApi` dari `features/payments/api.ts`.
   - Jika API sukses, payment baru dimasukkan ke daftar di state.
   - Jika API gagal, error disimpan sehingga UI bisa menampilkan toast atau pesan error.

3. Action `refreshPayment` dipakai untuk memanggil endpoint detail payment,
   kemudian memperbarui item tertentu di state berdasarkan ID.

### 3.4. API Client Layer

1. Fungsi `createPaymentApi` memanggil helper generik di `lib/api-client`.
2. API client bertanggung jawab untuk:
   - Menggabungkan base URL (`VITE_API_BASE_URL`) dengan path endpoint.
   - Menambahkan header umum (`Content-Type`, `X-Request-ID`, `Idempotency-Key` untuk create).
   - Membaca dan mem-parsing respons JSON dari backend.
   - Membedakan antara respons sukses dan error HTTP.

3. Fungsi `getPaymentApi` melakukan hal serupa, khusus untuk endpoint get detail payment.

### 3.5. Dari API ke UI Kembali

1. Setelah respons sukses diterima dan state di store diperbarui,
   komponen UI seperti `PaymentsTable` akan otomatis rerender karena membaca data dari store.
2. `DashboardPage` juga dapat membaca state yang sama untuk menghitung:
   - jumlah payment,
   - total volume,
   - distribusi status,
   dan menampilkan metrik tersebut dalam bentuk kartu statistik.

---

## 4. Pola Folder: Feature-Based dengan Shared Primitives

### 4.1. Mengapa Feature-Based?

- Fitur `payments` punya semua yang ia butuhkan di satu tempat (`api`, `store`, `components`, `pages`),
  sehingga mudah dikembangkan tanpa mengganggu fitur lain.
- Dependensi antar fitur diminimalkan; komunikasi lintas fitur dilakukan melalui shared store
  atau props yang jelas.

### 4.2. Peran Shared Components & Lib

- `components/ui` menyediakan komponen yang netral terhadap domain (tidak mengerti “payment”
  atau “user”, hanya tahu cara menjadi tombol, tabel, kartu, dsb.).
- `lib/api-client` membebaskan fitur dari detail teknis HTTP sehingga kode business logic
  di fitur lebih jelas dan pendek.
- `hooks` menyimpan pola berulang (misalnya paging, toast, keyboard shortcut), sehingga tidak
  perlu duplikasi di setiap fitur.

### 4.3. Test dan Batasan Unit

- Test untuk komponen UI generik berada di `src/test/components/ui`, memverifikasi perilaku dasar.
- Test untuk perilaku fitur (form, tabel, integration kecil) berada di `src/test/features/<fitur>`.
- Ini menyerupai “clean boundaries”:
  - UI generik diuji sekali dan dapat digunakan di banyak tempat.
  - Fitur diuji supaya menggambarkan alur bisnis domain.

---

## 5. Evolusi Ke Depan

- Menambahkan fitur baru cukup dengan menambah folder di `src/features/<fitur-baru>`.
- Jika backend TenRusl menambah endpoint baru (misalnya refund, capture, dsb.), API dan store dapat
  berkembang secara lokal di folder `features/payments` tanpa mengganggu struktur global.
- Jika ada perubahan besar di UI shell (layout, tema), cukup diubah di komponen layout dan CSS
  tanpa perlu menyentuh kode logika fitur.