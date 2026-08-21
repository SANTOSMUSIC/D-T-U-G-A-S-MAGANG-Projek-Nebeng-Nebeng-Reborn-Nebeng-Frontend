import axios from 'axios';

const AUTH_STORAGE_KEY = 'nebeng_auth';

/**
 * Instance axios terpusat.
 *
 * Semua pemanggilan API (setelah backend tersedia) sebaiknya lewat instance
 * ini, bukan membuat `axios.get(...)` langsung di komponen, supaya:
 *  - base URL & timeout konsisten di seluruh aplikasi,
 *  - token auth otomatis terpasang di setiap request,
 *  - mudah menambah penanganan error global (mis. auto-logout saat 401).
 *
 * Set VITE_API_BASE_URL di file `.env` (lihat `.env.example`) untuk
 * mengarahkan ke backend yang sesuai (lokal/staging/production).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sisipkan token auth (jika ada) ke setiap request.
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = raw ? JSON.parse(raw).token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Abaikan jika data auth tersimpan tidak valid (korup/format lama).
  }
  return config;
});

// TODO: setelah backend siap, tangani 401 di sini (mis. auto-logout + redirect ke /login).
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem(AUTH_STORAGE_KEY);
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
