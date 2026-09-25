import { useEffect, useState } from 'react';

import { BASE_URL } from '../../../config/env';
import apiClient from '../../../services/apiClient';
import logoAsset from '../../../assets/logo.png';



export default function CustomerTopbar({ profile, onProfileClick }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (isMounted && response.data) {
          setUserData(response.data);
        }
      } catch { /* ignore */ }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const displayName = userData?.name || profile?.fullName || 'Customer';
  const firstName = displayName.split(' ')[0];

  const rawPhoto =
    userData?.avatar ||
    userData?.photoDataUrl ||
    profile?.avatar ||
    profile?.photoDataUrl ||
    '';

  const getFullFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const baseURL = apiClient.defaults.baseURL
      ? apiClient.defaults.baseURL.replace('/api', '')
      : BASE_URL; // Fallback if no BASE_URL imported
    return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const photoUrl = getFullFileUrl(rawPhoto);

  return (
    <div className="bg-white text-[#10367D] pl-4 pr-4 sm:pr-6 lg:px-8 pt-4 pb-4 flex items-center justify-between sticky top-0 z-10 font-['Inter'] shadow-sm">
      <div className="flex items-center gap-2.5 lg:hidden">
        <img
          src={logoAsset}
          alt="Logo Nebeng"
          className="h-8 w-8 object-contain shrink-0"
        />
        <span className="font-bold text-[20px] tracking-wide leading-none">
          Nebeng
        </span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button 
          onClick={onProfileClick}
          className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-[#10367D] flex items-center justify-center text-white hover:bg-[#0C2C66] transition font-bold text-[14px] cursor-pointer overflow-hidden"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            firstName.charAt(0).toUpperCase()
          )}
        </button>
      </div>
    </div>
  );
}



