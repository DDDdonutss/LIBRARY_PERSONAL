# Riwayat Commit

Penjelasan dalam bahasa Indonesia untuk setiap commit di branch `main`: apa yang diubah dan apa maksudnya. Judul commit asli tetap apa adanya (bahasa Inggris, format Conventional Commits). History tidak ditulis ulang, karena SHA commit dirujuk di [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md), di halaman PR, dan di issue.

**Cakupan:** 94 commit di `main`, dari [`0f942d6`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/0f942d6397dd2abfa17b37b0142e83904e5fe70e) (2026-11-13) sampai [`592fb59`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/592fb595a70fae0ee1194488db37ad3bb9c61bd1) (merge PR #43, 2026-11-21). Commit sesudahnya dicatat pada pembaruan berikutnya.

## Cara Membaca

- Hampir semua perubahan masuk lewat Pull Request (PR) dan di-merge dengan "Create a merge commit". Karena itu `main` berisi commit merge berjudul "Merge pull request #N from DDDdonutss/<branch>", yang membawa commit-commit di dalam PR tersebut. Di dokumen ini, commit merge ditulis di bawah judul setiap PR.
- Nomor yang dilewati (#9–#16, #22–#23, #29–#34) adalah nomor issue. GitHub memakai satu urutan nomor untuk issue dan PR.
- Klik SHA untuk membuka commit di GitHub, atau nomor PR untuk membuka diskusi dan isinya.

| Awalan judul | Arti |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug atau celah |
| `docs` | Dokumen saja |
| `test` | Pengujian |
| `chore` | Persiapan atau perawatan project |
| `refactor` | Merapikan kode tanpa mengubah perilaku |
| `style` | Format kode saja |

Teks dalam kurung setelah awalan menunjukkan bagian yang diubah, mis. `feat(auth)` berarti fitur baru di modul autentikasi.

## Ringkasan

| Tanggal | Isi | PR |
|---|---|---|
| 13–14 Nov 2026 | Backend: setup, autentikasi, kategori, kelola buku, dan dokumen | [#1](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/1)–[#5](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/5) |
| 14 Nov 2026 | Perbaikan validasi nama dan statistik untuk dashboard | [#6](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/6)–[#8](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/8) |
| 15 Nov 2026 | Pelacakan lewat GitHub Issues, hapus Observe, kategori final, audit dokumen | [#17](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/17)–[#21](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/21) |
| 17 Nov 2026 | Hardening backend, token akun terhapus, rate limiting, unit test dan CI | [#24](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/24)–[#28](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/28) |
| 18 Nov 2026 | Edit README lewat web GitHub | — |
| 21 Nov 2026 | Frontend dalam 6 tahap, tes Bruno tambahan, dokumentasi rilis | [#35](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/35)–[#43](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/43) |

## Detail per PR

### Langsung ke `main` (tanpa PR)

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`0f942d6`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/0f942d6397dd2abfa17b37b0142e83904e5fe70e) | 2026-11-13 | chore: initialize project structure and documentation | Commit pertama: kerangka repository berisi `README.md`, `.gitignore`, PRD (kebutuhan produk), dan jobdesk Team Lead. |
| [`ec4c453`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ec4c4536af661099d7b2da075a46979d0abd1861) | 2026-11-13 | chore(backend): initialize NestJS application | Membuat aplikasi backend NestJS di folder `backend/` dari template bawaan, beserta konfigurasi lint (oxlint), format (Prettier), dan TypeScript. |

### PR [#1](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/1) — Fondasi database

Merge [`51d8fb7`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/51d8fb748c7730224e58f3dcd5ea8b93357850c9) · 2026-11-14 · branch `feature/backend-setup`

Memasang Prisma 7 dan membuat skema serta migrasi database pertama.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`bcba60c`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/bcba60ce2eae978db900d6ad634c3ae8bc00274d) | 2026-11-13 | chore(backend): set up Prisma database foundation | Memasang Prisma 7, membuat skema database (`schema.prisma`), dan migrasi awal `20261113060551_init`. |

### PR [#2](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/2) — Autentikasi

Merge [`40c9d2d`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/40c9d2dcdc17591b44eb054bdef2095b2019b90c) · 2026-11-14 · branch `feature/backend-auth`

Daftar akun, masuk dengan token JWT, dan data pengguna yang sedang masuk, lengkap dengan tes Bruno dan API Contract bagian autentikasi.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`86d13d3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/86d13d34f0d686eeee3c6b6a195dfc2213136c7b) | 2026-11-13 | feat(auth): implement user registration | Fitur daftar akun (`POST /auth/register`): input divalidasi dan password disimpan sebagai hash. |
| [`a04d65a`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/a04d65a06c17f6bb35b50da5921b27a513c47dcc) | 2026-11-13 | docs: record checkpoint commits in implementation log | Mencatat commit-commit awal (checkpoint) di Implementation Log. |
| [`6cfee46`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/6cfee467f132f59ce9d9b7a1d33342ea3bade1e6) | 2026-11-13 | fix(auth): return correct status codes for registration errors | Perbaikan: error saat daftar akun kini mengembalikan kode status yang benar, mis. 409 untuk email yang sudah terdaftar. |
| [`43dfa87`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/43dfa8717d6f06cda2e2f8826779a6f8cc7f9341) | 2026-11-13 | feat(backend): add /api/v1 prefix and validate JWT config at startup | Semua endpoint diberi awalan `/api/v1`, dan aplikasi menolak start bila konfigurasi JWT tidak valid. |
| [`ed82f30`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ed82f30472a73a3b4dfdc902d35eec642d4a52d5) | 2026-11-13 | style(backend): remove BOM and stray blank lines | Merapikan format: menghapus karakter BOM dan baris kosong berlebih. Perilaku tidak berubah. |
| [`54b7a47`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/54b7a4748059c4ee7b69f1852312cb5472cdfe0a) | 2026-11-13 | docs: record register stabilization in implementation log | Mencatat perbaikan fitur daftar akun di Implementation Log. |
| [`6461cbc`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/6461cbc07d92f801ad9409a208a400e4eb984568) | 2026-11-13 | chore(backend): add .env.example and prisma generate scripts | Menambah `.env.example` (contoh konfigurasi) dan script `prisma generate`, agar clone baru bisa langsung di-build. |
| [`592385e`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/592385ec8ae3d87f7ce87afd89e28bb908e5de4a) | 2026-11-13 | test(api): add Bruno collection for registration | Koleksi Bruno (uji API) untuk daftar akun: berhasil, email ganda (termasuk beda huruf besar/kecil), dan input tidak valid. |
| [`263f008`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/263f0088637b58b63db25a07c369c2103fac1c7d) | 2026-11-13 | feat(auth): add login, JWT guard and current user endpoint | Fitur masuk (`POST /auth/login`) yang mengembalikan token JWT, guard untuk endpoint yang butuh login, dan `GET /auth/me` untuk data pengguna yang sedang masuk. |
| [`c20b748`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/c20b748ffb449c203dc6496a703c40f08ae1da9c) | 2026-11-13 | feat(backend): enable CORS for the frontend origin | Mengizinkan request dari alamat frontend (CORS). Alamatnya diatur lewat `.env`. |
| [`84b50c0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/84b50c0f6f6d3139953e4a0e2899462162e04ddf) | 2026-11-13 | test(api): add Bruno tests for login and current user | Tes Bruno untuk masuk (berhasil, password salah, email tidak dikenal, beda huruf besar/kecil, input tidak valid) dan `GET /auth/me`. |
| [`ee83aa4`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ee83aa4dfcd2235d16eac823fe022cebfbe2d10d) | 2026-11-13 | docs: add API contract for auth and record auth progress | Membuat `docs/API-CONTRACT.md` bagian autentikasi dan mencatat progresnya. |

### PR [#3](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/3) — Kategori

Merge [`8b8d2d5`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/8b8d2d54658e44460c01c990be0694e4d8c34549) · 2026-11-14 · branch `feature/backend-categories`

Kategori global yang dipakai semua pengguna: data awal (seed) dan endpoint `GET /categories`.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`1005c7a`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/1005c7a20968f4c7eab3d0dd2bb2f5b6dbeb8546) | 2026-11-13 | chore(db): add global category seed | Script seed untuk mengisi kategori global yang dipakai semua pengguna. |
| [`2b629a1`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/2b629a1855ffc4c8885924587fd6dfc5bc31b913) | 2026-11-13 | feat(categories): add global category endpoint | Endpoint `GET /categories` untuk mengambil daftar kategori. |
| [`3099a96`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/3099a96fb2ab433add4c76d266f8ed36e7df3a29) | 2026-11-13 | test(api): add Bruno tests for categories | Tes Bruno kategori: daftar kategori, tanpa token (401), dan hasil yang sama untuk pengguna lain. |
| [`6f4fc22`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/6f4fc224fde0c6a264c1af9fa7edf9811b29c2e4) | 2026-11-13 | docs: document category API and record progress | Mendokumentasikan endpoint kategori di API Contract dan mencatat progres. |

### PR [#4](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/4) — Kelola buku

Merge [`bcc5de5`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/bcc5de540e187be957da647c6cd4e0f18624c1b7) · 2026-11-14 · branch `feature/backend-books`

Tambah, lihat, ubah, dan hapus buku dengan pencarian, filter, dan pagination, beserta tes Bruno, tes e2e, dan README backend.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`6f0c7e0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/6f0c7e04e731029906c8a7a06c01a7f83b4dc551) | 2026-11-13 | feat(books): add book CRUD with search, filters and pagination | Fitur kelola buku: tambah, lihat, ubah, dan hapus, dengan pencarian judul, filter status dan kategori, serta pagination. Setiap pengguna hanya mengakses bukunya sendiri. |
| [`016a0c1`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/016a0c1197231b5d05d32ef7b51bd300d4025219) | 2026-11-13 | test(api): add Bruno tests for books and data ownership | Tes Bruno untuk buku, termasuk memastikan pengguna lain tidak bisa melihat, mengubah, atau menghapus buku yang bukan miliknya. |
| [`2aab5b0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/2aab5b06a28a7e2d494ed1efc18476a1c99e291a) | 2026-11-13 | docs: document books API and record book management progress | Mendokumentasikan endpoint buku di API Contract dan mencatat progres. |
| [`29129ad`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/29129adaa25aa4a7553b8cceb8355fae2ff154cb) | 2026-11-13 | docs(backend): replace scaffold README with setup and usage guide | Mengganti README bawaan NestJS dengan panduan setup dan penggunaan backend. |
| [`92cbcdd`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/92cbcdda3e31fab5a2777084424f7202ca920d9b) | 2026-11-13 | docs: record backend README in implementation log | Mencatat README backend di Implementation Log. |
| [`f1608b1`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/f1608b100204217ba35089529db2e19d0e047570) | 2026-11-13 | refactor(backend): extract global app configuration into configureApp | Memindahkan pengaturan global aplikasi ke satu fungsi `configureApp` agar bisa dipakai ulang, mis. oleh tes e2e. Perilaku tidak berubah. |
| [`7aa750c`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/7aa750ccba8458eeefcaf0e757d01ea892dc88e3) | 2026-11-13 | refactor(backend): remove scaffold Hello World endpoint | Menghapus endpoint contoh "Hello World" bawaan template. |
| [`d3616be`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/d3616be8601de81025b74cdf739b41e081af76cc) | 2026-11-13 | test(e2e): replace scaffold test with end-to-end API suite | Mengganti tes contoh dengan rangkaian tes end-to-end (Vitest) yang menguji API sungguhan. |
| [`22bd949`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/22bd949021c9d2cec9cb8d085a484c175292749a) | 2026-11-13 | docs: document e2e tests and record hello world removal | Mendokumentasikan tes e2e di README dan mencatat penghapusan endpoint contoh. |

### PR [#5](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/5) — Sinkronisasi dokumen

Merge [`5737185`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/57371853312d1d63eff979cc5792649f44cdb103) · 2026-11-14 · branch `docs/sync-project-docs`

Menyamakan dokumen dengan kode dan memindahkan project ke repository `LIBRARY_PERSONAL`.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`ae19af3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ae19af30539bbc7b46a5e0d02590805260c652f3) | 2026-11-13 | docs: sync project documentation with implementation | Menyamakan isi dokumen (README, PRD, API Contract, jobdesk) dengan kode yang sudah dibuat. |
| [`46bdef3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/46bdef3eb2a567face5e6d3b9c57c5f886e476ee) | 2026-11-13 | docs: point documentation to the PENYIMPAN_BUKU repository | Mengarahkan tautan dokumen ke repository `PENYIMPAN_BUKU`, yang sempat dipakai sebelum pindah. |
| [`b16f9f7`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/b16f9f7ec791a07b37373b0cc191094b5048d112) | 2026-11-13 | docs: move to LIBRARY_PERSONAL and keep MASTER-PROMPT internal | Pindah ke repository `LIBRARY_PERSONAL` (yang dipakai sampai sekarang). `MASTER-PROMPT.md` dijadikan dokumen internal dan tidak di-commit. |
| [`a4d798f`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/a4d798f43cb76f798faff74b802c0d89c72d861e) | 2026-11-13 | docs: record that old repositories need manual deletion | Mencatat bahwa repository lama perlu dihapus secara manual. |

### PR [#6](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/6) — Perbaikan validasi nama

Merge [`9df7c4e`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/9df7c4e912b0c37080e35231060a4a47766c46f4) · 2026-11-14 · branch `fix/register-name-trim`

Nama yang hanya berisi spasi kini ditolak saat daftar akun.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`2d8c0a8`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/2d8c0a8086ce24d305eeff3298cbba69e0dfab56) | 2026-11-14 | fix(auth): reject whitespace-only names at registration | Perbaikan: nama berisi spasi saja sebelumnya lolos validasi dan tersimpan kosong. Sekarang nama di-trim dulu baru divalidasi, sama seperti form buku; ditambah tes e2e. |
| [`a6e9aed`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/a6e9aed6b34ae001a38e8f4d820ffb98d09f1d81) | 2026-11-14 | docs: record PR merges and the register name validation fix | Mencatat merge PR sebelumnya dan perbaikan validasi nama. |

