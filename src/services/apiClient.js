import axios from 'axios';

const AUTH_STORAGE_KEY = 'nebeng_auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token secara aman dari sessionStorage / localStorage
apiClient.interceptors.request.use((config) => {
  try {
    // Cek sessionStorage terlebih dahulu (sesuai perilaku login tanpa "Ingat Saya")
    let raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    
    // Jika tidak ada di sessionStorage, cek localStorage (jika "Ingat Saya" dicentang)
    if (!raw) {
      raw = localStorage.getItem(AUTH_STORAGE_KEY);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      
      // Ekstraksi token dari berbagai variasi struktur objek
      const token = 
        parsed.token || 
        parsed.accessToken || 
        parsed.access_token || 
        parsed.data?.token || 
        parsed.data?.accessToken ||
        (typeof parsed === 'string' ? parsed : null);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error('Gagal memparsing token auth:', err);
  }

  return config;
});

export default apiClient;