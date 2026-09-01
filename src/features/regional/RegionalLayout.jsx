import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import RegionalSidebar from './components/RegionalSidebar';
import RegionalTopbar from './components/RegionalTopbar';
import UserProfileModal from './components/UserProfileModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { useAuth } from '../../context/AuthContext';

const REGIONAL_MENU_PATH = {
  'Dashboard Wilayah': 'dashboard',
  'Pos Mitra & Terminal': 'pos-mitra',
  'Armada & Kurir': 'armada-kurir',
  'Verifikasi ID & Face': 'verifikasi',
  'Pemantauan Trip': 'trip-order',
  'Laporan Keuangan': 'laporan',
};

const ROLE_LABELS = {
  regional_admin: 'Admin Regional',
  admin_regional: 'Admin Regional',
  operator_pos: 'Operator Pos',
};

function formatRoleLabel(role) {
  if (!role) return 'Admin Regional';
  if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  return role
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RegionalLayout() {
  const navigate = useNavigate();
  const { logout, session, role, adminProfile, updateAdminProfile } = useAuth();
  const location = useLocation();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const currentPath = location.pathname.replace(/\/$/, '');
  const activeMenu = Object.keys(REGIONAL_MENU_PATH).find((menu) => {
    const slug = REGIONAL_MENU_PATH[menu];
    return currentPath.endsWith(`/regional/${slug}`) || currentPath.includes(`/regional/${slug}/`);
  }) || 'Dashboard Wilayah';

  // Data profil admin regional diambil dari adminProfile (bisa diedit lewat
  // Pengaturan Akun) dengan fallback ke field bawaan sesi login (bila ada)
  // lalu ke nilai default, supaya topbar tidak pernah tampil kosong walau
  // adminProfile belum pernah diisi sama sekali.
  const currentUser = {
    name: adminProfile?.name || session?.name || 'Admin Regional Surakarta',
    email: adminProfile?.email || session?.email || 'admin.surakarta@nebeng.id',
    phone: adminProfile?.phone || session?.phone || '081200000000',
    region: adminProfile?.region || session?.region || 'Jawa Tengah - Surakarta',
    role: formatRoleLabel(role),
  };

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

      <div className="flex-1 lg:ml-64 min-h-screen">
        <RegionalTopbar
          user={currentUser}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <Outlet />
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={currentUser}
        onSaveProfile={(updated) => updateAdminProfile(updated)}
      />
    </div>
  );
}