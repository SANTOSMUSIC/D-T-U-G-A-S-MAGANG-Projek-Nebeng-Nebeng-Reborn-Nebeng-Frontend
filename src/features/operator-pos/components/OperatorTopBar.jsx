import { BASE_URL } from '../../../config/env';
import logoAsset from '../../../assets/logo.png';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, User, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import OperatorProfileModal from './OperatorProfileModal';
import apiClient from '../../../services/apiClient';

const PRIMARY_COLOR = '#10367D';
const PRIMARY_HOVER = '#0C2C66';
const PRIMARY_ACCENT = '#74B4D9';

function getInitials(name) {
  if (!name) return 'OP';

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'OP';

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function OperatorTopbar({ onSettingsClick }) {
  const { adminProfile, updateAdminProfile } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const dropdownRef = useRef(null);

  // Sinkronisasi data user real-time dari backend (aman dari infinite loop)
  useEffect(() => {
    let isMounted = true;

    async function syncOperatorTopbar() {
      try {
        const res = await apiClient.get('/auth/me');

        if (isMounted && res?.data) {
          const dbUser = res.data;

          const freshName =
            dbUser.name ||
            dbUser.fullName ||
            'Operator Pos';

          const freshEmail = dbUser.email || '';
          const freshPhone = dbUser.phone || '';

          const rawAvatar =
            dbUser.avatar ||
            dbUser.photoDataUrl ||
            '';

          let formattedAvatar = rawAvatar;

          if (
            rawAvatar &&
            !rawAvatar.startsWith('http') &&
            !rawAvatar.startsWith('data:')
          ) {
            const baseURL = apiClient.defaults.baseURL
              ? apiClient.defaults.baseURL.replace('/api', '')
              : BASE_URL;

            formattedAvatar = `${baseURL}${rawAvatar}`;
          }

          if (updateAdminProfile) {
            updateAdminProfile({
              fullName: freshName,
              name: freshName,
              email: freshEmail,
              phone: freshPhone,
              photoDataUrl: formattedAvatar,
              assignedPickupPointName: dbUser.assignedPickupPointName,
            });
          }
        }
      } catch (err) {
        console.error(
          'Gagal menyinkronkan profil topbar operator:',
          err
        );
      }
    }

    syncOperatorTopbar();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasCustomName = Boolean(
    adminProfile?.fullName ||
    adminProfile?.name
  );

  const displayName = hasCustomName
    ? adminProfile.fullName || adminProfile.name
    : 'Operator Pos';

  const posName =
    adminProfile?.assignedPickupPointName ||
    adminProfile?.posName ||
    '';

  const roleLine = posName
    ? `Operator - ${posName}`
    : 'Operator Pos';

  const initials = getInitials(displayName);

  const photoDataUrl =
    adminProfile?.photoDataUrl || '';

  // Close dropdown ketika klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/35 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_12px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between font-['Inter']"><div className="flex items-center gap-2.5 lg:hidden"><img src={logoAsset} alt="Logo Nebeng" className="h-8 w-8 object-contain shrink-0" /><span className="font-bold text-[20px] text-[#10367D] tracking-wide leading-none">Nebeng</span></div><div
        className="relative ml-auto"
        ref={dropdownRef}
      >
        <button
          onClick={() =>
            setIsDropdownOpen((v) => !v)
          }
          aria-label="Menu profil"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/70 transition cursor-pointer"
        >
          <span className="relative shrink-0">
            <span
              className="w-10 h-10 md:w-8 md:h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: PRIMARY_COLOR,
                border: `1px solid ${PRIMARY_ACCENT}`,
              }}
            >
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                initials
              )}
            </span>

            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#f8f9fa]" />
          </span>

          <span className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-[11px] font-bold text-neutral-800">
              {displayName}
            </span>

            <span className="text-[9px] text-neutral-400 font-medium">
              {roleLine}
            </span>
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
              isDropdownOpen
                ? 'rotate-180'
                : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-neutral-100 py-2 z-30">
            {/* Profile summary */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-neutral-100">
              <span
                className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  border: `1px solid ${PRIMARY_ACCENT}`,
                }}
              >
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  initials
                )}
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-800 truncate">
                  {displayName}
                </p>

                <p className="text-[9px] text-neutral-400 truncate">
                  {adminProfile?.email ||
                    'Belum ada email'}
                </p>
              </div>
            </div>

            {/* Profil Saya */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setShowProfileModal(true);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              Profil Saya
            </button>

            {/* Pengaturan Akun */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onSettingsClick?.();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[10px] font-semibold transition cursor-pointer"
              style={{
                color: PRIMARY_COLOR,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  `${PRIMARY_ACCENT}18`;
                e.currentTarget.style.color =
                  PRIMARY_HOVER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  'transparent';
                e.currentTarget.style.color =
                  PRIMARY_COLOR;
              }}
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Akun
            </button>
          </div>
        )}
      </div>

      {showProfileModal &&
        createPortal(
          <OperatorProfileModal
            isOpen={showProfileModal}
            onClose={() =>
              setShowProfileModal(false)
            }
            profile={adminProfile}
            onSettingsClick={onSettingsClick}
          />,
          document.body
        )}
    </header>
  );
}



