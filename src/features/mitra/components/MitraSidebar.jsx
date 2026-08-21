import React, { useState } from 'react';
import { LayoutDashboard, UserCheck, Calendar, QrCode, Package, Wallet, MessageSquare, ShieldCheck, LogOut, Menu, X } from 'lucide-react';

export default function MitraSidebar({ activeMenu, onMenuSelect, onLogout }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard Mitra', icon: LayoutDashboard },
    { name: 'Onboarding & Verifikasi', icon: UserCheck },
    { name: 'Kelola Trip & Jadwal', icon: Calendar },
    { name: 'Digital QR Trip', icon: QrCode },
    { name: 'Saldo & Komisi', icon: Wallet },
    { name: 'Chat Pelanggan', icon: MessageSquare },
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
        className="lg:hidden fixed top-4 left-4 z-20 w-11 h-11 rounded-2xl bg-white shadow-md border border-neutral-100 flex items-center justify-center text-[#312e81] print:hidden"
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
            <div className="w-10 h-10 rounded-2xl bg-white text-[#312e81] flex items-center justify-center font-extrabold shadow-md">
              M
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-wider">Nebeng Mitra</span>
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
          Menu Mitra Pos
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

      {/* Bagian Bawah: Keamanan & Tombol Keluar */}
      <div className="p-6 space-y-3 bg-[#b51474]/40 border-t border-white/10">
        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-600/30 flex items-center justify-center text-pink-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-white leading-tight">Mitra Terverifikasi</p>
            <p className="text-[9px] font-semibold text-pink-200">SYSTEM SECURE</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          aria-label="Keluar dari akun Mitra"
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
    </>
  );
}