### PR [#7](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/7) — Statistik untuk dashboard

Merge [`ae82f1d`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ae82f1de6bd9fe589e4f5dc5a05b91d28459de87) · 2026-11-14 · branch `feature/backend-book-stats`

Endpoint `GET /books/stats`, sumber data halaman dashboard.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`ed34f55`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ed34f554978fb3bb7083e522722e6f9140fa8236) | 2026-11-14 | feat(books): add collection statistics endpoint for the dashboard | Endpoint `GET /books/stats`: total buku, jumlah per status, dan jumlah per kategori milik pengguna, dihitung langsung di database (bukan dengan mengambil seluruh daftar). |
| [`703580e`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/703580ed025932b647859cc3c82fc3a93e7d2cf2) | 2026-11-14 | docs: document the statistics endpoint and update project scope | Mendokumentasikan endpoint statistik dan memasukkan dashboard ke scope project. |

### PR [#8](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/8) — Perbaikan statistik

Merge [`cd252f3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/cd252f341eb3b3f7bbfe7ad56b38c85ebe986e35) · 2026-11-14 · branch `fix/book-stats-review`

Perbaikan hasil code review endpoint statistik.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`8de7ff3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/8de7ff396fe2a0767c63c574d4010aeb63ebc90f) | 2026-11-14 | fix(books): make collection statistics consistent and self-contained | Perbaikan hasil review: total, jumlah per status, dan jumlah per kategori dihitung dari satu query, sehingga ketiganya selalu konsisten. |
| [`ef3a244`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ef3a244da5497d7993cd9f04136133c2a9e1b041) | 2026-11-14 | docs: record PR #6-#7 merges, review results and statistics fixes | Mencatat merge PR #6–#7, hasil review, dan perbaikan statistik. |

