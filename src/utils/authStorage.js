export const AUTH_STORAGE_KEY = 'nebeng_auth';

/**
 * Baca sesi auth yang tersimpan (kalau ada).
 * Prioritas: localStorage ("Ingat Saya") dulu, baru sessionStorage (sesi
 * sementara tab yang sedang berjalan).
 *
 * @returns {{ session: object|null, persisted: boolean }}
 */
export function readAuthSession() {
  try {
    const persistedRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (persistedRaw) {
      return { session: JSON.parse(persistedRaw), persisted: true };
    }
  } catch {
    // Data korup/format lama — abaikan, lanjut cek sessionStorage.
  }

  try {
    const temporaryRaw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (temporaryRaw) {
      return { session: JSON.parse(temporaryRaw), persisted: false };
    }
  } catch {
    // Sama seperti di atas.
  }

  return { session: null, persisted: false };
}

/**
 * Simpan sesi auth ke storage yang sesuai, dan bersihkan storage yang lain
 * supaya tidak ada sesi ganda yang nyasar.
 *
 * @param {object} session - data sesi (role, token, dst.)
 * @param {boolean} remember - true = localStorage ("Ingat Saya"), false = sessionStorage
 */
export function writeAuthSession(session, remember) {
  const raw = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, raw);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, raw);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/** Hapus sesi auth dari kedua storage (dipakai saat logout). */
export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Ambil token JWT dari sesi tersimpan, kalau ada.
 * Dipakai oleh apiClient.js supaya ekstraksi token juga konsisten.
 *
 * @returns {string|null}
 */
export function readAuthToken() {
  const { session } = readAuthSession();
  if (!session) return null;

  return (
    session.token ||
    session.accessToken ||
    session.access_token ||
    session.data?.token ||
    session.data?.accessToken ||
    null
  );
}