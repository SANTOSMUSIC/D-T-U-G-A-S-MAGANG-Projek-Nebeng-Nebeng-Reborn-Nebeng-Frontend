import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MitraSidebar from './components/MitraSidebar';

export const MITRA_MENU_PATH = {
  'Dashboard Mitra': 'dashboard',
  'Onboarding & Verifikasi': 'onboarding',
  'Kelola Trip & Jadwal': 'trip',
  'Digital QR Trip': 'qr',
  'Saldo & Komisi': 'saldo',
  'Chat Pelanggan': 'chat',
};
const PATH_TO_MENU = Object.fromEntries(
  Object.entries(MITRA_MENU_PATH).map(([name, path]) => [path, name])
);

export default function MitraLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSlug = location.pathname.split('/').pop();
  const activeMenu = PATH_TO_MENU[currentSlug] || 'Dashboard Mitra';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <MitraSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/mitra/${MITRA_MENU_PATH[name]}`)}
        onLogout={() => navigate('/login', { replace: true })}
      />
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
