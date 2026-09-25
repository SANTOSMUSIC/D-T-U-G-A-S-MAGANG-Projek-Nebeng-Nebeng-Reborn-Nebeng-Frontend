import { BASE_URL } from '../../../config/env';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ChevronDown,
  User,
  Settings,
} from 'lucide-react';

import UserProfileModal from './UserProfileModal';

import apiClient from '../../../services/apiClient';

export default function RegionalTopbar({
  user: initialUser,
  onSettingsClick,
}) {
  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [fetchedUser, setFetchedUser] =
    useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatestProfile() {
      try {
        const res = await apiClient.get('/auth/me');

        if (isMounted && res?.data) {
          setFetchedUser(res.data);
        }
      } catch (err) {
        console.error(
          'Gagal memuat profil terkini topbar:',
          err
        );
      }
    }

    fetchLatestProfile();

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  const currentUser =
    fetchedUser ||
    initialUser ||
    {};

  const displayName =
    currentUser?.name?.trim() ||
    'Admin Regional';

  const firstName =
    displayName.split(' ')[0];

  const displayRole =
    currentUser?.role?.trim() ||
    'Admin Regional';

  const rawAvatar =
    currentUser?.avatar ||
    currentUser?.photoDataUrl ||
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

    formattedAvatar =
      `${baseURL}${rawAvatar}`;
  }

  const photoDataUrl =
    formattedAvatar;

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'AR';

  useEffect(() => {
    if (!isDropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, [isDropdownOpen]);

  return (
    <div
      className="
        sticky
        top-0
        z-10
        bg-[#f8f9fa]/85
        backdrop-blur-sm
        pl-20
        pr-4
        sm:pr-6
        lg:px-8
        pt-4
        pb-3
        font-['Inter']
        flex
        justify-end
      "
    >

      <div
        className="relative"
        ref={dropdownRef}
      >

        {/* USER BUTTON */}
        <button
          onClick={() =>
            setIsDropdownOpen(
              (v) => !v
            )
          }
          className="
            flex
            items-center
            gap-2.5
            pl-1.5
            pr-3
            py-1.5
            rounded-full
            bg-white
            border
            border-neutral-100
            shadow-sm
            hover:shadow
            transition
            cursor-pointer
          "
        >

          {/* AVATAR */}
          <div
            className="
              w-8
              h-8
              rounded-full
              bg-[#10367D]
              text-white
              flex
              items-center
              justify-center
              font-bold
              text-[10px]
              shrink-0
              overflow-hidden
              border
              border-[#74B4D9]
            "
          >
            {photoDataUrl ? (
              <img
                src={photoDataUrl}
                alt="Foto Profil"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            ) : (
              initials
            )}
          </div>

          {/* USER INFO */}
          <div
            className="
              hidden
              sm:block
              text-left
              leading-tight
              max-w-35
            "
          >
            <p
              className="
                text-[11px]
                font-bold
                text-neutral-800
                truncate
              "
            >
              {firstName}
            </p>

            <p
              className="
                text-[9px]
                text-neutral-400
                truncate
              "
            >
              {displayRole}
            </p>
          </div>

          {/* ARROW */}
          <ChevronDown
            size={14}
            className={`
              text-neutral-400
              shrink-0
              transition-transform
              ${
                isDropdownOpen
                  ? 'rotate-180'
                  : ''
              }
            `}
          />
        </button>

        {/* DROPDOWN */}
        {isDropdownOpen && (
          <div
            className="
              absolute
              right-0
              mt-2
              w-64
              max-w-[calc(100vw-2rem)]
              bg-white
              rounded-2xl
              shadow-xl
              border
              border-neutral-100
              overflow-hidden
              z-20
            "
          >

            {/* PROFILE HEADER */}
            <div
              className="
                p-4
                flex
                items-center
                gap-3
                border-b
                border-neutral-100
              "
            >

              {/* PROFILE AVATAR */}
              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-[#10367D]
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-[11px]
                  shrink-0
                  overflow-hidden
                  border
                  border-[#74B4D9]
                "
              >
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Foto Profil"
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                ) : (
                  initials
                )}
              </div>

              {/* PROFILE INFO */}
              <div className="min-w-0">

                <p
                  className="
                    text-[12px]
                    font-bold
                    text-neutral-800
                    truncate
                  "
                >
                  {displayName}
                </p>

                <p
                  className="
                    text-[10px]
                    text-neutral-400
                    truncate
                  "
                >
                  {currentUser?.email || '-'}
                </p>

              </div>
            </div>

            {/* MENU */}
            <div className="py-1.5">

              {/* PROFILE */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowProfileModal(true);
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-4
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-neutral-700
                  hover:bg-[#74B4D9]/15
                  transition
                  cursor-pointer
                  text-left
                "
              >
                <User
                  size={14}
                  className="
                    text-[#10367D]
                    shrink-0
                  "
                />

                Profil Saya
              </button>

              {/* SETTINGS */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);

                  if (onSettingsClick) {
                    onSettingsClick();
                  }
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-2.5
                  px-4
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-neutral-700
                  hover:bg-[#74B4D9]/15
                  transition
                  cursor-pointer
                  text-left
                "
              >
                <Settings
                  size={14}
                  className="
                    text-[#10367D]
                    shrink-0
                  "
                />

                Pengaturan Akun
              </button>

            </div>
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() =>
          setShowProfileModal(false)
        }
        user={currentUser}
        onSettingsClick={
          onSettingsClick
        }
      />
    </div>
  );
}