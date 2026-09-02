import { X, Mail, Phone, ShieldCheck, Settings } from 'lucide-react';

// Modal ringkasan profil Operator, dipicu dari dropdown OperatorTopbar saat
// klik "Profil Saya" — TIDAK berpindah halaman/route. Mengikuti pola yang
// sama dengan MitraProfileModal: header gradient + avatar + badge peran,
// baris info, lalu footer Tutup / Pengaturan Akun.
//
// Catatan: komponen ini di-render lewat createPortal(..., document.body)
// dari OperatorTopbar (bukan langsung di dalam <header>), karena header
// Operator memakai backdrop-blur yang akan mematahkan positioning
// `fixed` kalau modal dirender langsung sebagai anak header. Lihat
// komentar di OperatorTopbar.jsx untuk detail.
//
// Tombol "Pengaturan Akun" di footer yang benar-benar pindah halaman
// (lewat onSettingsClick, dioper dari OperatorLayout -> OperatorTopbar ->
// modal ini).

function getInitials(name) {
  if (!name) return 'OP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'OP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function OperatorProfileModal({ isOpen, onClose, profile, onSettingsClick }) {
  if (!isOpen) return null;

  const displayName = profile?.fullName?.trim() || 'Operator Pos';
  const displayEmail = profile?.email?.trim() || 'Belum ada email terdaftar';
  const displayPhone = profile?.phone?.trim() || '-';
  const initials = getInitials(profile?.fullName);
  const photoDataUrl = profile?.photoDataUrl || '';

  const handleGoToSettings = () => {
    onClose?.();
    onSettingsClick?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 font-['Inter']"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-[#4B2172] to-[#2f1350] px-5 pt-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-[16px] font-extrabold mb-3 overflow-hidden">
            {photoDataUrl ? <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" /> : initials}
          </div>
          <p className="text-white font-bold text-[15px]">{displayName}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 bg-white/10 text-white/90 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            <ShieldCheck className="w-3 h-3" /> Operator Pos
          </span>
        </div>

        {/* Info rows */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">Email</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{displayEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">No. Telepon</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{displayPhone}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-bold text-neutral-500 hover:text-neutral-700 transition cursor-pointer px-2 py-2"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleGoToSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-full text-[10px] font-bold transition shadow-sm cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" /> Pengaturan Akun
          </button>
        </div>
      </div>
    </div>
  );
}