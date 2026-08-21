# Nebeng — Frontend

Frontend aplikasi **Nebeng**, platform titip-nebeng penumpang & paket berbasis
jaringan Pos/Mitra, dengan 5 peran pengguna: **Customer**, **Mitra**,
**Operator Pos**, **Admin Regional**, dan **Superadmin**.

Dibangun dengan React 19 + Vite, React Router v7, dan Tailwind CSS v4.

## Status Proyek

⚠️ **Ini adalah frontend murni.** Belum ada backend/API yang terhubung —
seluruh data (transaksi, saldo, daftar trip, dsb.) saat ini masih **data
dummy/statis** di dalam komponen. Alur autentikasi (login/register) juga masih
simulasi (lihat bagian [Integrasi Backend](#integrasi-backend) di bawah).

Tujuan struktur proyek ini adalah supaya integrasi ke backend nanti bisa
dilakukan tanpa membongkar komponen UI yang sudah ada.

## Menjalankan Proyek

```bash
npm install
npm run dev       # jalankan dev server (Vite)
npm run build     # build untuk production
npm run lint      # cek kualitas kode dengan ESLint
```

Salin `.env.example` menjadi `.env` bila ingin mengarahkan ke backend API:

```bash
cp .env.example .env
```

## Struktur Folder

```
src/
├── components/
│   ├── layout/          # Layout generik (mis. AuthLayout)
│   ├── routing/          # ProtectedRoute — proteksi akses per-role
│   └── ui/                # Komponen UI reusable (Skeleton, EmptyState, dst.)
├── context/
│   ├── AuthContext.jsx    # Status login & role user, dipakai ProtectedRoute
│   └── ToastContext.jsx   # Sistem notifikasi toast
├── features/               # Satu folder per role/domain
│   ├── auth/               # Login & Register
│   ├── customer/
│   ├── mitra/
│   ├── operator-pos/
│   ├── regional/
│   └── superadmin/
│       ├── components/    # Sidebar dsb. khusus role tsb.
│       └── views/         # Halaman-halaman (dashboard, manajemen, dll.)
├── hooks/
│   └── useSimulatedLoading.js  # Simulasi loading data dummy (lihat catatan di bawah)
├── services/
│   ├── apiClient.js        # Instance axios terpusat
│   └── authService.js      # Fungsi login/register (masih simulasi)
├── App.jsx                 # Definisi seluruh route
└── main.jsx                 # Entry point + provider (Auth, Toast, Router)
```

## Alur Login (Role)

Saat ini role ditentukan dari kata kunci pada email yang dipakai login
(simulasi, lihat `src/services/authService.js`):

| Email mengandung...        | Role       | Halaman awal              |
|-----------------------------|------------|----------------------------|
| `regional`                  | `regional` | `/regional/dashboard`      |
| `operator` atau `pos`       | `operator` | `/operator-pos/dashboard`  |
| `mitra`                     | `mitra`    | `/mitra/dashboard`         |
| `customer`                  | `customer` | `/customer/onboarding`     |
| (lainnya)                   | `admin`    | `/admin/dashboard`         |

Contoh: login dengan email apa pun yang mengandung kata `mitra`
(mis. `mitra@test.com`) akan masuk sebagai role Mitra.

Password bisa diisi bebas (belum divalidasi ke backend).

## Proteksi Rute

Setiap grup halaman (`/admin/*`, `/regional/*`, `/operator-pos/*`,
`/mitra/*`, `/customer/*`) dibungkus `<ProtectedRoute allowedRoles={[...]}>`
(lihat `src/App.jsx`). Mengakses URL tersebut tanpa login, atau dengan role
yang tidak sesuai, akan otomatis diarahkan kembali ke `/login`.

Status login disimpan di `localStorage` melalui `AuthContext`
(`src/context/AuthContext.jsx`). Ini masih pengecekan sisi-client saja
karena belum ada backend untuk validasi token.

## Integrasi Backend

Beberapa bagian sudah disiapkan agar integrasi backend semudah mungkin:

- **`src/services/apiClient.js`** — instance axios terpusat, sudah otomatis
  menyisipkan token ke setiap request. Base URL diatur lewat
  `VITE_API_BASE_URL` di `.env`.
- **`src/services/authService.js`** — fungsi `loginRequest()` dan
  `registerRequest()` sudah punya signature (parameter & bentuk return)
  yang meniru response API sungguhan. Saat backend siap, cukup ganti isi
  fungsi ini dengan pemanggilan `apiClient.post(...)` — komponen
  `Login.jsx`/`Register.jsx` **tidak perlu diubah**.
- **`src/hooks/useSimulatedLoading.js`** — dipakai di banyak halaman
  (dashboard, manajemen data, dll.) untuk mensimulasikan state loading dari
  data dummy. Saat halaman tersebut disambungkan ke React Query, cukup
  ganti pemanggilan hook ini dengan `isLoading` bawaan `useQuery`.

## Catatan Kualitas Kode

- `npm run lint` bersih (0 error) per commit terakhir.
- Import ikon (`lucide-react`) dan variabel yang tidak dipakai sudah
  dibersihkan.
- Pola `setState` langsung di dalam `useEffect` (anti-pattern React) sudah
  dirapikan — lihat `useSimulatedLoading` di atas.
