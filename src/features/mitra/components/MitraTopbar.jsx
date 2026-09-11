import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, Settings } from 'lucide-react';
import MitraProfileModal from './MitraProfileModal';

export default function MitraTopbar({ profile, onSettingsClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.fullName?.trim() || 'Mitra Pos';
  const displayEmail = profile?.email?.trim() || 'Belum ada email terdaftar';
  const initials = displayName.charAt(0).toUpperCase() || 'M';
  const photoDataUrl = profile?.photoDataUrl || '';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end font-['Inter']">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-neutral-50 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#4B2172] text-white flex items-center justify-center text-[11px] font-extrabold shrink-0 overflow-hidden">
            {photoDataUrl ? <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" /> : initials}
          </div>
          <span className="hidden sm:block text-[11px] font-bold text-neutral-800">{displayName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden z-20">
            <div className="p-4 flex items-center gap-3 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-[#4B2172] text-white flex items-center justify-center text-[13px] font-extrabold shrink-0 overflow-hidden">
                {photoDataUrl ? <img src={photoDataUrl} alt="Foto Profil" className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-800 truncate">{displayName}</p>
                <p className="text-[9px] text-neutral-400 truncate">{displayEmail}</p>
              </div>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => { setIsOpen(false); setShowProfileModal(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-neutral-500" /> Profil Saya
              </button>
              <button
                onClick={() => { setIsOpen(false); onSettingsClick?.(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-500" /> Pengaturan Akun
              </button>
            </div>
          </div>
        )}
      </div>

      <MitraProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onSettingsClick={onSettingsClick}
      />
    </header>
  );
}