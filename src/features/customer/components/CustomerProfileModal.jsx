import { X, Phone, IdCard, ShieldCheck, Settings, CalendarCheck } from 'lucide-react';

// Modal ringkasan profil Customer, dipicu dari CustomerSidebar saat klik
// "Profil Saya" — TIDAK berpindah halaman/route. Mengikuti pola visual
// yang sama dengan MitraProfileModal (header gradient + avatar bulat +
// badge status, lalu baris info, lalu footer Tutup / Pengaturan Akun).
//
// Tombol "Pengaturan Akun" di footer modal ini yang benar-benar pindah
// halaman (lewat onSettingsClick, dioper dari CustomerLayout -> modal ini).

// FIX: sama seperti di CustomerAccountSettings.jsx — cegah slice(0,4)/
// slice(-4) tumpang tindih untuk NIK <=8 karakter yang bisa membocorkan
// digit asli alih-alih menyamarkannya.
const maskNik = (nik) => {
  if (!nik) return '-';
  if (nik.length <= 8) return 'x'.repeat(nik.length);
  return `${nik.slice(0, 4)}${'x'.repeat(nik.length - 8)}${nik.slice(-4)}`;
};

export default function CustomerProfileModal({ isOpen, onClose, profile, isVerified, onSettingsClick }) {
  if (!isOpen) return null;

  const displayName = profile?.fullName?.trim() || 'Pelanggan Nebeng';
  const initial = displayName.charAt(0).toUpperCase() || 'P';
  const photoDataUrl = profile?.photoDataUrl || '';
  const memberSince = profile?.verifiedAt
    ? new Date(profile.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

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

          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-[18px] font-extrabold mb-3 overflow-hidden">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <p className="text-white font-bold text-[15px]">{displayName}</p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
              isVerified ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/10 text-white/90'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> {isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
          </span>
        </div>

        {/* Info rows */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">No. WhatsApp/HP</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{profile?.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <IdCard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">NIK</p>
              <p className="text-[10px] font-bold text-neutral-800 font-mono truncate">{maskNik(profile?.nik)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <CalendarCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">Anggota Sejak</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{memberSince}</p>
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