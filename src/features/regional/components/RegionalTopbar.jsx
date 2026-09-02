import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, Settings } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

/**
 * RegionalTopbar
 * Hanya berisi identitas admin yang sedang login (avatar + nama + role)
 * dengan dropdown berisi "Profil Saya" dan "Pengaturan Akun". Search bar,
 * ikon notifikasi/peringatan, dan tombol keluar sengaja TIDAK ada di sini
 * — logout tetap satu-satunya lewat tombol "Log Out" di sidebar, supaya
 * tidak ada dua modal konfirmasi keluar yang saling tumpang tindih.
 *
 * FIX (samakan pola dengan Mitra): "Profil Saya" sekarang dibuka sebagai
 * modal ringkasan yang dikelola langsung di sini (mengikuti pola
 * MitraTopbar -> MitraProfileModal), bukan lagi lifted state di
 * RegionalLayout. "Pengaturan Akun" TIDAK lagi membuka modal — sekarang
 * berpindah ke halaman penuh lewat onSettingsClick (dioper dari
 * RegionalLayout ke /regional/profile/pengaturan), persis seperti pola
 * Mitra (/mitra/profile/pengaturan).
 */
export default function RegionalTopbar({ user, onSettingsClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name?.trim() || 'Admin Regional';
  const firstName = displayName.split(' ')[0];
  const displayRole = user?.role?.trim() || 'Admin Regional';
  const photoDataUrl = user?.photoDataUrl || '';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'AR';

  useEffect(() => {
    if (!isDropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="sticky top-0 z-10 bg-[#f8f9fa]/80 backdrop-blur-sm pl-20 pr-4 sm:pr-6 lg:px-8 pt-4 pb-3 font-['Inter'] flex justify-end">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white border border-neutral-100 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:block text-left leading-tight max-w-[140px]">
            <p className="text-[11px] font-bold text-neutral-800 truncate">{firstName}</p>
            <p className="text-[9px] text-neutral-400 truncate">{displayRole}</p>
          </div>
          <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-20">
            <div className="p-4 flex items-center gap-3 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-neutral-800 truncate">{displayName}</p>
                <p className="text-[10px] text-neutral-400 truncate">{user?.email || '-'}</p>
              </div>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => { setIsDropdownOpen(false); setShowProfileModal(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer text-left"
              >
                <User size={14} className="text-neutral-400 shrink-0" />
                Profil Saya
              </button>
              <button
                onClick={() => { setIsDropdownOpen(false); onSettingsClick && onSettingsClick(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer text-left"
              >
                <Settings size={14} className="text-neutral-400 shrink-0" />
                Pengaturan Akun
              </button>
            </div>
          </div>
        )}
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSettingsClick={onSettingsClick}
      />
    </div>
  );
}