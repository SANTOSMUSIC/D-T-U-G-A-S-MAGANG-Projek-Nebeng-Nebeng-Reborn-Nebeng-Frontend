import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import RegionalSidebar from './components/RegionalSidebar';

export const REGIONAL_MENU_PATH = {
  'Dashboard Wilayah': 'dashboard',
  'Kelola Pos Mitra': 'pos-mitra',
  'Operator Pos': 'operator-pos',
  'Pusat Verifikasi': 'verifikasi',
  'Trip & Order': 'trip-order',
  'Armada & Kurir': 'armada-kurir',
  'Laporan Finansial': 'laporan',
};
const PATH_TO_MENU = Object.fromEntries(
  Object.entries(REGIONAL_MENU_PATH).map(([name, path]) => [path, name])
);

export default function RegionalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSlug = location.pathname.split('/').pop();
  const activeMenu = PATH_TO_MENU[currentSlug] || 'Dashboard Wilayah';

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <RegionalSidebar
        activeMenu={activeMenu}
        onMenuSelect={(name) => navigate(`/regional/${REGIONAL_MENU_PATH[name]}`)}
        onLogout={() => navigate('/login', { replace: true })}
      />
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
