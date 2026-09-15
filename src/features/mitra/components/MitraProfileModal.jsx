import { createPortal } from 'react-dom';
import { Mail, Phone, Car, MapPin, ShieldCheck, Settings, X } from 'lucide-react';

const PRIMARY_COLOR = '#4FBF99';
const PRIMARY_HOVER = '#429f80';
const PRIMARY_ACCENT = '#66CDAA';

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
  const photoDataUrl = savedProfile.photoDataUrl || '';
  const initials = displayName.charAt(0).toUpperCase() || 'M';
  const kendaraan =
    [savedProfile.vehicleType, savedProfile.plateNumber]
      .filter(Boolean)
      .join(' • ') || '-';

  const fields = [
    {
      icon: Mail,
      label: 'Email',
      value: savedProfile.email || 'Belum ada email terdaftar',
    },
    {
      icon: Phone,
      label: 'No. Telepon',
      value: savedProfile.phone || '-',
    },
    {
      icon: Car,
      label: 'Kendaraan',
      value: kendaraan,
    },
    {
      icon: MapPin,
      label: 'Alamat',
      value: savedProfile.address || '-',
    },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl text-gray-900 font-['Inter'] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="p-6 text-white relative shrink-0"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${PRIMARY_HOVER})`,
          }}
        >
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-[18px] shrink-0 overflow-hidden">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-[14px] font-bold truncate">
                {displayName}
              </h3>

              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck
                  className="w-3 h-3 shrink-0"
                  style={{ color: '#d5f7e9' }}
                />
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide truncate"
                  style={{ color: '#d5f7e9' }}
                >
                  Mitra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2.5 overflow-y-auto">
          {fields.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-neutral-50 border border-neutral-100 rounded-xl px-3.5 py-2.5"
            >
              <Icon className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />

              <div className="min-w-0">
                <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-[10px] font-semibold text-neutral-800 break-words">
                  {value}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer transition"
            >
              Tutup
            </button>

            <button
              onClick={() => {
                onClose && onClose();
                onSettingsClick && onSettingsClick();
              }}
              className="px-4 py-2 text-[10px] font-bold text-white rounded-full cursor-pointer shadow-sm transition flex items-center gap-1.5"
              style={{
                backgroundColor: PRIMARY_COLOR,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
              }}
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Akun
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}