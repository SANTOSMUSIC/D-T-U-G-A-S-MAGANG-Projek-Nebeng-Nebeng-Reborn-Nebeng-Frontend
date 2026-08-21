import React, { useState } from 'react';
import { LayoutDashboard, QrCode, UserCheck, ShieldCheck, LogOut, ClipboardCheck, AlertTriangle, Menu, X } from 'lucide-react';

export default function OperatorSidebar({ activeMenu, onMenuSelect, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard Pos', icon: LayoutDashboard },
    { name: 'Inspection & Sealing', icon: ClipboardCheck },
    { name: 'Dual QR Scanner', icon: QrCode },
    { name: 'Handover Verification', icon: UserCheck },
  ];

  const handleMenuSelect = (name) => {
    onMenuSelect(name);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Tombol Hamburger (khusus mobile/tablet) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="lg:hidden fixed top-4 left-4 z-20 w-11 h-11 rounded-2xl bg-white shadow-md border border-neutral-100 flex items-center justify-center text-[#c91882] print:hidden"
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

      <aside className={`w-64 h-screen bg-gradient-to-b from-[#b819b8] via-[#e61994] to-[#fc156a] text-white flex flex-col justify-between fixed top-0 left-0 print:hidden z-40 select-none shadow-xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 overflow-y-auto">
          {/* Logo Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#c91882] flex items-center justify-center font-extrabold shadow-md">
                N
              </div>
              <div>
                <span className="text-white font-extrabold text-lg tracking-wider">Nebeng</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              className="lg:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader Menu */}
          <p className="text-[10px] font-extrabold text-pink-200 uppercase tracking-widest mb-3 px-2">
            Menu Pos Utama
          </p>

          {/* Navigasi Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMenuSelect(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#c91882] shadow-md'
                      : 'text-pink-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bagian Bawah: Keamanan, Profil, & Tombol Keluar */}
        <div className="p-6 space-y-3 bg-[#b51474]/40 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-white leading-tight">Keamanan Pos</p>
              <p className="text-[9px] font-semibold text-pink-200">SYSTEM PROTECTED</p>
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-[#c91882] flex items-center justify-center font-extrabold text-xs">
              OP
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">Operator Solo</p>
              <p className="text-[9px] font-semibold text-pink-200 uppercase">OPERATOR POS</p>
            </div>
          </div>

          {/* Tombol Keluar memicu Modal Konfirmasi */}
          <button 
            onClick={() => setShowLogoutModal(true)}
            aria-label="Keluar dari akun Operator Pos"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Modal Konfirmasi Keluar Sistem */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-neutral-100 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center border border-red-100 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-base font-black text-neutral-900 mb-1">Konfirmasi Keluar Sistem</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Apakah Anda yakin ingin mengakhiri sesi aktif wilayah ini? Anda harus masuk kembali untuk mengakses operator pos.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}