### PR [#17](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/17) — Mulai memakai GitHub Issues

Merge [`224b784`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/224b784c9628d449b496e9e587f3eed1d045d081) · 2026-11-15 · branch `docs/record-pr-8`

Mencatat merge PR #8 dan menautkan pekerjaan sisa ke issue #9–#16.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`4221517`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/42215175fb9682a77603e8c930eaf668f3cad183) | 2026-11-15 | docs: record PR #8 merge and GitHub issue tracking | Mencatat merge PR #8; pekerjaan sisa mulai dilacak di GitHub Issues. |
| [`87bd3e4`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/87bd3e43d459011c6f54227665195e4242e1adde) | 2026-11-15 | docs: link remaining work to GitHub issues #9-#16 | Menautkan setiap pekerjaan sisa di dokumen ke issue #9–#16. |
| [`0ba57b0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/0ba57b0477bd88b9bfa05a557c9cbed39ab6aa48) | 2026-11-15 | docs: record branches linked to issues #10-#16 | Mencatat branch yang dibuat untuk issue #10–#16. |

### PR [#18](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/18) — Hapus NestJS Observe

Merge [`eabb131`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/eabb13159ae41ff1511c210f8c58ab8fe1a82378) · 2026-11-15 · branch `chore/observe-module-decision`

Menghapus integrasi telemetri eksternal sesuai keputusan issue #10.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`bfa7542`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/bfa7542744bf2d785b68a39e7b4f84f2355398b5) | 2026-11-15 | chore(backend): remove nestjs observe integration | Menghapus paket NestJS Observe (pengiriman telemetri ke layanan luar) dari kode, konfigurasi, dan dependensi. Keputusan issue #10. |

### PR [#19](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/19) — Kategori final

Merge [`f57d87e`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/f57d87edaae03773d013ebc8662087d914ba5658) · 2026-11-15 · branch `chore/category-list`

Menetapkan 6 kategori dan memastikan `GET /categories` tetap wajib login (issue #11).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`7b3b229`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/7b3b229c1b7c3576d7ec8c2d4361162a31a68e80) | 2026-11-15 | chore(categories): finalize category list and keep GET /categories protected | Menetapkan 6 kategori final di seed dan memastikan `GET /categories` tetap butuh login; tes dan dokumen disesuaikan (issue #11). |

### PR [#20](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/20) — Catatan PR #18–#19

Merge [`b245340`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/b24534058e370fb849acd265b47db70b205f088e) · 2026-11-15 · branch `docs/record-pr-18-19`

Mencatat merge PR #18 dan #19.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`ea55c95`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ea55c958c112cb004ad1783dfc0d8ddb618b287f) | 2026-11-15 | docs: record PR #18-#19 merges and before/after comparison | Mencatat merge PR #18–#19 beserta perbandingan sebelum dan sesudahnya. |

### PR [#21](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/21) — Audit dokumen

Merge [`90a8888`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/90a8888c3a8243d25589f4557ef2f4eca99aa87f) · 2026-11-15 · branch `docs/sync-docs-audit`

Memperbaiki versi dan informasi yang usang di dokumen.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`4867b82`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/4867b82118638b40eab5a7185188e9950a8feecd) | 2026-11-15 | docs: fix stale versions and record documentation audit | Audit dokumen: memperbaiki versi dan informasi yang sudah usang. |

### PR [#24](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/24) — Hardening backend

Merge [`906edf5`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/906edf5837a944217d4013b2fc7e8756ba629bea) · 2026-11-17 · branch `fix/backend-hardening`

Memperbaiki temuan audit kode (issue #22 dan #16).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`ff3422c`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ff3422c85ad41a2b6783e7d84f13db3354cc7cf7) | 2026-11-17 | style(prisma): format prisma module and service with Prettier | Merapikan format dua file modul Prisma dengan Prettier (issue #16). Perilaku tidak berubah. |
| [`48bf887`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/48bf887de4baeb715328dc46fa865c456f2ebf34) | 2026-11-17 | fix(backend): harden JWT expiry, pagination, search, and Prisma errors | Perbaikan hasil audit kode (issue #22): format `JWT_EXPIRES_IN` divalidasi saat start, email di-trim sebelum divalidasi, batas atas `page`, pencarian aman untuk karakter khusus, dan error database dipetakan ke kode status yang tepat. |
| [`a66df34`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/a66df344ae68572d04b309db8ad8e0dac8ff2062) | 2026-11-17 | docs: record code audit and backend hardening (#22, #16) | Mencatat hasil audit kode dan hardening backend. |

### PR [#25](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/25) — Token akun terhapus

Merge [`63ca322`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/63ca32244b9c854c2a472e2a63b8d24d23b7cffc) · 2026-11-17 · branch `fix/jwt-deleted-user`

Menolak token milik akun yang sudah dihapus (issue #15) dan menerapkan perbaikan hasil review PR #24.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`411c998`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/411c998167127f0132c3e37ba88a293311190556) | 2026-11-17 | fix(auth): reject tokens of deleted users and apply PR #24 review fixes | Token milik akun yang sudah dihapus kini ditolak (401) di semua endpoint (issue #15), ditambah perbaikan hasil review PR #24. |
| [`8be53db`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/8be53db23ed3454e8e50c129ee4ceac53a648a18) | 2026-11-17 | docs: record PR #24 merge, review results, and deleted-user tokens (#15) | Mencatat merge PR #24, hasil review, dan perubahan untuk token akun terhapus. |

### PR [#26](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/26) — Rate limiting

Merge [`278e95c`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/278e95c7adccf75ab288be6dfc7b333994afd075) · 2026-11-17 · branch `feature/auth-rate-limit`

Membatasi percobaan login dan daftar akun per IP (issue #14).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`f4d2a30`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/f4d2a30d889e680ad0c253291d6b4c8386a84775) | 2026-11-17 | feat(auth): rate limit login and register per IP | Membatasi percobaan login dan daftar akun per IP: bawaan 5 kali per menit, diatur lewat `AUTH_RATE_LIMIT_PER_MINUTE`. Selebihnya dijawab 429. |
| [`dda51e8`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/dda51e846f064dc3a6e063ff07ed73da6fb6db92) | 2026-11-17 | docs: record PR #25 merge, issue #10 closure, and rate limiting (#14) | Mencatat merge PR #25, penutupan issue #10, dan rate limiting. |

### PR [#27](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/27) — Unit test dan CI

Merge [`08be376`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/08be3763c2a33985ad6508246eb897144dce3a44) · 2026-11-17 · branch `chore/tests-ci`

Menambah unit test serta CI GitHub Actions yang berjalan di setiap PR (issue #23).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`d28b47c`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/d28b47ca34cfcb1e5f01a35ab7b849a2d1f4dcd2) | 2026-11-17 | test: cover auth and book write paths and add GitHub Actions CI | Unit test tambahan untuk autentikasi dan buku, tes e2e untuk token kedaluwarsa dan daftar akun bersamaan, serta CI GitHub Actions yang menjalankan pemeriksaan dan semua tes di setiap PR. |
| [`c75ba12`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/c75ba12f11f3a89e60de7d9e5e5943130e5f45a1) | 2026-11-17 | test: sort status codes numerically in parallel register test | Perbaikan kecil di tes: kode status diurutkan sebagai angka, sesuai peringatan lint yang muncul di CI. |
| [`353659f`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/353659f0acb7e5f90ba51d28a734b7f976e8206b) | 2026-11-17 | docs: record PR #26 merge, tests, and CI (#23) | Mencatat merge PR #26, tes baru, dan CI. |

### PR [#28](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/28) — Tugas frontend di issue #12

Merge [`addedeb`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/addedeb75b2c0de490c77d754b049ff50ca667b3) · 2026-11-17 · branch `docs/record-pr-27`

Mencatat merge PR #27 dan melengkapi daftar tugas frontend.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`6cf9d5a`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/6cf9d5ac459bc6fd375da155b0114bc6948bf3e3) | 2026-11-17 | docs: record PR #27 merge and complete frontend tasks in issue #12 | Mencatat merge PR #27 dan melengkapi daftar tugas frontend di issue #12. |

### Langsung ke `main` (tanpa PR)

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`c7154b3`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/c7154b352e700a8d26c2c0c3bdb3d401542dfd5c) | 2026-11-18 | edit readme.md | Edit langsung lewat web GitHub. Judulnya kurang deskriptif; isinya menghapus baris `docs/MASTER-PROMPT.md` dari tabel Dokumentasi di `README.md`, karena dokumen itu internal dan tidak ada di repository. |

### PR [#35](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/35) — Frontend 1/6: setup

Merge [`2ca49f9`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/2ca49f980c9087f7e86bf1c38e72dee940d64e66) · 2026-11-21 · branch `feature/frontend-setup`

Aplikasi Next.js dan fondasinya (issue #29).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`727be34`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/727be34d43ea5bbae5b813ae8670e38a051216e4) | 2026-11-21 | feat(frontend): set up Next.js app and API client | Membuat aplikasi frontend Next.js di folder `frontend/` beserta fondasinya: satu fungsi pemanggil API yang menangani semua kode error, tipe data, label status, penyimpanan token, dan README. |

### PR [#36](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/36) — Frontend 2/6: daftar akun, masuk, keluar

Merge [`c874245`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/c8742457ecbba11166611321af405174e863bf32) · 2026-11-21 · branch `feature/frontend-auth`

Halaman autentikasi dan penjagaan halaman yang butuh login (issue #30).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`cd92f47`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/cd92f4728aedfef035ad5829a0c8bd3df4893ee5) | 2026-11-21 | feat(frontend): add register, login, logout, and protected pages | Halaman daftar akun dan masuk (validasi sama dengan backend), layout yang mewajibkan login, header dengan nama pengguna, dan tombol Keluar. |

### PR [#37](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/37) — Frontend 3/6: daftar dan tambah buku

Merge [`b0bd861`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/b0bd8618139c3ceab6c5b0e2671b53095ccdb5ee) · 2026-11-21 · branch `feature/frontend-books`

Halaman daftar buku dan tambah buku (issue #31).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`c886156`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/c886156ae20f8e30e46667741d8237775a4d70de) | 2026-11-21 | feat(frontend): add book list and create book page | Halaman daftar buku (halaman pertama) dan halaman tambah buku dengan pilihan kategori. |

### PR [#38](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/38) — Frontend 4/6: detail, ubah, hapus

Merge [`dd98ef5`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/dd98ef5a72d413bf77e4a6f62c4891370d51c1f6) · 2026-11-21 · branch `feature/frontend-book-detail`

Halaman detail buku dan ganti status dari daftar (issue #32).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`08c85d0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/08c85d0e96909780125684678c863258afb33b9b) | 2026-11-21 | feat(frontend): add book detail, edit, delete, and status change | Halaman detail untuk melihat, mengubah, dan menghapus buku; status juga bisa diganti langsung dari daftar. |

