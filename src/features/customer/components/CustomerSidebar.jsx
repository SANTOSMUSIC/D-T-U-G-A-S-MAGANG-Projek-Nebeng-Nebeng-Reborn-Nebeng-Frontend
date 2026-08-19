import React, { useState } from 'react';
import { UserCheck, Compass, Ticket, ShieldCheck, LogOut, AlertTriangle } from 'lucide-react';

export default function CustomerSidebar({ activeMenu, onMenuSelect, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Onboarding Biometrik', icon: UserCheck },
    { name: 'Cari & Booking Trip', icon: Compass },
    { name: 'Tickets & Digital QR', icon: Ticket }, // Diselaraskan di sini
  ];

  return (
    <>
      <aside className="w-64 h-screen bg-gradient-to-b from-[#b819b8] via-[#e61994] to-[#fc156a] text-white flex flex-col justify-between fixed top-0 left-0 print:hidden z-30 select-none shadow-xl">
        <div className="p-6 overflow-y-auto">
          {/* Logo Brand / Header Sidebar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#312e81] flex items-center justify-center font-extrabold shadow-md">
              C
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-wider block">Nebeng Customer</span>
            </div>
          </div>

          {/* Subheader Menu */}
          <p className="text-[10px] font-extrabold text-pink-200 uppercase tracking-widest mb-3 px-2">
            Menu Portal Pelanggan
          </p>

          {/* Navigasi Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => onMenuSelect(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#312e81] shadow-md'
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

        {/* Bagian Bawah: Keamanan, Status & Tombol Keluar */}
        <div className="p-6 space-y-3 bg-[#b51474]/40 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-600/30 flex items-center justify-center text-pink-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-white leading-tight">Keamanan Pos</p>
              <p className="text-[9px] font-semibold text-pink-200">SYSTEM PROTECTED</p>
            </div>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-pink-700 flex items-center justify-center font-extrabold text-xs shadow-sm">
              OP
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-white leading-tight">Pelanggan Aktif</p>
              <p className="text-[9px] font-semibold text-pink-200">CUSTOMER PORTAL</p>
            </div>
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Modal Konfirmasi Keluar Sistem */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-neutral-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 mb-2">Konfirmasi Keluar Sistem</h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi aktif wilayah ini? Anda harus masuk kembali untuk mengakses portal pelanggan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
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