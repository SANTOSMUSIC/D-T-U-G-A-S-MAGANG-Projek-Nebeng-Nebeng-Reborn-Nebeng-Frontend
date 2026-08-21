import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SuperadminSidebar from './components/SuperadminSidebar';
import { useAuth } from '../../context/AuthContext';

// Pemetaan nama menu (ditampilkan di sidebar) <-> segmen URL
const SUPERADMIN_MENU_PATH = {
  'Dashboard': 'dashboard',
  'Manajemen Wilayah': 'wilayah',
  'Admin Wilayah': 'admin-wilayah',
  'Konfigurasi Tarif': 'tarif',
  'Audit & Keuangan': 'audit',
  'User Governance': 'governance',
};
const PATH_TO_MENU = Object.fromEntries(
  Object.entries(SUPERADMIN_MENU_PATH).map(([name, path]) => [path, name])
);

export default function SuperadminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const currentSlug = location.pathname.split('/').pop();
  const activeMenu = PATH_TO_MENU[currentSlug] || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <SuperadminSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/admin/${SUPERADMIN_MENU_PATH[name]}`)}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />
      {/* pt-16 memberi ruang untuk tombol hamburger mobile (fixed top-4 left-4) agar tidak menimpa konten */}
      <div className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}