### PR [#39](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/39) — Frontend 5/6: cari, filter, pindah halaman

Merge [`663892f`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/663892f52a97d207d2cf7096867bb0a0af26f585) · 2026-11-21 · branch `feature/frontend-books-search`

Pencarian, filter, dan pagination di daftar buku (issue #33).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`f9a90f1`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/f9a90f1e22ee1836200f28edb07e16eabbeef085) | 2026-11-21 | feat(frontend): add search, filters, and pagination to the book list | Cari judul, filter status dan kategori, serta pindah halaman di daftar buku. Parameter kosong tidak dikirim ke backend. |

### PR [#40](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/40) — Frontend 6/6: dashboard

Merge [`ede065b`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/ede065b8c34394297b62da71202b11bce729c86d) · 2026-11-21 · branch `feature/frontend-dashboard`

Halaman dashboard dan menu di header (issue #34).

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`b09e8b0`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/b09e8b0aac9a1832aeb7b416170e0ded48f702e5) | 2026-11-21 | feat(frontend): add dashboard page and header menu | Halaman dashboard (total, per status, per kategori), menu Buku dan Dashboard di header, dan README frontend yang lengkap. |

### PR [#41](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/41) — Tes Bruno untuk kontrak frontend

Merge [`2559e7b`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/2559e7bde088fbd3da20f6441cfb6cc7b40f45ec) · 2026-11-21 · branch `test/bruno-frontend-contract`

Enam tes API untuk aturan yang dipakai frontend, lalu aturan itu ditulis di API Contract.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`729d97b`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/729d97bc1173c98225eb4708ee99584d88f3bfaf) | 2026-11-21 | test(api): cover empty query params and categoryId/PATCH edge cases | Enam tes Bruno baru untuk aturan API yang dipakai frontend: parameter query kosong, `categoryId` null atau string kosong, dan field di luar kontrak. |
| [`a1709f4`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/a1709f4e0bf7f6894f0823ee14c75b21510989a7) | 2026-11-21 | docs(api): state empty query param and empty categoryId rules | Menuliskan aturan tersebut di API Contract (§4.2 dan §4.4). |

