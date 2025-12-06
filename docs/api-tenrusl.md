# TenRusl Payment Webhook API – Frontend Integration

Dokumen ini menjelaskan bagaimana aplikasi **TenRusl ReactTS Admin Payment** berkomunikasi
dengan backend **TenRusl Payment Webhook Simulator**.

---

## 1. Base URL API

Aplikasi frontend menggunakan satu environment variable utama:

- `VITE_API_BASE_URL`

Nilai yang direkomendasikan:

- **Dev lokal (Laravel default):** `http://127.0.0.1:8000/api/v1`
- **Demo hosted:** `https://tenrusl.alwaysdata.net/payment-webhook-sim/api`

Setiap endpoint di bawah ini diasumsikan dipanggil relatif terhadap base URL tersebut.

Contoh pola umum:

- Create payment → `{VITE_API_BASE_URL}/payments`
- Get payment detail → `{VITE_API_BASE_URL}/payments/{id}`
- Webhook simulator → `{VITE_API_BASE_URL}/webhooks/{provider}` (opsional, untuk eksplorasi UI di masa depan)

---

## 2. Header Umum

Setiap request dari frontend ke backend minimal membawa header berikut:

- `Content-Type`: `application/json`
- `X-Request-ID`: nilai unik per request (misalnya UUID yang di-generate frontend)
- `Idempotency-Key`: hanya untuk request yang **idempotent** (terutama create payment)

Jika di masa depan backend mengaktifkan autentikasi, header seperti `Authorization` dapat
ditambahkan di layer API client tanpa mengubah kode fitur.

---

## 3. Endpoint yang Dipakai di Frontend

### 3.1. Create Payment

- **Method:** POST  
- **Path:** `/payments`  
- **Digunakan oleh:** form `Create Payment` di halaman **Payments**.

**Tujuan bisnis:**  
Membuat sebuah payment baru di simulator, menyimpan informasi penting seperti provider,
jumlah, mata uang, dan metadata order agar bisa dilacak dan diuji retry/webhook-nya.

**Field request (body):**

- `provider`  
  - Tipe: string.  
  - Contoh nilai: `mock`, `xendit`, `midtrans`, dll.  
  - Menentukan kanal pembayaran simulasi yang akan digunakan.

- `amount`  
  - Tipe: number.  
  - Nilai jumlah pembayaran dalam satuan terkecil (misalnya Rupiah).  
  - Harus bernilai positif.

- `currency`  
  - Tipe: string tiga huruf (kode mata uang).  
  - Contoh: `IDR`, `USD`.  
  - Di-backend biasanya disimpan sebagai huruf kapital.

- `description`  
  - Tipe: string (opsional).  
  - Penjelasan singkat tentang tujuan pembayaran (misalnya keterangan order).

- `metadata`  
  - Tipe: objek (opsional).  
  - Menyimpan nilai tambahan yang tidak memengaruhi logika utama, misalnya:  
    - `order_id`: ID order dari sistem eksternal.  
  - Dapat diperluas sesuai kebutuhan integrasi.

**Struktur respons (ringkasan):**

- Lapisan luar respons biasanya berisi properti `data` yang memuat objek payment.
- Objek payment berisi informasi seperti:
  - `id`: identitas internal payment di simulator.
  - `provider`: nama provider yang digunakan.
  - `provider_ref`: referensi provider (bisa digunakan untuk cross-check di provider nyata).
  - `amount`: nilai nominal yang dikirim saat create.
  - `currency`: kode mata uang.
  - `status`: status terkini payment (`pending`, `completed`, `failed`, dan kemungkinan status lain).
  - `meta` atau `metadata`: salinan metadata yang dikirim saat create.
  - `created_at`: waktu pembuatan payment.
  - `updated_at`: waktu terakhir payment diubah.

Frontend akan mengambil objek payment di dalam `data` dan menyimpannya di store Zustand
untuk kemudian ditampilkan di tabel pada halaman Payments.

