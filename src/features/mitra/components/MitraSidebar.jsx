import { useState } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  QrCode,
  Wallet,
  MessageSquare,
  LogOut,
  AlertTriangle,
  Lock,
  ShieldCheck
} from 'lucide-react';
import logoAsset from '../../../assets/logo.png';
import apiClient from '../../../services/apiClient';

const PRIMARY_COLOR = '#10367D';

export default function MitraSidebar({
  activeMenu = 'Dashboard Mitra',
  onMenuSelect,
  onLogout,
  isVerified = false
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard Mitra',
      icon: LayoutDashboard,
      locked: !isVerified,
      lockMessage: 'Fitur terkunci. Memerlukan verifikasi Admin Regional.'
    },
    ...(!isVerified ? [{
      name: 'Onboarding & Verifikasi',
      icon: UserCheck,
      locked: false,
      label: 'Onboarding & Verifikasi',
    }] : []),
    {
      name: 'Kelola Trip & Jadwal',
      icon: Calendar,
      locked: !isVerified,
      lockMessage: 'Fitur terkunci. Memerlukan verifikasi Admin Regional.'
    },
    {
      name: 'Digital QR Trip',
      icon: QrCode,
      locked: !isVerified,
      lockMessage: 'Fitur terkunci. Memerlukan verifikasi Admin Regional.'
    },
    {
      name: 'Saldo & Komisi',
      icon: Wallet,
      locked: !isVerified,
      lockMessage: 'Fitur terkunci. Memerlukan verifikasi Admin Regional.'
    },
    {
      name: 'Chat Pelanggan',
      icon: MessageSquare,
      locked: !isVerified,
      lockMessage: 'Fitur terkunci. Memerlukan verifikasi Admin Regional.'
    },
  ];

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Gagal mencabut token di server:', err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      if (onLogout) onLogout();
    }
  };

  const handleMenuSelect = (item) => {
    if (item.locked) return;
    if (onMenuSelect) onMenuSelect(item.name);
    setIsMobileOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] print:hidden">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeMenu === item.name;

          return (
            <button
              key={item.name}
              disabled={item.locked}
              onClick={() => handleMenuSelect(item)}
              className={`flex flex-col items-center justify-center gap-1 min-w-16 px-1 py-1 rounded-xl transition ${
                isActive 
                  ? 'bg-blue-50/50' 
                  : item.locked 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-neutral-50'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-[#10367D] text-white' : 'text-neutral-500'}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight ${isActive ? 'text-[#10367D]' : 'text-neutral-500'}`}>
                {item.label || item.name.split(' ')[0]}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-[#10367D] mt-0.5" />}
            </button>
          );
        })}
      </div>

      <aside
        className={`hidden lg:flex w-64 h-screen text-white flex-col justify-between p-5 fixed left-0 top-0 shadow-md overflow-y-auto z-40 transition-transform duration-300 font-['Inter'] print:hidden select-none`}
        style={{ backgroundColor: PRIMARY_COLOR }}
      >
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
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-[#74B4D9] mb-2.5 px-3">
                MENU MITRA POS
              </p>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeMenu === item.name;

                  return (
                    <button
                      key={item.name}
                      disabled={item.locked}
                      onClick={() => handleMenuSelect(item)}
                      title={item.locked ? item.lockMessage : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] transition text-left ${
                        isActive
                          ? 'bg-white font-semibold shadow-sm cursor-default'
                          : item.locked
                          ? 'text-white/40 font-medium cursor-not-allowed opacity-60'
                          : 'text-white/80 font-medium hover:bg-white/10 hover:text-white cursor-pointer'
                      }`}
                      style={isActive ? { color: PRIMARY_COLOR } : undefined}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${
                          isActive
                            ? ''
                            : item.locked
                            ? 'text-white/30'
                            : 'text-white/70'
                        }`}
                        style={isActive ? { color: PRIMARY_COLOR } : undefined}
                      />

                      <span className="flex-1">{item.label || item.name}</span>

                      {item.name === 'Onboarding & Verifikasi' && isVerified ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#74B4D9] shrink-0" />
                      ) : item.locked ? (
                        <Lock className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      ) : null}
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold text-white bg-white/10 hover:bg-white/20 transition cursor-pointer border border-white/10"
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

              <h3 className="text-[14px] font-bold text-gray-900">
                Konfirmasi Keluar Sistem
              </h3>

              <p className="text-[10px] font-normal text-gray-500">
                Apakah Anda yakin ingin mengakhiri sesi aktif ini? Anda harus
                masuk kembali untuk mengakses panel mitra.
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