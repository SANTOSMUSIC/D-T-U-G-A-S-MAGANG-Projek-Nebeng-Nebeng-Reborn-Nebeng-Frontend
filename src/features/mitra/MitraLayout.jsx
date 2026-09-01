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
  const { logout, mitraProfile } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(MITRA_MENU_PATH).find((menu) => {
    const slug = MITRA_MENU_PATH[menu];
    return currentPath.endsWith(`/mitra/${slug}`) || currentPath.includes(`/mitra/${slug}/`);
  }) || 'Dashboard Mitra';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    // MitraDataProvider menyatukan data saldo, escrow, dan trip untuk semua
    // halaman di bawahnya (Dashboard, Trip Management, QR, Saldo) sehingga
    // angkanya selalu konsisten, tidak lagi punya state dummy sendiri-sendiri.
    <MitraDataProvider>
      <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
        <MitraSidebar
          activeMenu={activeMenu}
          onMenuSelect={(name) => navigate(`/mitra/${MITRA_MENU_PATH[name]}`)}
          onLogout={handleLogout}
        />

        {/* Profil Saya dibuka sebagai modal langsung di dalam MitraTopbar
            (tidak berpindah halaman). Pengaturan Akun tetap berpindah ke
            halaman penuh lewat route /mitra/profile/pengaturan. */}
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