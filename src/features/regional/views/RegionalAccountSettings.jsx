import { useState, useRef } from 'react';
import {
  Settings,
  User,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Bell,
  AlertTriangle,
  ShieldCheck,
  MonitorSmartphone,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import BaseModal from '../../../components/ui/BaseModal';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';

// FIX (samakan pola & fitur dengan Mitra): halaman penuh Pengaturan Akun
// Admin Regional di route /regional/profile/pengaturan. Sebelumnya hanya
// berisi Informasi Akun + ganti kata sandi (sisa dari AccountSettingsModal
// lama). Sekarang dilengkapi foto profil, 2FA, sesi login, preferensi
// notifikasi, dan zona berbahaya — mengikuti struktur & pola yang persis
// sama dengan MitraAccountSettings, hanya konten/istilah yang disesuaikan
// untuk konteks Admin Regional (mis. nonaktifasi akun ditinjau Superadmin,
// bukan Admin Regional).

const ROLE_LABELS = {
  regional_admin: 'Admin Regional',
  admin_regional: 'Admin Regional',
  operator_pos: 'Operator Pos',
};

function formatRoleLabel(role) {
  if (!role) return 'Admin Regional';
  if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  return role.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMPTY_PASSWORD_FORM = { current: '', next: '', confirm: '' };
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

const DEFAULT_NOTIF_PREFS = {
  verifikasiBaru: true,
  eskalasiTrip: true,
  laporanKeuangan: true,
  promoNews: false,
};

export default function RegionalAccountSettings() {
  const toast = useToast();
  const { session, role, adminProfile, updateAdminProfile, sessionPersisted } = useAuth();

  // Sumber kebenaran sama seperti di RegionalLayout: adminProfile (bisa
  // diedit) dengan fallback ke field bawaan sesi login. FIX: fallback
  // sebelumnya berupa data contoh yang terlihat asli ("Admin Regional
  // Surakarta", email & telepon spesifik) — kalau adminProfile/session
  // admin yang login belum punya field ini, form akan otomatis terisi
  // data itu seolah data asli, dan berisiko tersimpan permanen kalau
  // admin lain tidak sadar dan langsung klik "Simpan Perubahan". Sekarang
  // fallback-nya kosong/netral seperti pola Mitra & Superadmin.
  const savedProfile = {
    name: adminProfile?.name || session?.name || '',
    email: adminProfile?.email || session?.email || '',
    phone: adminProfile?.phone || session?.phone || '',
    region: adminProfile?.region || session?.region || 'Belum ditetapkan',
    photoDataUrl: adminProfile?.photoDataUrl || '',
  };

  const [profileForm, setProfileForm] = useState({
    name: savedProfile.name,
    email: savedProfile.email,
    phone: savedProfile.phone,
  });
  const [profileErrors, setProfileErrors] = useState({});

  // FIX: foto profil disimpan sebagai bagian dari adminProfile
  // (photoDataUrl, base64) lewat updateAdminProfile — persis pola yang
  // sama dengan foto profil Mitra — supaya bertahan sampai user
  // ganti/refresh. Dibatasi 2MB per foto.
  const [avatarPreview, setAvatarPreview] = useState(savedProfile.photoDataUrl || null);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });

  // FIX: sebelumnya notifPrefs & is2FAEnabled hanya di state lokal dan
  // hilang setiap kali halaman di-refresh (berbeda dari nama/email/foto
  // yang sudah dipersist lewat updateAdminProfile). Sekarang keduanya ikut
  // disimpan lewat updateAdminProfile supaya konsisten dan bertahan
  // sampai user mengubahnya lagi.
  const [notifPrefs, setNotifPrefs] = useState({ ...DEFAULT_NOTIF_PREFS, ...adminProfile?.notifPrefs });

  const [is2FAEnabled, setIs2FAEnabled] = useState(Boolean(adminProfile?.is2FAEnabled));
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLogoutSessionsModal, setShowLogoutSessionsModal] = useState(false);

  const validateProfile = () => {
    const next = {};
    if (!profileForm.name.trim()) next.name = 'Nama tidak boleh kosong.';
    if (!profileForm.email.trim()) {
      next.email = 'Email tidak boleh kosong.';
    } else if (!/^\S+@\S+\.\S+$/.test(profileForm.email)) {
      next.email = 'Format email tidak valid.';
    }
    if (!profileForm.phone.trim()) {
      next.phone = 'Nomor telepon tidak boleh kosong.';
    } else if (!/^0[0-9]{8,14}$/.test(profileForm.phone.replace(/\s|-/g, ''))) {
      next.phone = 'Nomor telepon tidak valid (contoh: 081234567890).';
    }
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    updateAdminProfile(profileForm);
    toast.success('Informasi akun berhasil diperbarui.', { title: 'Profil Diperbarui' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setAvatarError('Format foto harus JPG atau PNG.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setAvatarError('Ukuran foto maksimal 2MB.');
      e.target.value = '';
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      updateAdminProfile({ photoDataUrl: reader.result });
      toast.success('Foto profil berhasil diperbarui.', { title: 'Foto Diperbarui' });
    };
    reader.onerror = () => {
      setAvatarError('Gagal membaca file foto. Coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      toast.warning('Semua field kata sandi wajib diisi.', { title: 'Data Tidak Lengkap' });
      return;
    }
    if (passwordForm.next.length < 8) {
      toast.warning('Kata sandi baru minimal 8 karakter.', { title: 'Kata Sandi Terlalu Pendek' });
      return;
    }
    if (passwordForm.confirm !== passwordForm.next) {
      toast.warning('Konfirmasi kata sandi baru tidak cocok.', { title: 'Konfirmasi Tidak Cocok' });
      return;
    }

    setPasswordForm(EMPTY_PASSWORD_FORM);
    toast.success('Kata sandi berhasil diperbarui.', { title: 'Kata Sandi Diperbarui' });
  };

  const handleToggle2FA = (nextValue) => {
    if (nextValue) {
      setShow2FAModal(true);
      return;
    }
    setIs2FAEnabled(false);
    updateAdminProfile({ is2FAEnabled: false });
    toast.warning('Autentikasi Dua Faktor dinonaktifkan. Akun Anda kini hanya dilindungi kata sandi.', { title: '2FA Nonaktif' });
  };

  const handleConfirm2FA = () => {
    setIs2FAEnabled(true);
    updateAdminProfile({ is2FAEnabled: true });
    setShow2FAModal(false);
    toast.success('Autentikasi Dua Faktor berhasil diaktifkan untuk akun ini.', { title: '2FA Aktif' });
  };

  const handleToggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      updateAdminProfile({ notifPrefs: next });
      return next;
    });
  };

  const handleLogoutOtherSessions = () => {
    setShowLogoutSessionsModal(false);
    toast.success('Semua sesi lain berhasil dikeluarkan dari akun Anda.', { title: 'Sesi Dikeluarkan' });
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    toast.error('Permintaan nonaktifasi akun telah dikirim ke tim Superadmin untuk ditinjau.', { title: 'Permintaan Terkirim' });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Settings className="w-3 h-3" /> AKUN & KEAMANAN
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Pengaturan Akun</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Ubah foto & informasi akun, keamanan login, preferensi notifikasi, dan sesi aktif {formatRoleLabel(role)} Anda.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Informasi Akun */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#4B2172]" /> Informasi Akun
          </h3>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Foto Profil" className="w-16 h-16 rounded-full object-cover border-4 border-purple-50 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#4B2172] text-white flex items-center justify-center text-[20px] font-extrabold shadow-sm">
                  {savedProfile.name.trim().charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-neutral-200 text-[#4B2172] flex items-center justify-center shadow-sm hover:bg-neutral-50 transition cursor-pointer"
                title="Ubah Foto Profil"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-700">Foto Profil</p>
              <p className="text-[8px] text-neutral-400">JPG atau PNG, maksimal 2MB.</p>
              {avatarError && <p className="text-[8px] text-rose-600 font-bold mt-0.5">{avatarError}</p>}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-[10px] pt-1 border-t border-neutral-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                {profileErrors.name && <p className="text-[8px] text-rose-600 font-bold mt-1">{profileErrors.name}</p>}
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> No. Telepon
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 font-mono focus:outline-none focus:border-[#4B2172]"
                />
                {profileErrors.phone && <p className="text-[8px] text-rose-600 font-bold mt-1">{profileErrors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                {profileErrors.email && <p className="text-[8px] text-rose-600 font-bold mt-1">{profileErrors.email}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Keamanan Akun */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-5">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#4B2172]" /> Keamanan Akun
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3 text-[10px]">
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Ubah Kata Sandi</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kata Sandi Saat Ini</label>
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-9 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute right-2.5 bottom-2.5 text-neutral-400 cursor-pointer"
                >
                  {showPassword.current ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kata Sandi Baru</label>
                <input
                  type={showPassword.next ? 'text' : 'password'}
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-9 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, next: !prev.next }))}
                  className="absolute right-2.5 bottom-2.5 text-neutral-400 cursor-pointer"
                >
                  {showPassword.next ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Konfirmasi Kata Sandi</label>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-9 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-2.5 bottom-2.5 text-neutral-400 cursor-pointer"
                >
                  {showPassword.confirm ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <p className="text-[8px] text-neutral-400">Minimal 8 karakter, kombinasi huruf dan angka disarankan.</p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-purple-50 text-[#4B2172] rounded-xl shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-800">Autentikasi Dua Faktor (2FA)</p>
                <p className="text-[8px] text-neutral-400 max-w-xs">Tambahan lapisan keamanan berupa kode OTP setiap kali login dari perangkat baru.</p>
              </div>
            </div>
            <ToggleSwitch checked={is2FAEnabled} onChange={handleToggle2FA} />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-neutral-100 text-neutral-600 rounded-xl shrink-0">
                <MonitorSmartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-800">Sesi Login Saat Ini</p>
                <p className="text-[8px] text-neutral-400">
                  {sessionPersisted
                    ? 'Sesi diingat di perangkat ini ("Ingat Saya" aktif).'
                    : 'Sesi sementara — akan berakhir saat tab ditutup.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutSessionsModal(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-bold transition cursor-pointer shrink-0"
            >
              Keluar dari Perangkat Lain
            </button>
          </div>
        </div>

        {/* Preferensi Notifikasi */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#4B2172]" /> Preferensi Notifikasi
          </h3>
          <div className="space-y-2.5">
            {[
              { key: 'verifikasiBaru', label: 'Verifikasi Pos Mitra & Kurir Baru', desc: 'Notifikasi saat ada pengajuan verifikasi baru menunggu tinjauan Anda.' },
              { key: 'eskalasiTrip', label: 'Eskalasi Trip & Order', desc: 'Notifikasi saat ada trip bermasalah atau dibatalkan di wilayah Anda.' },
              { key: 'laporanKeuangan', label: 'Laporan Keuangan Wilayah', desc: 'Notifikasi ringkasan laporan keuangan mingguan wilayah tugas Anda.' },
              { key: 'promoNews', label: 'Info & Pengumuman Platform', desc: 'Info kebijakan, pembaruan sistem, dan pengumuman dari Superadmin.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-neutral-800">{item.label}</p>
                  <p className="text-[8px] text-neutral-400">{item.desc}</p>
                </div>
                <ToggleSwitch checked={notifPrefs[item.key]} onChange={() => handleToggleNotif(item.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Zona Berbahaya */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-5 sm:p-6 space-y-3">
          <h3 className="text-[14px] font-bold text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Zona Berbahaya
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-neutral-800">Nonaktifkan Akun Admin Regional</p>
              <p className="text-[8px] text-neutral-400 max-w-md">
                Akses ke panel Admin Regional akan disembunyikan sampai diaktifkan kembali oleh Superadmin. Pastikan tidak ada verifikasi atau trip yang sedang perlu ditindaklanjuti.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-bold transition shadow-sm cursor-pointer shrink-0"
            >
              Ajukan Nonaktifasi
            </button>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Aktifkan Autentikasi Dua Faktor"
        subtitle="Keamanan Tambahan Akun"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">
            Kode OTP akan dikirim ke nomor telepon terdaftar ({savedProfile.phone || 'nomor belum diatur'}) setiap kali login dari perangkat baru.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShow2FAModal(false)}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm2FA}
              className="flex-1 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Aktifkan
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={showLogoutSessionsModal}
        onClose={() => setShowLogoutSessionsModal(false)}
        title="Keluar dari Semua Perangkat Lain?"
        subtitle="Keamanan Sesi"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">Semua sesi aktif selain perangkat ini akan dipaksa logout. Anda perlu login ulang di perangkat tersebut.</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowLogoutSessionsModal(false)}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleLogoutOtherSessions}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Ya, Keluarkan
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Ajukan Nonaktifasi Akun?"
        subtitle="Tindakan Ini Memerlukan Persetujuan Superadmin"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">Verifikasi atau trip yang masih perlu ditindaklanjuti di wilayah Anda sebaiknya dialihkan terlebih dahulu. Pengajuan akan ditinjau oleh Superadmin dalam 1x24 jam.</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDeactivateAccount}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              Ya, Ajukan
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}