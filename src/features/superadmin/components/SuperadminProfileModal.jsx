import { X, Mail, ShieldCheck, UserCircle, Settings } from 'lucide-react';

// Modal ringkasan profil Superadmin, dipicu dari SuperadminHeader saat
// klik "Profil Saya" — TIDAK berpindah halaman/route. Sebelumnya modal ini
// inline di SuperadminLayout.jsx dan murni read-only (cuma "Tutup").
// Sekarang dipisah jadi komponen sendiri dan dapat tombol "Pengaturan
// Akun" di footer, mengikuti pola yang sama dengan MitraProfileModal /
// CustomerProfileModal — modal tetap ringkasan, perubahan data dilakukan
// di halaman penuh lewat onSettingsClick.

const formatRole = (role) => {
  if (!role) return 'Superadmin';
  return role
    .split(/[-_ ]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export default function SuperadminProfileModal({ isOpen, onClose, session, role, superadminProfile, onSettingsClick }) {
  if (!isOpen) return null;

  // superadminProfile (hasil edit di Pengaturan Akun) diprioritaskan,
  // fallback ke field session asli dari `extra` saat login.
  const displayName = superadminProfile?.name || session?.name || session?.fullName || session?.username || 'Admin';
  const displayEmail = superadminProfile?.email || session?.email || '';
  const displayRole = formatRole(role || session?.role);
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleGoToSettings = () => {
    onClose?.();
    onSettingsClick?.();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-gray-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-[14px] font-bold text-neutral-800">Profil Saya</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold text-[18px] shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-neutral-800 truncate">{displayName}</p>
            <p className="text-[10px] text-neutral-400 truncate">{displayRole}</p>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <Mail size={14} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-700 truncate">{displayEmail || 'Email tidak tersedia'}</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <ShieldCheck size={14} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-700">{displayRole}</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <UserCircle size={14} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-700">{session?.id || session?.username || '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold rounded-full transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleGoToSettings}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#4B2172] hover:bg-[#3b195a] text-white text-[11px] font-semibold rounded-full transition cursor-pointer"
          >
            <Settings size={14} /> Pengaturan Akun
          </button>
        </div>
      </div>
    </div>
  );
}