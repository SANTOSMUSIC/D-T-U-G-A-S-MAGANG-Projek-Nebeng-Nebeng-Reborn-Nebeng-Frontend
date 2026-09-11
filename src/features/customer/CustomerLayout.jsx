import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerProfileModal from './components/CustomerProfileModal';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const CUSTOMER_MENU_PATH = {
  'Onboarding Biometrik': 'onboarding',
  'Cari & Booking Trip': 'booking',
  'Tickets & Digital QR': 'tickets',
  'Profil Saya': 'profile',
};

const VERIFIED_ONLY_SLUGS = ['booking', 'tickets', 'profile'];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { logout, customerProfile } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveStatus = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (isMounted && res.data) {
          const approved = res.data.statusVerification === 'approved';
          setIsVerified(approved);
        }
      } catch (err) {
        console.error('Gagal mengambil status live user:', err);
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    };

    fetchLiveStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPath = location.pathname.replace(/\/$/, '');

  const activeMenu = Object.keys(CUSTOMER_MENU_PATH).find((menu) => {
    const slug = CUSTOMER_MENU_PATH[menu];
    return currentPath === `/customer/${slug}` || currentPath.startsWith(`/customer/${slug}/`);
  });

  const activeSlug = activeMenu ? CUSTOMER_MENU_PATH[activeMenu] : null;

  useEffect(() => {
    if (!isLoadingStatus && !isVerified && VERIFIED_ONLY_SLUGS.includes(activeSlug)) {
      navigate('/customer/onboarding', { replace: true });
    }
  }, [isLoadingStatus, isVerified, activeSlug, navigate]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <CustomerSidebar
        activeMenu={activeMenu || 'Onboarding Biometrik'}
        isCustomerVerified={isVerified}
        customerProfile={customerProfile}
        onMenuSelect={(name) => {
          const slug = CUSTOMER_MENU_PATH[name];
          if (!isVerified && VERIFIED_ONLY_SLUGS.includes(slug)) return;

          if (name === 'Profil Saya') {
            setShowProfileModal(true);
            return;
          }
          navigate(`/customer/${slug}`);
        }}
        onLogout={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />

      <div className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 w-full">
        <Outlet />
      </div>

      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={customerProfile}
        isVerified={isVerified}
        onSettingsClick={() => navigate('/customer/profile/pengaturan')}
      />
    </div>
  );
}