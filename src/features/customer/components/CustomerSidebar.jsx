import { useState } from 'react';
import {
  UserCheck,
  Compass,
  Ticket,
  LogOut,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import logoAsset from '../../../assets/logo.png';

export default function CustomerSidebar({ activeMenu = 'Onboarding Biometrik', onMenuSelect, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Onboarding Biometrik', icon: UserCheck },
    { name: 'Cari & Booking Trip', icon: Compass },
    { name: 'Tickets & Digital QR', icon: Ticket },
  ];

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 400);
  };

  const handleMenuSelect = (name) => {
    if (onMenuSelect) onMenuSelect(name);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="lg:hidden fixed top-4 left-4 z-20 w-11 h-11 rounded-2xl bg-white shadow-md border border-neutral-100 flex items-center justify-center text-[#4B2172] print:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        />
      )}

      <aside className={`w-64 h-screen bg-[#4B2172] text-white flex flex-col justify-between p-5 fixed left-0 top-0 shadow-md overflow-y-auto z-40 transition-transform duration-300 font-['Inter'] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 print:hidden select-none`}>
        <div>
          <div className="mb-8 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={logoAsset}
                alt="Logo Nebeng"
                className="h-8 w-8 object-contain shrink-0 filter brightness-0 invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
              <span className="font-bold text-white text-[20px] tracking-wide leading-none">
                Nebeng
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              className="lg:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-white/50 mb-2.5 px-3">
                MENU PELANGGAN
              </p>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeMenu === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleMenuSelect(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#4B2172] font-semibold shadow-sm'
                          : 'text-white/80 font-medium hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#4B2172]' : 'text-white/70'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            aria-label="Keluar Sistem"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-[#FF0055] hover:bg-[#e0004c] transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-white shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-gray-900 font-['Inter']">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-[14px] font-bold text-gray-900">Konfirmasi Keluar Sistem</h3>
              <p className="text-[10px] font-normal text-gray-500">
                Apakah Anda yakin ingin mengakhiri sesi aktif ini? Anda harus masuk kembali untuk mengakses portal pelanggan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold rounded-full transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold rounded-full transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    Ya, Keluar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}