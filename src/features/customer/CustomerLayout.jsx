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

// Routes that require the customer to have completed biometric verification first.
// "profile" ikut dimasukkan karena sekarang menaungi halaman Pengaturan Akun
// (/customer/profile/pengaturan) yang mengubah data identitas — sama seperti
// booking/tickets, tidak masuk akal diakses sebelum verifikasi selesai.
const VERIFIED_ONLY_SLUGS = ['booking', 'tickets', 'profile'];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { logout, isCustomerVerified, customerProfile } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentPath = location.pathname.replace(/\/$/, '');

  const activeMenu = Object.keys(CUSTOMER_MENU_PATH).find((menu) => {
    const slug = CUSTOMER_MENU_PATH[menu];
    return currentPath === `/customer/${slug}` || currentPath.startsWith(`/customer/${slug}/`);
  });

  const activeSlug = activeMenu ? CUSTOMER_MENU_PATH[activeMenu] : null;

  // Guard: block access to booking/tickets/profile until onboarding is complete
  useEffect(() => {
    if (!isCustomerVerified && VERIFIED_ONLY_SLUGS.includes(activeSlug)) {
      navigate('/customer/onboarding', { replace: true });
    }
  }, [isCustomerVerified, activeSlug, navigate]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-['Inter']">
      <CustomerSidebar
        activeMenu={activeMenu || 'Onboarding Biometrik'}
        isCustomerVerified={isCustomerVerified}
        customerProfile={customerProfile}
        onMenuSelect={(name) => {
          const slug = CUSTOMER_MENU_PATH[name];
          if (!isCustomerVerified && VERIFIED_ONLY_SLUGS.includes(slug)) return;

          // "Profil Saya" membuka modal ringkasan langsung di tempat (tidak
          // berpindah halaman), sama seperti pola "Profil Saya" di panel
          // Mitra. Pengaturan Akun (edit data) tetap halaman penuh, diakses
          // lewat tombol di footer modal.
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
        isVerified={isCustomerVerified}
        onSettingsClick={() => navigate('/customer/profile/pengaturan')}
      />
    </div>
  );
}