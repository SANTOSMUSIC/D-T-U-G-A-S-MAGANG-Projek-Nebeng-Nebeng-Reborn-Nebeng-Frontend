import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CustomerSidebar from './components/CustomerSidebar';
import { useAuth } from '../../context/AuthContext';

const CUSTOMER_MENU_PATH = {
  'Onboarding Biometrik': 'onboarding',
  'Cari & Booking Trip': 'booking',
  'Tickets & Digital QR': 'tickets',
};
const PATH_TO_MENU = Object.fromEntries(
  Object.entries(CUSTOMER_MENU_PATH).map(([name, path]) => [path, name])
);

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const currentSlug = location.pathname.split('/').pop();
  const activeMenu = PATH_TO_MENU[currentSlug] || 'Onboarding Biometrik';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <CustomerSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/customer/${CUSTOMER_MENU_PATH[name]}`)}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
