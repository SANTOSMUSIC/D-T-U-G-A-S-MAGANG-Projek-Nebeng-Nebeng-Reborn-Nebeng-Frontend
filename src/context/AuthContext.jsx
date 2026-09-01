import { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'nebeng_auth';

/**
 * FIX (UI/UX -> implementasi nyata): "Ingat Saya" sebelumnya cuma tombol
 * disabled karena sesi memang selalu ditaruh di localStorage tanpa opsi
 * lain, jadi tidak ada bedanya dicentang atau tidak.
 *
 * Sekarang sesi benar-benar dibedakan tempat penyimpanannya:
 * - "Ingat Saya" dicentang  -> localStorage  (sesi bertahan walau tab/
 *   browser ditutup, sampai user logout manual)
 * - "Ingat Saya" tidak dicentang -> sessionStorage (sesi otomatis hilang
 *   begitu tab ditutup — perilaku standar "sesi sementara")
 *
 * readStoredSession mengecek localStorage dulu (sesi "diingat"), baru
 * fallback ke sessionStorage (sesi sementara milik tab yang sedang
 * berjalan), supaya saat halaman di-refresh, user tetap dikenali dari
 * storage mana pun sesinya berasal.
 */
function readStoredSession() {
  try {
    const persistedRaw = localStorage.getItem(STORAGE_KEY);
    if (persistedRaw) {
      return { session: JSON.parse(persistedRaw), persisted: true };
    }
  } catch {
    // Data tersimpan korup/format lama — abaikan dan lanjut cek sessionStorage.
  }

  try {
    const temporaryRaw = sessionStorage.getItem(STORAGE_KEY);
    if (temporaryRaw) {
      return { session: JSON.parse(temporaryRaw), persisted: false };
    }
  } catch {
    // Sama seperti di atas — abaikan dan anggap belum login.
  }

  return { session: null, persisted: false };
}

export function AuthProvider({ children }) {
  const [{ session }, setAuthState] = useState(readStoredSession);

  const login = useCallback((role, extra = {}, remember = false) => {
    const nextSession = { role, loggedInAt: Date.now(), ...extra };

    // Bersihkan storage yang TIDAK dipakai supaya tidak ada sesi ganda yang
    // nyasar — mis. user pernah login dengan "Ingat Saya" (localStorage),
    // logout, lalu login lagi tanpa mencentangnya (harus jadi sessionStorage
    // murni, bukan localStorage lama yang masih nyangkut).
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      localStorage.removeItem(STORAGE_KEY);
    }

    setAuthState({ session: nextSession, persisted: remember });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthState({ session: null, persisted: false });
  }, []);

  // Menandai customer yang sedang login sudah menyelesaikan Biometric
  // Onboarding, supaya kunjungan berikutnya ke /customer bisa langsung
  // diarahkan ke halaman booking, bukan selalu kembali ke onboarding.
  const markCustomerVerified = useCallback(() => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = { ...prev.session, customerVerified: true };
      // Tulis balik ke storage yang sama tempat sesi ini awalnya disimpan,
      // supaya status verifikasi ikut bertahan/hilang sesuai pilihan
      // "Ingat Saya" yang dibuat user saat login.
      const storage = prev.persisted ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return { ...prev, session: nextSession };
    });
  }, []);

  const value = {
    session,
    isAuthenticated: !!session,
    role: session?.role ?? null,
    isCustomerVerified: !!session?.customerVerified,
    login,
    logout,
    markCustomerVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- pola context umum (Provider + hook satu file), konsisten dengan ToastContext
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return ctx;
}