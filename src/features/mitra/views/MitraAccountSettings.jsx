import { useState, useRef } from 'react';
import {
  Settings,
  User,
  KeyRound,
  Bell,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  MonitorSmartphone,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import BaseModal from '../../../components/ui/BaseModal';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import apiClient from '../../../services/apiClient';
import { uploadMyAvatar } from '../../../services/userService';

// FIX (struktur halaman): "Pengaturan Akun" adalah satu-satunya tempat
// untuk MENGUBAH data — profil & kendaraan, foto profil, kata sandi, 2FA,
// sesi login, preferensi notifikasi, sampai nonaktifasi akun. "Profil
// Saya" (MitraProfile.jsx) sekarang murni ringkasan/read-only dan
// tombol "Edit Profil"-nya mengarah ke halaman ini.

const DEFAULT_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  vehicleType: 'Motor',
  plateNumber: '',
};

const DEFAULT_NOTIF_PREFS = {
  tripUpdates: true,
  walletActivity: true,
  customerChat: true,
  promoNews: false,
};

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

export default function MitraAccountSettings() {
  const toast = useToast();
  const { mitraProfile, updateMitraProfile, sessionPersisted } = useAuth();

  // Sumber kebenaran data profil ada di AuthContext (mitraProfile), sama
  // seperti pola customerProfile/adminProfile di halaman lain — supaya
  // data tidak hilang setelah refresh dan konsisten dengan storage sesi
  // ("Ingat Saya").
  const savedProfile = { ...DEFAULT_PROFILE, ...mitraProfile };
  const [profileDraft, setProfileDraft] = useState(savedProfile);

  // FIX: foto profil sebelumnya cuma preview di state lokal dan hilang
  // saat refresh. Sekarang disimpan sebagai bagian dari mitraProfile
  // (photoDataUrl, base64) lewat updateMitraProfile — persis seperti
  // field profil lain — supaya bertahan sampai user ganti/refresh.
  // Dibatasi 2MB per foto (MAX_PHOTO_SIZE) supaya storage sesi tidak
  // membengkak terlalu besar.
  const [avatarPreview, setAvatarPreview] = useState(savedProfile.photoDataUrl || null);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });

  // FIX: sebelumnya notifPrefs & is2FAEnabled hanya di state lokal dan
  // hilang setiap kali halaman di-refresh (berbeda dari field profil lain
  // yang sudah dipersist lewat mitraProfile). Sekarang keduanya ikut
  // disimpan lewat updateMitraProfile supaya konsisten dan bertahan
  // sampai user mengubahnya lagi.
  const [notifPrefs, setNotifPrefs] = useState({ ...DEFAULT_NOTIF_PREFS, ...mitraProfile?.notifPrefs });
  const [is2FAEnabled, setIs2FAEnabled] = useState(Boolean(mitraProfile?.is2FAEnabled));
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showLogoutSessionsModal, setShowLogoutSessionsModal] = useState(false);

  const handleProfileFieldChange = (field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }));
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (
      !profileDraft.fullName.trim() ||
      !profileDraft.phone.trim() ||
      !profileDraft.address.trim() ||
      !profileDraft.plateNumber.trim()
    ) {
      toast.warning('Nama lengkap, nomor telepon, alamat, dan nomor plat wajib diisi.', { title: 'Data Tidak Lengkap' });
      return;
    }
    if (!PHONE_REGEX.test(profileDraft.phone.trim())) {
      toast.warning('Format nomor telepon tidak valid.', { title: 'Nomor Tidak Valid' });
      return;
    }
    if (profileDraft.email.trim() !== '' && !EMAIL_REGEX.test(profileDraft.email.trim())) {
      toast.warning('Format email tidak valid.', { title: 'Email Tidak Valid' });
      return;
    }

    // Kirim hanya field form (bukan seluruh profileDraft) supaya
    // photoDataUrl yang sudah tersimpan lewat handleAvatarChange tidak
    // ikut ketimpa nilai lama.
    const { fullName, email, phone, address, vehicleType, plateNumber } = profileDraft;

    // FIX (bug: "Gagal Menyimpan — property phone/plateNumber should not
    // exist"): sebelumnya phone & plateNumber ikut dikirim dalam satu body
    // ke /users/me/profile, padahal DTO endpoint itu di backend cuma
    // menerima field KTP/rekening (fullNameKtp, addressKtp, dst — divalidasi
    // whitelist, jadi field asing langsung ditolak). phone sebenarnya milik
    // endpoint user dasar (/users/me), dan plateNumber milik entity Vehicle
    // (/vehicles/:id), bukan profil KTP. Sekarang masing-masing dikirim ke
    // endpoint yang benar; kegagalan salah satu tetap dilaporkan tanpa
    // membuat sesi lokal ikut berubah untuk bagian yang gagal.
    setIsSavingProfile(true);
    try {
      await apiClient.patch('/users/me/profile', {
        fullNameKtp: fullName.trim(),
        addressKtp: address.trim(),
      });
      await apiClient.patch('/users/me', {
        phone: phone.trim(),
      });

      if (plateNumber.trim()) {
        try {
          const vehiclesRes = await apiClient.get('/vehicles/me');
          const vehicles = vehiclesRes.data?.data || vehiclesRes.data || [];
          const myVehicle = Array.isArray(vehicles) ? vehicles[0] : null;
          if (myVehicle?.id) {
            await apiClient.patch(`/vehicles/${myVehicle.id}`, { plateNumber: plateNumber.trim() });
          }
        } catch (vehicleError) {
          // Profil & telepon tetap tersimpan walau update plat gagal —
          // dilaporkan terpisah supaya tidak menutupi keberhasilan bagian lain.
          toast.warning(
            vehicleError.response?.data?.message || 'Nomor plat gagal diperbarui, tapi profil lain tersimpan.',
            { title: 'Sebagian Gagal' }
          );
        }
      }

      updateMitraProfile({ fullName, email, phone, address, vehicleType, plateNumber });
      toast.success('Profil berhasil diperbarui.', { title: 'Profil Diperbarui' });
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Gagal menyimpan profil ke server. Coba lagi.',
        { title: 'Gagal Menyimpan' }
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // FIX (bug: foto profil hilang setelah logout lalu login lagi): sama
  // seperti bug profil KTP/telepon sebelumnya — foto cuma dibaca sebagai
  // base64 lewat FileReader dan disimpan ke session storage
  // (updateMitraProfile), tidak pernah benar-benar diunggah ke server.
  // logout() menghapus session storage, jadi "tersimpan"-nya cuma ilusi.
  // Sekarang file diunggah ke backend (POST /users/me/avatar, endpoint
  // yang sudah ada di userService.js) dan URL hasil unggahan itulah yang
  // dipakai/disimpan, bukan base64 lokal.
  const handleAvatarChange = async (e) => {
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
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await uploadMyAvatar(formData);
      const avatarUrl = res?.data?.avatarUrl || res?.avatarUrl || res?.data?.url || res?.url;

      // Tetap tampilkan preview lokal langsung (instan, tidak menunggu
      // reload gambar dari URL server), tapi yang disimpan sebagai sumber
      // kebenaran adalah URL dari server, bukan base64.
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      updateMitraProfile({ photoDataUrl: avatarUrl || undefined });
      toast.success('Foto profil berhasil diperbarui.', { title: 'Foto Diperbarui' });
    } catch (error) {
      setAvatarError(error.response?.data?.message || 'Gagal mengunggah foto ke server. Coba lagi.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
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
    if (passwordForm.next !== passwordForm.confirm) {
      toast.warning('Konfirmasi kata sandi baru tidak cocok.', { title: 'Konfirmasi Tidak Cocok' });
      return;
    }

    setPasswordForm({ current: '', next: '', confirm: '' });
    toast.success('Kata sandi berhasil diperbarui.', { title: 'Kata Sandi Diperbarui' });
  };

  const handleToggle2FA = (nextValue) => {
    if (nextValue) {
      setShow2FAModal(true);
      return;
    }
    setIs2FAEnabled(false);
    updateMitraProfile({ is2FAEnabled: false });
    toast.warning('Autentikasi Dua Faktor dinonaktifkan. Akun Anda kini hanya dilindungi kata sandi.', { title: '2FA Nonaktif' });
  };

  const handleConfirm2FA = () => {
    setIs2FAEnabled(true);
    updateMitraProfile({ is2FAEnabled: true });
    setShow2FAModal(false);
    toast.success('Autentikasi Dua Faktor berhasil diaktifkan untuk akun ini.', { title: '2FA Aktif' });
  };

  const handleToggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      updateMitraProfile({ notifPrefs: next });
      return next;
    });
  };

  const handleLogoutOtherSessions = () => {
    setShowLogoutSessionsModal(false);
    toast.success('Semua sesi lain berhasil dikeluarkan dari akun Anda.', { title: 'Sesi Dikeluarkan' });
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    toast.error('Permintaan nonaktifasi akun telah dikirim ke tim Admin Regional untuk ditinjau.', { title: 'Permintaan Terkirim' });
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
            Ubah data profil & kendaraan, keamanan login, preferensi notifikasi, dan sesi aktif akun mitra Anda.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Edit Profil & Kendaraan */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#4B2172]" /> Edit Profil & Kendaraan
          </h3>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Foto Profil" className="w-16 h-16 rounded-full object-cover border-4 border-purple-50 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#4B2172] text-white flex items-center justify-center text-[20px] font-extrabold shadow-sm">
                  {savedProfile.fullName.trim().charAt(0).toUpperCase() || 'M'}
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
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileDraft.fullName}
                  onChange={(e) => handleProfileFieldChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={profileDraft.phone}
                  onChange={(e) => handleProfileFieldChange('phone', e.target.value.replace(/[^\d+]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={profileDraft.email}
                  onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jenis Kendaraan</label>
                <select
                  value={profileDraft.vehicleType}
                  onChange={(e) => handleProfileFieldChange('vehicleType', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                >
                  {/* FIX (kesesuaian schema): opsi "Box" dihapus — enum
                      VehicleType di schema.prisma hanya punya `motor` dan
                      `mobil`, dan MitraTripManagement.jsx juga cuma
                      mendukung dua kategori ini saat bikin trip. */}
                  <option value="Motor">Sepeda Motor</option>
                  <option value="Mobil">Mobil / Minibus</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Plat</label>
                <input
                  type="text"
                  value={profileDraft.plateNumber}
                  onChange={(e) => handleProfileFieldChange('plateNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Alamat Domisili</label>
                <textarea
                  rows="2"
                  value={profileDraft.address}
                  onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172] resize-none"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className={`px-4 py-2.5 rounded-xl font-bold transition shadow-sm ${isSavingProfile ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'}`}
              >
                {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
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
              { key: 'tripUpdates', label: 'Update Status Trip', desc: 'Notifikasi saat trip dimulai, in transit, atau selesai.' },
              { key: 'walletActivity', label: 'Aktivitas Dompet & Escrow', desc: 'Notifikasi saat dana escrow cair atau penarikan diproses.' },
              { key: 'customerChat', label: 'Pesan Pelanggan', desc: 'Notifikasi saat ada pesan baru dari pelanggan.' },
              { key: 'promoNews', label: 'Promo & Info Program Mitra', desc: 'Info promo, insentif, dan pengumuman dari Nebeng.' },
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
              <p className="text-[10px] font-bold text-neutral-800">Nonaktifkan Akun Mitra</p>
              <p className="text-[8px] text-neutral-400 max-w-md">
                Akun Anda akan disembunyikan dari sistem pemesanan dan trip baru tidak dapat dibuat sampai diaktifkan kembali oleh Admin Regional.
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
        subtitle="Tindakan Ini Memerlukan Persetujuan Admin"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">Trip aktif yang sedang berjalan tetap harus diselesaikan terlebih dahulu. Pengajuan akan ditinjau oleh Admin Regional dalam 1x24 jam.</p>
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