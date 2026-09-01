import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, User, Settings, X, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

function getInitials(name) {
  if (!name) return 'OP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'OP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Topbar khusus area Operator Pos.
 *
 * Label role & nama SELALU diambil dari data sesi (useAuth -> adminProfile),
 * bukan teks tetap, supaya tidak salah menampilkan identitas role lain.
 */
export default function OperatorTopbar() {
  const { adminProfile, updateAdminProfile } = useAuth();
  const toast = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: adminProfile?.fullName || '',
    phone: adminProfile?.phone || '',
    email: adminProfile?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotif: true,
    pushNotif: true,
  });

  const dropdownRef = useRef(null);

  const hasCustomName = Boolean(adminProfile?.fullName);
  const displayName = hasCustomName ? adminProfile.fullName : 'Operator Pos';
  // FIX: dulu baris kedua selalu menulis "Operator Pos" juga, jadi kalau
  // belum ada nama profil, tampilannya "Operator Pos" dobel dua baris.
  // Sekarang baris kedua cuma tampil kalau baris pertama sudah beda (nama asli).
  const roleLine = hasCustomName ? 'Operator Pos' : 'Online';
  const initials = getInitials(adminProfile?.fullName);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openEditProfile = () => {
    setProfileForm({
      fullName: adminProfile?.fullName || '',
      phone: adminProfile?.phone || '',
      email: adminProfile?.email || '',
    });
    setIsEditOpen(true);
    setIsDropdownOpen(false);
  };

  const openAccountSettings = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSettingsOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateAdminProfile(profileForm);
    setIsEditOpen(false);
    toast.success('Profil berhasil diperbarui.', { title: 'Profil Tersimpan' });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('Semua kolom kata sandi wajib diisi!', { title: 'Data Belum Lengkap' });
      return;
    }
    if (newPassword.length < 8) {
      toast.warning('Kata sandi baru minimal 8 karakter!', { title: 'Kata Sandi Terlalu Pendek' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok!', { title: 'Kata Sandi Tidak Sama' });
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Kata sandi berhasil diperbarui.', { title: 'Pengaturan Tersimpan' });
  };

  return (
    <header className="sticky top-0 z-20 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_12px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-end font-['Inter']">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((v) => !v)}
          aria-label="Menu profil"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/70 transition cursor-pointer"
        >
          <span className="relative shrink-0">
            <span className="w-8 h-8 rounded-full bg-[#4B2172] text-white text-[11px] font-bold flex items-center justify-center">
              {initials}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#f8f9fa]" />
          </span>
          <span className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-[11px] font-bold text-neutral-800">{displayName}</span>
            <span className="text-[9px] text-neutral-400 font-medium">{roleLine}</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-neutral-100 py-2 z-30">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-neutral-100">
              <span className="w-9 h-9 rounded-full bg-[#4B2172] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-800 truncate">{displayName}</p>
                <p className="text-[9px] text-neutral-400 truncate">{adminProfile?.email || 'Belum ada email'}</p>
              </div>
            </div>
            <button
              onClick={openEditProfile}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /> Profil Saya
            </button>
            <button
              onClick={openAccountSettings}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" /> Pengaturan Akun
            </button>
          </div>
        )}
      </div>

      {isEditOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-gray-900 font-['Inter']">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-neutral-800">Profil Saya</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                aria-label="Tutup"
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-[10px]">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Nama operator"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="nama@nebeng.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer mt-1"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isSettingsOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-gray-900 font-['Inter']">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-neutral-800">Pengaturan Akun</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Tutup"
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Notifikasi</p>
              <div className="flex items-center justify-between py-1">
                <span className="text-[10px] font-semibold text-neutral-700">Notifikasi Email</span>
                <button
                  type="button"
                  onClick={() => setNotifPrefs((p) => ({ ...p, emailNotif: !p.emailNotif }))}
                  aria-pressed={notifPrefs.emailNotif}
                  className={`shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 relative cursor-pointer ${notifPrefs.emailNotif ? 'bg-[#4B2172]' : 'bg-neutral-200'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${notifPrefs.emailNotif ? 'translate-x-[18px]' : 'translate-x-0'}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[10px] font-semibold text-neutral-700">Notifikasi Push</span>
                <button
                  type="button"
                  onClick={() => setNotifPrefs((p) => ({ ...p, pushNotif: !p.pushNotif }))}
                  aria-pressed={notifPrefs.pushNotif}
                  className={`shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 relative cursor-pointer ${notifPrefs.pushNotif ? 'bg-[#4B2172]' : 'bg-neutral-200'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${notifPrefs.pushNotif ? 'translate-x-[18px]' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3 text-[10px] pt-4 mt-1 border-t border-neutral-100">
              <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Ganti Kata Sandi</p>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] text-[10px]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer mt-1"
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}