---

### 3.2. Get Payment Detail (by ID)

- **Method:** GET  
- **Path (demo hosted):** `/payments/{id}`  
- **Digunakan oleh:** tombol `Refresh` di tabel **Payments** dan pembacaan status di Dashboard.

**Tujuan bisnis:**  
Mengambil status terbaru dari sebuah payment yang sebelumnya pernah dibuat. Ini penting
untuk memvisualisasikan perubahan status (misalnya dari `pending` menjadi `completed`
atau `failed`) setelah webhook atau proses backend lainnya berjalan.

**Parameter path:**

- `id`  
  - Tipe: string.  
  - Nilai ID internal payment yang diterima dari respons create payment.

**Perilaku respons:**

- Jika `id` valid dan payment ditemukan:
  - Backend akan mengembalikan objek payment terkini di dalam properti `data`.
  - Field di dalam objek payment kurang lebih sama dengan respons create payment,
    dengan nilai `status` dan `updated_at` yang sudah diperbarui.

- Jika `id` tidak ditemukan atau tidak valid:
  - Backend akan mengembalikan kode HTTP error (misalnya 404) dengan pesan error yang
    menjelaskan bahwa payment tidak ditemukan.

Frontend akan memanfaatkan respons ini untuk:

- Memperbarui data di store Zustand.
- Menyegarkan tampilan di tabel.
- Menghitung ulang metrik di halaman Dashboard (jumlah payment, total volume, dsb.).

---

### 3.3. Get Payment Status by Provider & Provider Ref (opsional, lokal)

Pada environment dev lokal, backend menyediakan endpoint lain untuk membaca status payment
berdasarkan kombinasi provider dan referensi provider.

- **Method:** GET  
- **Path (dev lokal):** `/payments/{provider}/{provider_ref}/status`

Endpoint ini **tidak wajib** dipakai di admin React saat ini, namun disediakan sebagai
opsi jika suatu saat dibutuhkan UI yang mengecek status menggunakan identitas provider.

**Parameter path:**

- `provider`: nama provider yang digunakan.
- `provider_ref`: referensi unik dari sisi provider (misalnya ID transaksi di Xendit/Midtrans).

**Perilaku:** mirip dengan get by ID, namun kunci pencariannya berbeda.

---

### 3.4. Webhook Simulator (opsional untuk UI)

- **Method:** POST  
- **Path:** `/webhooks/{provider}`  
- **Tujuan:** mensimulasikan panggilan webhook dari provider ke backend TenRusl.

Saat ini, endpoint ini umumnya dipakai dalam skenario backend‑to‑backend (misalnya dari
Postman atau tool lain). Aplikasi React admin **belum wajib** memanggil endpoint ini.
Namun, jika suatu saat ditambahkan fitur “Trigger Webhook” dari UI, modul tersebut akan:

1. Mengirim POST ke path tersebut dengan payload sesuai skenario.
2. Menunggu backend memproses webhook (dedup, idempotency, dsb.).
3. Menggunakan endpoint get payment detail untuk melihat efeknya di status payment.

---

## 4. Error Handling di Frontend

API client di frontend mengabstraksikan pola error berikut:

- **Kesalahan validasi input (4xx)**  
  Frontend menampilkan pesan error yang bersahabat di dekat field form atau dalam toast.

- **Kesalahan server (5xx) atau jaringan**  
  Frontend menampilkan pesan umum berupa kegagalan dan memungkinkan user mencoba lagi.

- **Idempotency conflict**  
  Jika backend menolak request karena kunci idempotensi sudah pernah dipakai,
  UI akan memperlakukan respons sesuai pesan error backend dan memberi tahu user
  bahwa payment tidak dibuat ulang.

Semua ini dikapsulasi di lapisan API client dan store Zustand sehingga komponen UI tetap
sederhana dan fokus pada presentasi.