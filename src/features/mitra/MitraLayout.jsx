import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MitraSidebar from './components/MitraSidebar';
import MitraTopbar from './components/MitraTopbar';
import { useAuth } from '../../context/AuthContext';
import { MitraDataProvider } from '../../context/MitraDataContext';

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
  const { logout, user, mitraProfile, mitraVerificationStatus } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(MITRA_MENU_PATH).find((menu) => {
    const slug = MITRA_MENU_PATH[menu];
    return currentPath.endsWith(`/mitra/${slug}`) || currentPath.includes(`/mitra/${slug}/`);
  }) || 'Dashboard Mitra';

  // Status verifikasi asli dari Admin Regional (terpisah dari bypass dev di
  // handleMenuSelect di bawah) — dipakai untuk menyembunyikan menu
  // Onboarding & Verifikasi di sidebar begitu akun sudah disetujui.
  //
  // FIX: sebelumnya membaca `user?.statusVerification` /
  // `mitraProfile?.statusVerification` — field ini tidak pernah ada di
  // AuthContext (yang benar adalah `mitraProfile.verificationStatus`,
  // lihat updateMitraProfile & mitraVerificationStatus di AuthContext.jsx).
  // Akibatnya isVerified selalu false walau mitra sudah disetujui Admin
  // Regional, dan menu Onboarding & Verifikasi tidak pernah hilang.
  // Sekarang langsung pakai `mitraVerificationStatus` yang sudah disediakan
  // AuthContext supaya kedua tempat ini selalu sinkron.
  const isVerified =
    mitraVerificationStatus === 'approved' ||
    user?.status === 'active';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMenuSelect = (name) => {
    // Berikan kelonggaran: Jika user sedang testing atau status di backend sudah approved/active, 
    // atau jika Anda ingin membebaskan akses menu selama tahap development, izinkan langsung.
    const isApproved = 
      user?.statusVerification === 'approved' || 
      mitraProfile?.statusVerification === 'approved' ||
      user?.status === 'active' ||
      true; // Ubah menjadi 'true' sementara waktu jika ingin bypass proteksi saat development

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
          isVerified={isVerified}
        />

        <div className="flex-1 lg:ml-64 min-h-screen w-full flex flex-col">
          {/* FIX: sebelumnya `user || mitraProfile` — kalau `user` (dari sesi
              login) ada isinya, `mitraProfile` yang baru diupdate lewat
              updateMitraProfile() di halaman Pengaturan Akun tidak akan
              pernah tampil karena kalah prioritas. Sekarang digabung, dengan
              mitraProfile menimpa field yang sama (nama/email/telepon/foto
              dkk yang bisa diedit user), tapi field lain yang hanya ada di
              `user` (mis. regionId) tetap dipertahankan. */}
          <MitraTopbar
            profile={{ ...user, ...mitraProfile }}
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