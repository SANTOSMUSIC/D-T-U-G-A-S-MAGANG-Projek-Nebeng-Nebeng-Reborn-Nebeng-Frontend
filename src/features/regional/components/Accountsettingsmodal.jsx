import { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Lock, Save, Loader2, Settings as SettingsIcon } from 'lucide-react';

const EMPTY_PASSWORD_FORM = { current: '', next: '', confirm: '' };

/**
 * AccountSettingsModal
 * Halaman "Pengaturan Akun" berisi dua bagian:
 * 1) Informasi Akun — edit nama, email, no. telepon (disimpan lewat
 *    onSaveProfile, dipetakan ke updateAdminProfile di AuthContext).
 * 2) Keamanan — ganti kata sandi (validasi sisi klien; pemanggilan API
 *    sesungguhnya lewat onChangePassword bila tersedia).
 */
export default function AccountSettingsModal({ isOpen, onClose, user, onSaveProfile, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('profil');

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('profil');
      setProfileForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      setProfileErrors({});
      setProfileSaved(false);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordErrors({});
      setPasswordSaved(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateProfile = () => {
    const next = {};
    if (!profileForm.name.trim()) next.name = 'Nama tidak boleh kosong.';
    if (!/^\S+@\S+\.\S+$/.test(profileForm.email)) next.email = 'Format email tidak valid.';
    if (!/^0[0-9]{8,14}$/.test(profileForm.phone.replace(/\s|-/g, ''))) {
      next.phone = 'Nomor telepon tidak valid (contoh: 081234567890).';
    }
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setIsSavingProfile(true);
    setProfileSaved(false);
    setTimeout(() => {
      onSaveProfile && onSaveProfile(profileForm);
      setIsSavingProfile(false);
      setProfileSaved(true);
    }, 500);
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordForm.current) next.current = 'Kata sandi saat ini wajib diisi.';
    if (passwordForm.next.length < 8) next.next = 'Kata sandi baru minimal 8 karakter.';
    if (passwordForm.confirm !== passwordForm.next) next.confirm = 'Konfirmasi kata sandi tidak cocok.';
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsSavingPassword(true);
    setPasswordSaved(false);
    setTimeout(() => {
      onChangePassword && onChangePassword(passwordForm);
      setIsSavingPassword(false);
      setPasswordSaved(true);
      setPasswordForm(EMPTY_PASSWORD_FORM);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl text-gray-900 font-['Inter'] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4B2172]/10 text-[#4B2172] flex items-center justify-center shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-neutral-800">Pengaturan Akun</h3>
              <p className="text-[9px] text-neutral-400">Kelola informasi & keamanan akun Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5 text-neutral-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-4 shrink-0">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'profil' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            Informasi Akun
          </button>
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'keamanan' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            Keamanan
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {activeTab === 'profil' ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {profileErrors.name && <p className="text-[8px] text-rose-600 font-semibold">{profileErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {profileErrors.email && <p className="text-[8px] text-rose-600 font-semibold">{profileErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3" /> No. Telepon
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {profileErrors.phone && <p className="text-[8px] text-rose-600 font-semibold">{profileErrors.phone}</p>}
              </div>

              {profileSaved && (
                <p className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Informasi akun berhasil diperbarui.
                </p>
              )}

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] hover:bg-[#3b195a] rounded-full cursor-pointer shadow-sm transition flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {passwordErrors.current && <p className="text-[8px] text-rose-600 font-semibold">{passwordErrors.current}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {passwordErrors.next && <p className="text-[8px] text-rose-600 font-semibold">{passwordErrors.next}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
                />
                {passwordErrors.confirm && <p className="text-[8px] text-rose-600 font-semibold">{passwordErrors.confirm}</p>}
              </div>

              {passwordSaved && (
                <p className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Kata sandi berhasil diperbarui.
                </p>
              )}

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] hover:bg-[#3b195a] rounded-full cursor-pointer shadow-sm transition flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSavingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {isSavingPassword ? 'Menyimpan...' : 'Ubah Kata Sandi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}