# Changelog

Semua perubahan penting pada **TenRusl ReactTS Admin Payment** akan didokumentasikan di file ini.

Format mengikuti garis besar [Semantic Versioning](https://semver.org/).

---

## [0.1.0] - 2025-12-06

### Added

- Initial release proyek **TenRusl ReactTS Admin Payment**.
- Setup tooling:
  - Vite + React + TypeScript.
  - Tailwind CSS v4 + PostCSS.
  - ESLint + Prettier.
  - Vitest + Testing Library.
- Struktur fitur awal:
  - `Dashboard` page untuk ringkasan metrik payment.
  - `Payments` module:
    - Form "Create Payment" (React Hook Form + Zod).
    - Tabel payments dengan pagination dasar.
    - Integrasi ke TenRusl Payment Webhook Simulator via `VITE_API_BASE_URL`.
  - `Users` module:
    - Tabel users + form dummy (data mock) sebagai contoh CRUD admin.
- Konfigurasi CI:
  - Workflow GitHub Actions untuk lint, test, dan build.
- Dokumentasi dasar:
  - `README.md` awal.
  - `docs/api-tenrusl.md` (ringkasan endpoint backend).
  - `docs/architecture.md` (arsitektur front-end ringkas).
