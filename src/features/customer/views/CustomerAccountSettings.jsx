import { useRef, useState } from 'react';
import { Settings, User, ShieldCheck, Eye, EyeOff, Pencil, Save, X, Phone, IdCard, Award, Ticket as TicketIcon, Camera } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTickets } from '../../../context/TicketsContext';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../../components/ui/StatCard';


const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB, konsisten dengan pola Mitra/Superadmin/Regional/Operator

const maskNik = (nik) => {
  if (!nik) return '-';
  if (nik.length <= 8) return 'x'.repeat(nik.length);
  return `${nik.slice(0, 4)}${'x'.repeat(nik.length - 8)}${nik.slice(-4)}`;
};

export default function CustomerAccountSettings() {
  const { customerProfile, isCustomerVerified, updateCustomerProfile } = useAuth();
  const { tickets: allTickets } = useTickets();
  const toast = useToast();

  const [showNik, setShowNik] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    fullName: customerProfile?.fullName || '',
    phone: customerProfile?.phone || ''
  });

  const [avatarPreview, setAvatarPreview] = useState(customerProfile?.photoDataUrl || null);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const isPhoneValid = PHONE_REGEX.test(draft.phone.trim());
  const isNameValid = draft.fullName.trim().length > 0;
  const canSave = isPhoneValid && isNameValid;

  const completedTrips = allTickets.filter(t => t.status === 'Selesai').length;
  const activeTrips = allTickets.filter(t => t.status === 'Aktif').length;

  const rewardPoints = customerProfile?.rewardPoints ?? 0;

  const startEditing = () => {
    setDraft({
      fullName: customerProfile?.fullName || '',
      phone: customerProfile?.phone || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    updateCustomerProfile({
      fullName: draft.fullName.trim(),
      phone: draft.phone.trim()
    });
    setIsEditing(false);
    toast.success('Profil Anda berhasil diperbarui.', { title: 'Tersimpan' });
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
      updateCustomerProfile({ photoDataUrl: reader.result });
      toast.success('Foto profil berhasil diperbarui.', { title: 'Foto Diperbarui' });
    };
    reader.onerror = () => {
      setAvatarError('Gagal membaca file foto. Coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const memberSince = customerProfile?.verifiedAt
    ? new Date(customerProfile.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Settings className="w-3 h-3" /> AKUN & IDENTITAS
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Pengaturan Akun
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Kelola data diri dan lihat status verifikasi akun Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          variant="primary"
          title="POIN REWARD"
          value={`${rewardPoints} Poin`}
          subtitle="Kumpulkan dari setiap trip"
          icon={Award}
        />
        <StatCard
          title="TRIP SELESAI"
          value={String(completedTrips)}
          subtitle="Perjalanan berhasil"
          icon={TicketIcon}
        />
        <StatCard
          title="TRIP AKTIF"
          value={String(activeTrips)}
          subtitle="Sedang berlangsung"
          icon={ShieldCheck}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Foto Profil" className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-50 shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4B2172] flex items-center justify-center shrink-0">
                  {customerProfile?.fullName?.trim() ? (
                    <span className="text-[16px] font-extrabold">{customerProfile.fullName.trim().charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-200 text-[#4B2172] flex items-center justify-center shadow-sm hover:bg-neutral-50 transition cursor-pointer"
                title="Ubah Foto Profil"
              >
                <Camera className="w-2.5 h-2.5" />
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
              <h2 className="text-[14px] font-bold text-neutral-800">{customerProfile?.fullName || '-'}</h2>
              <span className={`text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5 ${isCustomerVerified ? 'text-emerald-600' : 'text-neutral-400'}`}>
                <ShieldCheck size={11} />
                {isCustomerVerified ? 'Akun Terverifikasi' : 'Belum Terverifikasi'}
              </span>
              {avatarError && <p className="text-[8px] text-rose-600 font-bold mt-1">{avatarError}</p>}
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={startEditing}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[9px] font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[9px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-3.5 py-2 rounded-xl text-[9px] font-bold transition flex items-center gap-1.5 ${
                  canSave ? 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer shadow-sm' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 pt-4 space-y-3.5 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
            {isEditing ? (
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            ) : (
              <p className="px-3.5 py-2.5 bg-neutral-50 rounded-xl font-bold text-neutral-800 border border-transparent">{customerProfile?.fullName || '-'}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Nomor Induk Kependudukan (NIK)</label>
              <button
                type="button"
                onClick={() => setShowNik(!showNik)}
                className="text-[8px] text-[#4B2172] font-bold flex items-center gap-1 cursor-pointer"
              >
                {showNik ? <EyeOff size={11} /> : <Eye size={11} />}
                <span>{showNik ? 'Sembunyikan' : 'Tampilkan'}</span>
              </button>
            </div>
            <p className="px-3.5 py-2.5 bg-neutral-50 rounded-xl font-mono font-bold text-neutral-800 flex items-center gap-2">
              <IdCard className="w-3.5 h-3.5 text-neutral-400" />
              {showNik ? (customerProfile?.nik || '-') : maskNik(customerProfile?.nik)}
            </p>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp/HP</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/[^\d+]/g, '') })}
                  className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-bold text-neutral-800 focus:outline-none ${
                    draft.phone.trim() && !isPhoneValid ? 'border-rose-300 focus:border-rose-400' : 'border-neutral-200 focus:border-[#4B2172]'
                  }`}
                />
                {draft.phone.trim() && !isPhoneValid && (
                  <p className="text-[8px] text-rose-600 font-bold mt-1">Format nomor tidak valid. Contoh: 081234567890</p>
                )}
              </>
            ) : (
              <p className="px-3.5 py-2.5 bg-neutral-50 rounded-xl font-bold text-neutral-800 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                {customerProfile?.phone || '-'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Anggota Sejak</label>
            <p className="px-3.5 py-2.5 bg-neutral-50 rounded-xl font-bold text-neutral-600">{memberSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
}