import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MitraSidebar from './components/MitraSidebar';
import MitraTopbar from './components/MitraTopbar';
import { useAuth } from '../../context/AuthContext';
import { MitraDataProvider } from '../../context/MitraDataContext';
import { getMyProfile } from '../../services/userService';
import apiClient from '../../services/apiClient';

// Enum VehicleType di backend ('motor' | 'mobil') vs opsi <select> di
// MitraAccountSettings.jsx ('Motor' | 'Mobil') tidak sama persis
// penulisannya — pemetaan ini menyamakan keduanya saat hydrate dari server.
const VEHICLE_TYPE_TO_FORM = { motor: 'Motor', mobil: 'Mobil' };

const MITRA_MENU_PATH = {
  'Dashboard Mitra': 'dashboard',
  'Onboarding & Verifikasi': 'onboarding',
  'Kelola Trip & Jadwal': 'trip',
  'Digital QR Trip': 'qr',
  'Saldo & Komisi': 'saldo',
  'Chat Pelanggan': 'chat',
  'Profil & Pengaturan': 'profile',
};

export default function MitraLayout() {
  const navigate = useNavigate();
  const { logout, mitraProfile, updateMitraProfile } = useAuth();
  const location = useLocation();

  // FIX (bug: data profil mitra hilang setelah logout lalu login lagi):
  // mitraProfile sebelumnya hanya hidup di session storage, yang otomatis
  // terhapus oleh logout(). Sekarang begitu panel Mitra dibuka (login
  // berhasil), profil asli ditarik ulang dari backend dan disinkronkan ke
  // sesi lokal. Data mitra ternyata tersebar di 3 sumber berbeda di
  // backend, jadi ditarik dari ketiganya secara terpisah (kalau salah satu
  // gagal/belum ada datanya, dua lainnya tetap jalan):
  // 1. GET /auth/me       -> data user dasar: nama, email, telepon
  // 2. GET /users/me/profile -> data KTP: nama lengkap KTP, alamat
  //    (pasangan dari PATCH /users/me/profile yang dipakai saat simpan)
  // 3. GET /vehicles/me   -> data kendaraan: nomor plat, jenis kendaraan
  //    (pasangan dari POST /vehicles saat onboarding & PATCH /vehicles/:id
  //    saat edit profil)
  useEffect(() => {
    let isMounted = true;
    async function hydrateProfileFromServer() {
      const patch = {};

      try {
        const data = await getMyProfile();
        const user = data?.data || data?.user || data || {};
        patch.fullName = user.name || user.fullName || undefined;
        patch.email = user.email || undefined;
        patch.phone = user.phone || undefined;
        patch.photoDataUrl = user.avatarUrl || user.photoUrl || user.avatar || undefined;
      } catch (err) {
        console.log('Gagal memuat data user dasar (auth/me):', err.message);
      }

      try {
        const profileRes = await apiClient.get('/users/me/profile');
        const profile = profileRes.data?.data || profileRes.data || {};
        if (profile.fullNameKtp) patch.fullName = profile.fullNameKtp;
        if (profile.addressKtp || profile.address) patch.address = profile.addressKtp || profile.address;
      } catch (err) {
        console.log('Gagal memuat profil KTP (users/me/profile):', err.message);
      }

      try {
        const vehiclesRes = await apiClient.get('/vehicles/me');
        const vehicles = vehiclesRes.data?.data || vehiclesRes.data || [];
        const myVehicle = Array.isArray(vehicles) ? vehicles[0] : null;
        if (myVehicle) {
          if (myVehicle.plateNumber) patch.plateNumber = myVehicle.plateNumber;
          if (myVehicle.type) patch.vehicleType = VEHICLE_TYPE_TO_FORM[myVehicle.type] || myVehicle.type;
        }
      } catch (err) {
        console.log('Gagal memuat data kendaraan (vehicles/me):', err.message);
      }

      if (isMounted && Object.keys(patch).length > 0) {
        updateMitraProfile(patch);
      }
    }
    hydrateProfileFromServer();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja hanya sekali saat panel Mitra pertama dibuka, bukan tiap mitraProfile berubah
  }, []);

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(MITRA_MENU_PATH).find((menu) => {
    const slug = MITRA_MENU_PATH[menu];
    return currentPath.endsWith(`/mitra/${slug}`) || currentPath.includes(`/mitra/${slug}/`);
  }) || 'Dashboard Mitra';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMenuSelect = (name) => {
    // FIX (bug: mitra tetap terkunci walau sudah di-approve Admin Regional):
    // sebelumnya field yang dicek di sini adalah `statusVerification`, padahal
    // field yang benar-benar disimpan di mitraProfile (lewat updateMitraProfile
    // di MitraOnboarding.jsx dan dipakai juga sebagai mitraVerificationStatus
    // di AuthContext) adalah `verificationStatus`. Karena `statusVerification`
    // tidak pernah ada di objek mitraProfile, isApproved selalu bernilai false
    // apa pun status approval sebenarnya di backend.
    const isApproved = mitraProfile?.verificationStatus === 'approved';
    if (!isApproved && name !== 'Dashboard Mitra' && name !== 'Onboarding & Verifikasi' && name !== 'Profil & Pengaturan') {
      alert('Akun Anda belum disetujui oleh Admin Regional. Selesaikan verifikasi terlebih dahulu.');
      navigate('/mitra/onboarding');
      return;
    }
    navigate(`/mitra/${MITRA_MENU_PATH[name]}`);
  };

  return (
    <MitraDataProvider>
      <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
        <MitraSidebar
          activeMenu={activeMenu}
          onMenuSelect={handleMenuSelect}
          onLogout={handleLogout}
        />

        <div className="flex-1 lg:ml-64 min-h-screen w-full flex flex-col">
          <MitraTopbar
            profile={mitraProfile}
            onSettingsClick={() => navigate('/mitra/profile/pengaturan')}
          />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </MitraDataProvider>
  );
}