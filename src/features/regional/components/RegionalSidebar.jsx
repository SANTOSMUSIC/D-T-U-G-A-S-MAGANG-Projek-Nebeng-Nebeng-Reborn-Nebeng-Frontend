import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  ShieldCheck, 
  Navigation, 
  Truck, 
  FileText, 
  LogOut,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import logoImage from '../../../assets/LOGO.png';

export default function RegionalSidebar({ activeMenu = 'Dashboard Wilayah', onMenuSelect, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard Wilayah', icon: LayoutDashboard },
    { name: 'Kelola Pos Mitra', icon: Store },
    { name: 'Operator Pos', icon: Users },
    { name: 'Pusat Verifikasi', icon: ShieldCheck },
    { name: 'Trip & Order', icon: Navigation },
    { name: 'Armada & Kurir', icon: Truck },
    { name: 'Laporan Finansial', icon: FileText },
  ];

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      if (onLogout) onLogout();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }, 800);
  };

  const handleMenuSelect = (name) => {
    onMenuSelect && onMenuSelect(name);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Tombol Hamburger (khusus mobile/tablet) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="lg:hidden fixed top-4 left-4 z-20 w-11 h-11 rounded-2xl bg-white shadow-md border border-neutral-100 flex items-center justify-center text-[#e61994]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay saat sidebar terbuka di mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        />
      )}

      <aside className={`w-64 h-screen bg-gradient-to-b from-[#b819b8] via-[#e61994] to-[#fc156a] flex flex-col justify-between p-6 text-white fixed left-0 top-0 shadow-xl overflow-y-auto z-40 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div>
          {/* Logo Brand */}
          <div className="mb-8 px-2 flex items-center justify-between">
            <img 
              src={logoImage} 
              alt="Logo Nebeng" 
              className="h-10 w-auto object-contain filter brightness-0 invert" 
            />
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              className="lg:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-200/70 mb-4 px-2">
            MENU WILAYAH
          </p>

          {/* Dynamic Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMenuSelect(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition text-left cursor-pointer ${
                    isActive 
                      ? 'bg-white text-pink-900 shadow-lg font-bold' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (Profile & Logout) */}
        <div className="space-y-4 pt-6 border-t border-white/15">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-pink-600/30 flex items-center justify-center text-pink-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide text-white">Keamanan Wilayah</p>
              <p className="text-[9px] text-pink-200">SYSTEM PROTECTED</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-pink-300 overflow-hidden border-2 border-white/20 flex items-center justify-center font-bold text-pink-900">
                  A
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#b819b8]"></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Admin Jateng</p>
                <p className="text-[10px] text-pink-200 tracking-wider font-medium">REGIONAL ADMIN</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)}
            aria-label="Keluar dari akun Admin Wilayah"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition shadow-sm active:scale-95 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* MODAL KONFIRMASI KELUAR SISTEM */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-gray-900 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-black text-gray-900">Konfirmasi Keluar Sistem</h3>
              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin mengakhiri sesi aktif wilayah ini? Anda harus masuk kembali untuk mengakses portal admin regional.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold rounded-2xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-2xl transition shadow-sm shadow-rose-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}