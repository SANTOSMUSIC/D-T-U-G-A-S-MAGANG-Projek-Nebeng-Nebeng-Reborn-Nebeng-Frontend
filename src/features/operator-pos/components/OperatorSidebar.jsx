import React from 'react';
import { LayoutDashboard, QrCode, UserCheck, ShieldCheck, LogOut, ClipboardCheck } from 'lucide-react';

export default function OperatorSidebar({ activeMenu, onMenuSelect, onLogout }) {
  const menuItems = [
    { name: 'Dashboard Pos', icon: LayoutDashboard },
    { name: 'Inspection & Sealing', icon: ClipboardCheck },
    { name: 'Dual QR Scanner', icon: QrCode },
    { name: 'Handover Verification', icon: UserCheck },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-[#b819b8] via-[#e61994] to-[#fc156a] text-white flex flex-col justify-between fixed top-0 left-0 print:hidden z-30 select-none shadow-xl">
      <div className="p-6 overflow-y-auto">
        {/* Logo Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#c91882] flex items-center justify-center font-extrabold shadow-md">
            N
          </div>
          <div>
            <span className="text-white font-extrabold text-lg tracking-wider">Nebeng</span>
          </div>
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
                onClick={() => onMenuSelect(item.name)}
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