import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import CustomerSidebar from './components/CustomerSidebar';
import CustomerProfileModal from './components/CustomerProfileModal';

import { useAuth } from '../../context/AuthContext';

const CUSTOMER_MENU_PATH = {
  'Onboarding Biometrik': 'onboarding',
  'Cari & Booking Trip': 'booking',
  'Tickets & Digital QR': 'tickets',
  'Profil Saya': 'profile',
};

const VERIFIED_ONLY_SLUGS = ['booking', 'tickets', 'profile'];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { logout, customerProfile, isCustomerVerified, checkAuthStatus } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (checkAuthStatus) {
        await checkAuthStatus();
      }
      if (isMounted) setIsLoadingStatus(false);
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus]);

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(CUSTOMER_MENU_PATH).find((menu) => {
    const slug = CUSTOMER_MENU_PATH[menu];
    return currentPath === `/customer/${slug}` || currentPath.startsWith(`/customer/${slug}/`);
  });
  const activeSlug = activeMenu ? CUSTOMER_MENU_PATH[activeMenu] : null;

  // Proteksi Navigasi Tunggal
  useEffect(() => {
    if (isLoadingStatus) return;

    if (isCustomerVerified && activeSlug === 'onboarding') {
      navigate('/customer/booking', { replace: true });
    } else if (!isCustomerVerified && VERIFIED_ONLY_SLUGS.includes(activeSlug)) {
      navigate('/customer/onboarding', { replace: true });
    }
  }, [isLoadingStatus, isCustomerVerified, activeSlug, navigate]);

  // Cegah render layout/layout flicker saat status verifikasi awal sedang dicek
  if (isLoadingStatus) {
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <CustomerSidebar
        activeMenu={activeMenu || 'Onboarding Biometrik'}
        isCustomerVerified={isCustomerVerified}
        customerProfile={customerProfile}
        onMenuSelect={(name) => {
          const slug = CUSTOMER_MENU_PATH[name];
          if (!isCustomerVerified && VERIFIED_ONLY_SLUGS.includes(slug)) return;
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

      {/* Menghubungkan CustomerProfileModal dengan state showProfileModal */}
      {showProfileModal && (
        <CustomerProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={customerProfile}
        />
      )}
    </div>
  );
}