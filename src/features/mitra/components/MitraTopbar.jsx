import { BASE_URL } from '../../../config/env';
import logoAsset from '../../../assets/logo.png';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown, User, Settings } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import MitraProfileModal from './MitraProfileModal';

const PRIMARY_COLOR = '#10367D';
const PRIMARY_ACCENT = '#74B4D9';

const getFullFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseURL = apiClient.defaults.baseURL
    ? apiClient.defaults.baseURL.replace('/api', '')
    : BASE_URL;

  return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function MitraTopbar({ onSettingsClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  // Ambil data profil dari database
  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data) {
        setUserData(response.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data user untuk Topbar:', err);
    }
  }, []);

  // Sync data profil secara otomatis & aman dari ESLint warning
  useEffect(() => {
    let isMounted = true;

    // Ambil data saat komponen pertama kali dirender secara aman
    const loadInitialData = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (isMounted && response.data) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data user untuk Topbar:', err);
      }
    };

    loadInitialData();

    // Event listener untuk update otomatis saat tab di-fokuskan kembali
    const handleFocus = () => {
      fetchUserData();
    };

    // Event listener custom jika ada bagian aplikasi lain yang memperbarui profil
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchUserData]);

  // Handle klik di luar dropdown
  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const displayName = userData?.name || 'Mitra Nebeng';

  // Mendapatkan path avatar terbaru dari database
  const rawAvatarPath = userData?.avatar || userData?.profilePicture || userData?.photo;
  const photoUrl = getFullFileUrl(rawAvatarPath);

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'M';

  return (
    <div className="bg-white text-[#10367D] pl-4 pr-4 sm:pr-6 lg:px-8 pt-4 pb-4 flex items-center justify-between sticky top-0 z-10 font-['Inter'] shadow-sm border-b border-neutral-100"><div className="flex items-center gap-2.5 lg:hidden"><img src={logoAsset} alt="Logo Nebeng" className="h-8 w-8 object-contain shrink-0" /><span className="font-bold text-[20px] tracking-wide leading-none">Nebeng</span></div><div className="flex items-center gap-3 ml-auto"><div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden"
              style={{
                backgroundColor: PRIMARY_COLOR,
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <ChevronDown
              size={14}
              className={`text-white shrink-0 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-20">
            <div className="p-4 flex items-center gap-3 border-b border-neutral-100">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  border: `1px solid ${PRIMARY_ACCENT}`,
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[12px] font-bold text-neutral-800 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {userData?.email || '-'}
                </p>
              </div>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer text-left"
              >
                <User
                  size={14}
                  className="text-neutral-400 shrink-0"
                />
                Profil Saya
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onSettingsClick && onSettingsClick();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer text-left"
              >
                <Settings
                  size={14}
                  className="text-neutral-400 shrink-0"
                />
                Pengaturan Akun
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
      <MitraProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          fetchUserData();
        }}
        onSettingsClick={onSettingsClick}
      />
    </div>
  );
}



