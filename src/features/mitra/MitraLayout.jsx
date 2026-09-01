import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MitraSidebar from './components/MitraSidebar';
import { useAuth } from '../../context/AuthContext';

const MITRA_MENU_PATH = {
  'Dashboard Mitra': 'dashboard',
  'Onboarding & Verifikasi': 'onboarding',
  'Kelola Trip & Jadwal': 'trip',
  'Digital QR Trip': 'qr',
  'Saldo & Komisi': 'saldo',
  'Chat Pelanggan': 'chat',
};

export default function MitraLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(MITRA_MENU_PATH).find((menu) => {
    const slug = MITRA_MENU_PATH[menu];
    return currentPath.endsWith(`/mitra/${slug}`) || currentPath.includes(`/mitra/${slug}/`);
  }) || 'Dashboard Mitra';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <MitraSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/mitra/${MITRA_MENU_PATH[name]}`)}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />
      
      <div className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 w-full">
        <Outlet />
      </div>
    </div>
  );
}