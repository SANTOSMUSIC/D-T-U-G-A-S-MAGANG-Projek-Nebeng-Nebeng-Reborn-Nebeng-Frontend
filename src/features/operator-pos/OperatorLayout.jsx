import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import OperatorSidebar from './components/OperatorSidebar';
import { useAuth } from '../../context/AuthContext';

const OPERATOR_MENU_PATH = {
  'Dashboard Pos': 'dashboard',
  'Inspection & Sealing': 'inspection',
  'Dual QR Scanner': 'scanner',
  'Handover Verification': 'handover',
};
const PATH_TO_MENU = Object.fromEntries(
  Object.entries(OPERATOR_MENU_PATH).map(([name, path]) => [path, name])
);

export default function OperatorLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const currentSlug = location.pathname.split('/').pop();
  const activeMenu = PATH_TO_MENU[currentSlug] || 'Dashboard Pos';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <OperatorSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/operator-pos/${OPERATOR_MENU_PATH[name]}`)}
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
