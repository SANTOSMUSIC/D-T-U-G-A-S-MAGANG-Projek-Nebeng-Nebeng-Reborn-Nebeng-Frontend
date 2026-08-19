import React from 'react';
import { LayoutDashboard, UserCheck, Calendar, QrCode, Package, Wallet, MessageSquare, ShieldCheck, LogOut } from 'lucide-react';

export default function MitraSidebar({ activeMenu, onMenuSelect, onLogout }) {
  const menuItems = [
    { name: 'Dashboard Mitra', icon: LayoutDashboard },
    { name: 'Onboarding & Verifikasi', icon: UserCheck },
    { name: 'Kelola Trip & Jadwal', icon: Calendar },
    { name: 'Digital QR Trip', icon: QrCode },
    { name: 'Saldo & Komisi', icon: Wallet },
    { name: 'Chat Pelanggan', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-[#b819b8] via-[#e61994] to-[#fc156a] text-white flex flex-col justify-between fixed top-0 left-0 print:hidden z-30 select-none shadow-xl">
      <div className="p-6 overflow-y-auto">
        {/* Logo Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#312e81] flex items-center justify-center font-extrabold shadow-md">
            M
          </div>
          <div>
            <span className="text-white font-extrabold text-lg tracking-wider">Nebeng Mitra</span>
          </div>
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
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}