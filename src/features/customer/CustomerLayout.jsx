import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CustomerSidebar from './components/CustomerSidebar';
import { useAuth } from '../../context/AuthContext';

const CUSTOMER_MENU_PATH = {
  'Onboarding Biometrik': 'onboarding',
  'Cari & Booking Trip': 'booking',
  'Tickets & Digital QR': 'tickets',
};

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(CUSTOMER_MENU_PATH).find((menu) => {
    const slug = CUSTOMER_MENU_PATH[menu];
    return currentPath.endsWith(`/customer/${slug}`) || currentPath.includes(`/customer/${slug}/`);
  }) || 'Onboarding Biometrik';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <CustomerSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/customer/${CUSTOMER_MENU_PATH[name]}`)}
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