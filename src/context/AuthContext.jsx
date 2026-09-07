import { createContext, useCallback, useContext, useState } from 'react';
import {
  readAuthSession,
  writeAuthSession,
  clearAuthSession,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [{ session, persisted }, setAuthState] = useState(readAuthSession);

  const login = useCallback((role, extra = {}, remember = false) => {
    const nextSession = { role, loggedInAt: Date.now(), ...extra };
    writeAuthSession(nextSession, remember);
    setAuthState({ session: nextSession, persisted: remember });
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthState({ session: null, persisted: false });
  }, []);

  // Menandai customer yang sedang login sudah menyelesaikan Biometric
  // Onboarding, supaya kunjungan berikutnya ke /customer bisa langsung
  // diarahkan ke halaman booking, bukan selalu kembali ke onboarding.
  // profileData berisi data yang dikumpulkan selama onboarding
  // (fullName, nik, phone, ktpFileName, verifiedAt) dan disimpan sebagai
  // customerProfile di dalam sesi, supaya tidak hilang setelah refresh.
  const markCustomerVerified = useCallback((profileData = {}) => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = {
        ...prev.session,
        customerVerified: true,
        customerProfile: { ...prev.session.customerProfile, ...profileData },
      };
      // Tulis balik ke storage yang sama tempat sesi ini awalnya disimpan,
      // supaya status verifikasi ikut bertahan/hilang sesuai pilihan
      // "Ingat Saya" yang dibuat user saat login.
      writeAuthSession(nextSession, prev.persisted);
      return { ...prev, session: nextSession };
    });
  }, []);

  // Memperbarui sebagian data profil customer (mis. nama/nomor HP diedit
  // dari halaman Profil Saya), tanpa menyentuh status verifikasi yang
  // sudah ada.
  const updateCustomerProfile = useCallback((patch) => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = {
        ...prev.session,
        customerProfile: { ...prev.session.customerProfile, ...patch },
      };
      writeAuthSession(nextSession, prev.persisted);
      return { ...prev, session: nextSession };
    });
  }, []);

  // Padanan updateCustomerProfile tapi untuk sisi admin/operator internal
  // (Admin Regional, Operator Pos, dst). Dipakai oleh UserProfileModal di
  // RegionalSidebar supaya admin bisa mengubah nama/email/no. telepon
  // akun mereka sendiri, dengan penyimpanan mengikuti storage sesi yang
  // sama (localStorage jika "Ingat Saya" dicentang, sessionStorage jika
  // tidak) seperti updateCustomerProfile.
  const updateAdminProfile = useCallback((patch) => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = {
        ...prev.session,
        adminProfile: { ...prev.session.adminProfile, ...patch },
      };
      writeAuthSession(nextSession, prev.persisted);
      return { ...prev, session: nextSession };
    });
  }, []);

  // Padanan updateCustomerProfile/updateAdminProfile tapi untuk data profil
  // Mitra Pos (nama, telepon, email, alamat, info kendaraan, dst). Dipakai
  // oleh halaman "Profil Saya & Pengaturan Akun" di panel Mitra supaya
  // perubahan data ikut tersimpan mengikuti storage sesi yang sama
  // (localStorage jika "Ingat Saya" dicentang, sessionStorage jika tidak).
  const updateMitraProfile = useCallback((patch) => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = {
        ...prev.session,
        mitraProfile: { ...prev.session.mitraProfile, ...patch },
      };
      writeAuthSession(nextSession, prev.persisted);
      return { ...prev, session: nextSession };
    });
  }, []);

  // Padanan updateCustomerProfile/updateAdminProfile/updateMitraProfile tapi
  // untuk akun Superadmin (nama, email). Data identitas awal Superadmin
  // datang langsung dari `extra` saat login (session.name/email/username,
  // tidak dibungkus), jadi field hasil edit di sini sengaja disimpan
  // terpisah di bawah `superadminProfile` (bukan menimpa session.name dkk
  // langsung) supaya komponen tampilan tinggal fallback ke field login asli
  // jika belum pernah diedit — persis pola yang sama dengan role lain.
  const updateSuperadminProfile = useCallback((patch) => {
    setAuthState((prev) => {
      if (!prev.session) return prev;
      const nextSession = {
        ...prev.session,
        superadminProfile: { ...prev.session.superadminProfile, ...patch },
      };
      writeAuthSession(nextSession, prev.persisted);
      return { ...prev, session: nextSession };
    });
  }, []);

  const value = {
    session,
    isAuthenticated: !!session,
    role: session?.role ?? null,
    // Menandai apakah sesi ini disimpan permanen ("Ingat Saya" dicentang,
    // localStorage) atau sementara (sessionStorage) — dipakai mis. di
    // halaman Pengaturan Akun untuk menampilkan status sesi login saat ini.
    sessionPersisted: persisted,
    isCustomerVerified: !!session?.customerVerified,
    customerProfile: session?.customerProfile ?? null,
    adminProfile: session?.adminProfile ?? null,
    mitraProfile: session?.mitraProfile ?? null,
    // FIX (bug: status verifikasi mitra hilang saat pindah halaman):
    // sebelumnya status "submitted" onboarding hanya disimpan di state
    // lokal MitraOnboarding.jsx, jadi hilang begitu mitra pindah halaman
    // atau refresh. Sekarang disimpan sebagai mitraProfile.verificationStatus
    // (lewat updateMitraProfile yang sudah ada), dengan nilai mengikuti
    // enum VerificationStatus di schema: 'unverified' | 'pending' |
    // 'approved' | 'rejected'. Persetujuan jadi 'approved' nantinya
    // dilakukan Admin Regional (di luar cakupan panel Mitra ini).
    mitraVerificationStatus: session?.mitraProfile?.verificationStatus ?? 'unverified',
    superadminProfile: session?.superadminProfile ?? null,
    login,
    logout,
    markCustomerVerified,
    updateCustomerProfile,
    updateAdminProfile,
    updateMitraProfile,
    updateSuperadminProfile,
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