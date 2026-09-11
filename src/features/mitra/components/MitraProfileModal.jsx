import { X, Mail, Phone, Car, MapPin, ShieldCheck, Settings } from 'lucide-react';

const DEFAULT_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  vehicleType: 'Motor',
  plateNumber: '',
  photoDataUrl: '',
};

export default function MitraProfileModal({ isOpen, onClose, profile, onSettingsClick }) {
  if (!isOpen) return null;

  const savedProfile = { ...DEFAULT_PROFILE, ...profile };
  const displayName = savedProfile.fullName.trim() || 'Mitra Pos';
  const initial = displayName.charAt(0).toUpperCase() || 'M';
  const kendaraan = [savedProfile.vehicleType, savedProfile.plateNumber].filter(Boolean).join(' • ') || '-';

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
        <div className="relative bg-linear-to-br from-[#4B2172] to-[#2f1350] px-5 pt-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-[18px] font-extrabold mb-3 overflow-hidden">
            {savedProfile.photoDataUrl ? (
              <img src={savedProfile.photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <p className="text-white font-bold text-[15px]">{displayName}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 bg-white/10 text-white/90 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            <ShieldCheck className="w-3 h-3" /> Mitra
          </span>
        </div>

        {/* Info rows */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">Email</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{savedProfile.email || 'Belum ada email terdaftar'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">No. Telepon</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{savedProfile.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <Car className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">Kendaraan</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{kendaraan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider">Alamat</p>
              <p className="text-[10px] font-bold text-neutral-800 truncate">{savedProfile.address || '-'}</p>
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