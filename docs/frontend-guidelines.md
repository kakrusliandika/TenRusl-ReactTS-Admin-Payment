# Frontend Guidelines – TenRusl ReactTS Admin Payment

Dokumen ini menyatukan standar penulisan kode front-end untuk proyek
**TenRusl ReactTS Admin Payment**. Tujuannya agar semua kontributor memiliki gaya
yang konsisten dan mudah dipelihara.

---

## 1. Gaya Penulisan Komponen

### 1.1. Jenis Komponen

- Gunakan **function component** (bukan class component).
- Komponen yang memakai state atau efek menggunakan **React hooks**.
- Komponen murni presentasional diusahakan tetap “dumb” (hanya menerima props).

### 1.2. Hooks

- Semua hooks kustom diberi prefix `use` (misalnya `useToast`, `usePagination`).
- Hooks hanya dipanggil:
  - di level atas function component,
  - atau di hooks lain,
  - **bukan** di dalam kondisi atau loop.
- Untuk hooks global (misalnya store Zustand), gunakan selector untuk menghindari rerender besar.

### 1.3. Struktur Komponen

Setiap komponen diusahakan:

- Menerima `props` yang jelas (hindari objek besar tanpa tipe).
- Menghindari logika bisnis berat langsung di dalam JSX.
- Memecah bagian yang kompleks menjadi sub-komponen yang lebih kecil bila perlu.

---

## 2. Penamaan File, Folder, dan Komponen

### 2.1. Komponen & File TSX

- Nama komponen: **PascalCase** (contoh `CreatePaymentForm`, `PaymentsTable`).
- File komponen: sama dengan nama komponen utama di dalamnya (misalnya `CreatePaymentForm.tsx`).

### 2.2. Folder

- Fitur: `src/features/<nama-fitur>` dengan nama fitur **kebab-case** atau lowerCamel (misal `payments`, `users`).
- Sub-folder umum di dalam fitur:
  - `pages/` → halaman yang di-route.
  - `components/` → komponen khusus fitur.
  - `api.ts` → pemanggil API.
  - `store.ts` → Zustand store.
  - `types.ts` → definisi tipe data domain fitur.

### 2.3. Types & Helpers

- Nama tipe TypeScript:
  - gunakan PascalCase (`Payment`, `CreatePaymentPayload`, `User`).
- Nama fungsi helper:
  - gunakan camelCase (`formatCurrency`, `buildPaymentPayload`).

### 2.4. Import

- Import dari **shared layer** menggunakan alias atau path pendek (misalnya dari `lib`, `components/ui`, dsb.).
- Hindari import relatif yang terlalu dalam (misalnya `../../../..`): lebih baik gunakan alias jika diperlukan.

---

## 3. Pedoman Aksesibilitas (A11y)

Aplikasi admin ini harus dapat digunakan dengan nyaman oleh pengguna keyboard dan pembaca layar.

### 3.1. Struktur Semantik

- Gunakan elemen HTML semantik:
  - `button` untuk aksi, bukan `div` yang diberi click handler.
  - `form`, `label`, `input`, `select`, dsb. untuk elemen form.
  - `table`, `thead`, `tbody`, `th`, `td` untuk data tabular.
- Gunakan heading (`h1`, `h2`, dst.) secara hierarkis untuk halaman dan bagian utama.

### 3.2. Label & Form

- Setiap field form harus memiliki label yang jelas dan terkait dengan inputnya.
- Error validation ditampilkan dekat field serta disertai teks penjelas.
- Hindari mengandalkan warna saja untuk menunjukkan error; sertakan teks.

### 3.3. Focus & Keyboard

- Pastikan elemen interaktif dapat difokuskan dengan keyboard (`Tab`, `Shift+Tab`).
- Jangan hilangkan outline focus tanpa pengganti yang setara (misalnya ring Tailwind).
- Menandai state loading di area penting dengan atribut seperti `aria-busy`
  dan memberi indikator visual (spinner atau teks).

### 3.4. ARIA

- Gunakan atribut ARIA hanya bila diperlukan, misalnya:
  - `role="status"` pada area yang menampilkan pesan status.
  - `aria-live` pada area notifikasi yang perlu dibacakan pembaca layar.
- Hindari penggunaan ARIA yang berlebihan jika elemen HTML semantik sudah mencukupi.

---

## 4. Testing: Form dan Table

Pengujian menggunakan **Vitest** dan **React Testing Library**.

### 4.1. Prinsip Umum

- Uji **perilaku**, bukan implementasi internal.
- Berinteraksi dengan komponen seperti user:
  - gunakan event seperti klik, isi teks, submit form.
  - cari elemen dengan label, role, dan teks yang terlihat.
- Gunakan fixtures data di `src/test/fixtures` untuk konsistensi.

### 4.2. Test untuk Form

Hal yang sebaiknya diuji pada form (misalnya `CreatePaymentForm`):

1. Field wajib yang kosong memunculkan pesan error yang sesuai.
2. Input tidak valid (misalnya jumlah negatif, mata uang tidak valid) memunculkan pesan error yang tepat.
3. Submit form dengan nilai valid:
   - memanggil handler/store yang sesuai (misalnya action `createPayment`).
   - mengubah state loading bila diharapkan.
   - dapat mereset field tertentu setelah sukses jika desainnya memang seperti itu.

### 4.3. Test untuk Table

Untuk tabel seperti `PaymentsTable` atau `UsersTable`, hal yang sebaiknya diuji:

1. Tabel menampilkan baris sesuai jumlah data yang diberikan.
2. Teks penting (nama, amount, status) muncul di kolom yang semestinya.
3. Pagination mengubah subset data yang tampil saat kontrol halaman digunakan.
4. Tombol aksi (misalnya `Refresh`, `Edit`, `Delete`) memicu handler yang benar.

### 4.4. Struktur Test

- Lokasi test mengikuti struktur fitur:
  - Komponen UI generik: di `src/test/components/ui`.
  - Fitur tertentu: di `src/test/features/<fitur>`.
- Nama file test mengikuti nama komponen atau modul yang diuji (misal `CreatePaymentForm.test.tsx`).

---

## 5. Style & Konsistensi

### 5.1. Formatting

- Gunakan Prettier untuk semua file yang didukung (TypeScript, CSS, Markdown).
- Hindari mengubah pengaturan Prettier/ESLint tanpa diskusi terlebih dahulu.

### 5.2. Linting

- Jalankan `npm run lint` sebelum commit besar.
- Perbaiki peringatan lint atau berikan alasan kuat jika perlu di-ignore (dengan komentar singkat).

### 5.3. Commit Message

- Usahakan commit message yang deskriptif (misalnya `feat: add payments table pagination`,
  `fix: handle API error state on create payment`).

Dengan mengikuti panduan ini, kode front-end TenRusl ReactTS Admin Payment diharapkan
tetap mudah dibaca, konsisten, dan siap dikembangkan lebih lanjut.