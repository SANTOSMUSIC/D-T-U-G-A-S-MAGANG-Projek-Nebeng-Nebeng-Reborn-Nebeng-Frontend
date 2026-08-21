// import apiClient from './apiClient';

/**
 * NOTE PENTING: Backend autentikasi belum tersedia.
 *
 * Fungsi di file ini masih memakai simulasi (deteksi role dari isi email)
 * supaya alur login tetap bisa didemokan end-to-end di frontend. Signature
 * (parameter & bentuk return) sengaja dibuat menyerupai apa yang nantinya
 * dikembalikan backend, sehingga saat API sudah siap, cukup ganti ISI
 * fungsi ini — komponen pemanggil (Login.jsx, Register.jsx) tidak perlu diubah.
 *
 * Contoh saat backend sudah siap:
 *   const { data } = await apiClient.post('/auth/login', { email, password });
 *   return { role: data.role, token: data.token, name: data.name };
 */
export async function loginRequest({ email, password }) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi');
  }

  const lowerEmail = email.toLowerCase();
  let role = 'admin'; // default role

  if (lowerEmail.includes('regional')) {
    role = 'regional';
  } else if (lowerEmail.includes('operator') || lowerEmail.includes('pos')) {
    role = 'operator';
  } else if (lowerEmail.includes('mitra')) {
    role = 'mitra';
  } else if (lowerEmail.includes('customer')) {
    role = 'customer';
  }

  // Simulasi delay network.
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    role,
    token: `dummy-token-${role}-${Date.now()}`,
    email,
  };
}

/**
 * NOTE: sama seperti loginRequest — masih simulasi, siap diganti panggilan
 * `apiClient.post('/auth/register', payload)` saat backend tersedia.
 */
export async function registerRequest(payload) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, email: payload?.email };
}
