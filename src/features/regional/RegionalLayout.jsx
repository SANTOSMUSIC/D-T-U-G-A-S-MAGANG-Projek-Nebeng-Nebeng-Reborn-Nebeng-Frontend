import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import RegionalSidebar from './components/RegionalSidebar';
import { useAuth } from '../../context/AuthContext';

const REGIONAL_MENU_PATH = {
  'Dashboard Wilayah': 'dashboard',
  'Pos Mitra & Terminal': 'pos-mitra',
  'Armada & Kurir': 'armada-kurir',
  'Verifikasi ID & Face': 'verifikasi',
  'Pemantauan Trip': 'trip-order',
  'Laporan Keuangan': 'laporan',
};

export default function RegionalLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(REGIONAL_MENU_PATH).find((menu) => {
    const slug = REGIONAL_MENU_PATH[menu];
    return currentPath.endsWith(`/regional/${slug}`) || currentPath.includes(`/regional/${slug}/`);
  }) || 'Dashboard Wilayah';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <RegionalSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => {
          const targetPath = REGIONAL_MENU_PATH[name];
          if (targetPath) {
            navigate(`/regional/${targetPath}`);
          }
        }}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />
      
      <div className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}