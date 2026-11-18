# Delcom Blog Frontend (SPA) - ReactJS + Tailwind CSS

Frontend Single Page Application (SPA) modern untuk platform **Delcom Blog Multi-Tier & AI Generator**. Dibangun menggunakan React 19, Vite 6, Tailwind CSS v4, dan Vitest dengan target cakupan pengujian 100%.

## ✨ Fitur Utama

1. **Multi-Tier Role Architecture**:
   - **Tamu / Public**: Menjelajahi artikel terbit, pencarian real-time, filter kategori dinamis, dan membaca artikel dengan Toast UI Markdown Viewer.
   - **Author (Penulis)**: Dashboard workspace statistik artikel (Total, Terbit, Draf), pembuatan/pengeditan artikel dengan Toast UI Markdown Editor, sakelar publikasi cepat (publish/draft), dan integrasi AI Blog Generator.
   - **Admin (Administrator)**: Panel monitoring direktori pengguna dan arsip seluruh artikel sistem beserta modal inspeksi riwayat artikel per pengguna.

2. **AI Blog Generator (Integrated)**:
   - Menghasilkan draf artikel secara otomatis menggunakan Gemini AI backend dengan opsi aktivasi Google Search Grounding & sitasi referensi web.
   - Tombol *Terapkan Draf* langsung memuat judul, kategori, tags, dan konten ke dalam Editor Penulis.

3. **Komponen Sesuai Spesifikasi Praktikum**:
   - Form Login & Register memiliki ID wajib pengujian: `id="login-username"`, `id="login-password"`, dan `id="login-submit"`.
   - Modal Fullscreen (`max-w-[96vw]`, `max-h-[96vh]`) dengan header dan footer berwarna khusus (*distinct colored header/footer*).
   - Toast UI Markdown Editor & Viewer terintegrasi dengan styling responsif.
   - Mode Gelap / Terang (*Dark/Light Mode Toggle*) yang tersimpan di `localStorage`.

4. **Kualitas & Pengujian (100% Code Coverage)**:
   - Diuji menggunakan Vitest dan React Testing Library dengan `@vitest/coverage-v8`.
   - Memenuhi ambang batas ketat 100% untuk Statements, Branches, Functions, dan Lines di seluruh file sumber aplikasi.

---

## 🛠️ Panduan Instalasi & Menjalankan

### Prasyarat
- Node.js versi 18+ (disarankan Node.js 20+)
- Backend Golang Gin berjalan di `http://localhost:8081`

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Server Pengembangan (Dev)
Aplikasi berjalan pada port `5174` dengan reverse proxy otomatis `/api` ke backend `http://localhost:8081`:
```bash
npm run dev
```

Buka peramban di [http://localhost:5174](http://localhost:5174).

### Menjalankan Pengujian & Laporan Coverage
```bash
npm test
```

### Membangun Versi Produksi
```bash
npm run build
```

---

## 📁 Struktur Direktori

```
src/
├── components/                  # Komponen Reusable UI
│   ├── MarkdownEditor.jsx       # Wrapper Toast UI Editor
│   └── MarkdownViewer.jsx       # Wrapper Toast UI Viewer
├── features/
│   ├── admin/                   # Modul Administrator
│   │   ├── api/adminApi.js      # Endpoint admin (users, posts)
│   │   └── components/
│   │       └── AdminDashboard.jsx
│   ├── auth/                    # Modul Autentikasi
│   │   ├── api/authApi.js       # Endpoint login & register
│   │   ├── components/
│   │   │   └── AuthPage.jsx     # Halaman login/register dedicated
│   │   └── modals/
│   │       └── AuthModal.jsx    # Modal login/register pop-up
│   └── blog/                    # Modul Blog & Penulis
│       ├── api/blogApi.js       # Endpoint posts, stats, AI generator
│       ├── components/
│       │   ├── AuthorDashboard.jsx
│       │   ├── PostStats.jsx
│       │   ├── PublicArticleDetail.jsx
│       │   ├── PublicArticleList.jsx
│       │   └── StickyNavbar.jsx
│       └── modals/
│           ├── AiPostGeneratorModal.jsx
│           └── PostModal.jsx
├── helpers/
│   ├── apiHelper.js             # Fetch wrapper & Token management
│   └── toolsHelper.js           # SweetAlert2 & Date formatting
├── hooks/
│   ├── useInput.js              # Controlled input hook
│   └── useTheme.js              # Dark/light mode theme hook
├── App.jsx                      # Router & SPA Layout Controller
├── index.css                    # Tailwind CSS v4 & theme import
├── main.jsx                     # Entrypoint React
└── setupTests.js                # JSDOM polyfills & test environment
```

---

## 🧪 Hasil Laporan Cakupan Pengujian (Vitest v8)

```text
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |                   
 src               |     100 |      100 |     100 |     100 |                   
  App.jsx          |     100 |      100 |     100 |     100 |                   
  main.jsx         |     100 |      100 |     100 |     100 |                   
 src/components    |     100 |      100 |     100 |     100 |                   
  ...ownEditor.jsx |     100 |      100 |     100 |     100 |                   
  ...ownViewer.jsx |     100 |      100 |     100 |     100 |                   
 ...ures/admin/api |     100 |      100 |     100 |     100 |                   
  adminApi.js      |     100 |      100 |     100 |     100 |                   
 ...min/components |     100 |      100 |     100 |     100 |                   
  ...Dashboard.jsx |     100 |      100 |     100 |     100 |                   
 ...tures/auth/api |     100 |      100 |     100 |     100 |                   
  authApi.js       |     100 |      100 |     100 |     100 |                   
 ...uth/components |     100 |      100 |     100 |     100 |                   
  AuthPage.jsx     |     100 |      100 |     100 |     100 |                   
 ...es/auth/modals |     100 |      100 |     100 |     100 |                   
  AuthModal.jsx    |     100 |      100 |     100 |     100 |                   
 ...tures/blog/api |     100 |      100 |     100 |     100 |                   
  blogApi.js       |     100 |      100 |     100 |     100 |                   
 ...log/components |     100 |      100 |     100 |     100 |                   
  ...Dashboard.jsx |     100 |      100 |     100 |     100 |                   
  PostStats.jsx    |     100 |      100 |     100 |     100 |                   
  ...cleDetail.jsx |     100 |      100 |     100 |     100 |                   
  ...ticleList.jsx |     100 |      100 |     100 |     100 |                   
  StickyNavbar.jsx |     100 |      100 |     100 |     100 |                   
 ...es/blog/modals |     100 |      100 |     100 |     100 |                   
  ...atorModal.jsx |     100 |      100 |     100 |     100 |                   
  PostModal.jsx    |     100 |      100 |     100 |     100 |                   
 src/helpers       |     100 |      100 |     100 |     100 |                   
  apiHelper.js     |     100 |      100 |     100 |     100 |                   
  toolsHelper.js   |     100 |      100 |     100 |     100 |                   
 src/hooks         |     100 |      100 |     100 |     100 |                   
  useInput.js      |     100 |      100 |     100 |     100 |                   
  useTheme.js      |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```
