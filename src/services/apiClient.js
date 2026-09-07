import axios from 'axios';
import { readAuthToken } from '../utils/authStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FIX (konsistensi storage): sebelumnya interceptor ini cek sessionStorage
// dulu baru localStorage — urutan terbalik dari AuthContext.jsx (yang cek
// localStorage dulu). Sekarang keduanya pakai authStorage.js sebagai
// sumber kebenaran tunggal, jadi urutan prioritasnya selalu sama.
apiClient.interceptors.request.use((config) => {
  try {
    const token = readAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Gagal mengambil token auth:', err);
  }

  return config;
});

export default apiClient;