### PR [#42](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/42) — Dokumentasi rilis frontend

Merge [`d28c4ce`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/d28c4ce58ac1bd159998c3e600d22353e094cafb) · 2026-11-21 · branch `docs/record-frontend-prs`

Mencatat rilis frontend di dokumen dan menutup issue #12.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`45f6da7`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/45f6da7e8139c239366fd12b3f13dbd1528e549e) | 2026-11-21 | docs: record frontend release and update project status | Mencatat rilis frontend di Implementation Log, serta memperbarui README, PRD, dan jobdesk. |

### PR [#43](https://github.com/DDDdonutss/LIBRARY_PERSONAL/pull/43) — Catatan PR #42 dan pembersihan branch

Merge [`592fb59`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/592fb595a70fae0ee1194488db37ad3bb9c61bd1) · 2026-11-21 · branch `docs/record-pr-42`

Mencatat merge PR #42 dan penghapusan dua branch lama.

| Commit | Tanggal | Judul asli | Maksud perubahan |
|---|---|---|---|
| [`832f571`](https://github.com/DDDdonutss/LIBRARY_PERSONAL/commit/832f5711c0a1230cb16f2bf2c0dcaed3c689c588) | 2026-11-21 | docs: record PR #42 merge and old branch cleanup | Mencatat merge PR #42 dan penghapusan dua branch lama di Implementation Log. |
