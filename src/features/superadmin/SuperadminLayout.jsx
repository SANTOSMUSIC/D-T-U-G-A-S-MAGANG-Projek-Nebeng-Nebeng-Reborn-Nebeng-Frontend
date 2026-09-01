import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SuperadminSidebar from './components/SuperadminSidebar';
import { useAuth } from '../../context/AuthContext';

const SUPERADMIN_MENU_PATH = {
  'Dashboard': 'dashboard',
  'Manajemen Wilayah': 'wilayah',
  'Admin Wilayah': 'admin-wilayah',
  'Konfigurasi Tarif': 'tarif',
  'Audit & Keuangan': 'audit',
  'User Governance': 'governance',
};

export default function SuperadminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(SUPERADMIN_MENU_PATH).find(menu => {
    const slug = SUPERADMIN_MENU_PATH[menu];
    return currentPath.endsWith(`/admin/${slug}`) || currentPath.includes(`/admin/${slug}/`);
  }) || 'Dashboard';

  return (
    <div className="relative flex min-h-screen bg-neutral-100 overflow-hidden font-['Inter']">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[26rem] h-[26rem] bg-purple-200/50 rounded-full blur-[110px] z-0"></div>
      <div className="pointer-events-none absolute top-1/2 -right-32 w-[24rem] h-[24rem] bg-purple-100/60 rounded-full blur-[100px] z-0"></div>
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 bg-fuchsia-100/40 rounded-full blur-[90px] z-0"></div>

      <SuperadminSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/admin/${SUPERADMIN_MENU_PATH[name]}`)}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />
      <div className="relative z-10 flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}