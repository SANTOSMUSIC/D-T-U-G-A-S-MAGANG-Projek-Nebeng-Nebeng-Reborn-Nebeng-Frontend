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

// FIX (CACAT LOGIKA): sebelumnya role yang dipilih user di form Register
// ("Daftar sebagai Customer/Mitra") sama sekali tidak dipakai — role saat
// login murni ditebak dari kata kunci di email, dan fallback default-nya
// adalah 'admin'. Akibatnya user yang mendaftar sebagai "Mitra" tapi
// emailnya tidak mengandung kata "mitra" akan ter-login sebagai
// Superadmin — jelas keliru dan membingungkan.
//
// Karena belum ada backend sungguhan, role yang dipilih saat registrasi
// sekarang disimpan di localStorage (map email -> role) dan dipakai sebagai
// sumber utama saat login. Deteksi dari kata kunci email tetap dipakai
// sebagai fallback (mis. untuk akun internal admin/regional/operator yang
// dibuatkan langsung, bukan lewat form Register publik), dan fallback
// terakhir diubah dari 'admin' menjadi 'customer' (role paling minim
// privilese) supaya user tak dikenal tidak pernah otomatis masuk sebagai
// Superadmin.
const REGISTERED_ROLES_KEY = 'nebeng_registered_roles';

function readRegisteredRoles() {
  try {
    const raw = localStorage.getItem(REGISTERED_ROLES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegisteredRole(email, role) {
  try {
    const map = readRegisteredRoles();
    map[email.toLowerCase()] = role;
    localStorage.setItem(REGISTERED_ROLES_KEY, JSON.stringify(map));
  } catch {
    // Abaikan bila localStorage tidak tersedia (mis. mode privat) — user
    // tetap bisa lanjut, hanya saja role hasil registrasi tidak "diingat".
  }
}

function detectRoleFromEmail(lowerEmail) {
  if (lowerEmail.includes('regional')) return 'regional';
  if (lowerEmail.includes('operator') || lowerEmail.includes('pos')) return 'operator';
  if (lowerEmail.includes('mitra')) return 'mitra';
  if (lowerEmail.includes('admin')) return 'admin';
  if (lowerEmail.includes('customer')) return 'customer';
  return null;
}

export async function loginRequest({ email, password }) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi');
  }

  const lowerEmail = email.toLowerCase();
  const registeredRoles = readRegisteredRoles();

  // Prioritas: role hasil pilihan user saat Register > deteksi kata kunci
  // email (untuk akun internal) > fallback paling aman ('customer').
  const role = registeredRoles[lowerEmail] || detectRoleFromEmail(lowerEmail) || 'customer';

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

  // FIX: simpan role yang dipilih user ("Customer" / "Mitra (Driver)") agar
  // loginRequest() nanti benar-benar memakai role ini, bukan menebak ulang
  // dari email.
  if (payload?.email && payload?.role) {
    saveRegisteredRole(payload.email, payload.role.toLowerCase());
  }

  return { success: true, email: payload?.email };
}
