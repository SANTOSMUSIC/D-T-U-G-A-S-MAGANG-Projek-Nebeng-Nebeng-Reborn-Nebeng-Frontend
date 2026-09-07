import { useState } from 'react';
import { User, FileText, Upload, Camera, CheckCircle2, ShieldCheck, AlertCircle, FileCheck } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../context/AuthContext';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const SKCK_TYPES = [...IMAGE_TYPES, 'application/pdf'];
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

export default function MitraOnboarding() {
  const { mitraVerificationStatus, updateMitraProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    phone: '',
    address: '',
    vehicleType: 'Motor',
    plateNumber: '',
  });

  const [files, setFiles] = useState({
    sim: null,
    skck: null,
    stnk: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    sim: null,
    skck: null,
    stnk: null,
  });

  const [fileErrors, setFileErrors] = useState({ sim: '', skck: '', stnk: '' });

  const [faceScanned, setFaceScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const submitted = mitraVerificationStatus === 'pending' || mitraVerificationStatus === 'approved';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'nik' ? value.replace(/\D/g, '').slice(0, 16) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowedTypes = field === 'skck' ? SKCK_TYPES : IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      setFileErrors((prev) => ({ ...prev, [field]: 'Format file tidak didukung.' }));
      setFiles((prev) => ({ ...prev, [field]: null }));
      setPreviewUrls((prev) => ({ ...prev, [field]: null }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [field]: 'Ukuran file melebihi 2MB.' }));
      setFiles((prev) => ({ ...prev, [field]: null }));
      setPreviewUrls((prev) => ({ ...prev, [field]: null }));
      e.target.value = '';
      return;
    }

    setFileErrors((prev) => ({ ...prev, [field]: '' }));
    setFiles((prev) => ({ ...prev, [field]: file }));

    // Buat URL pratinjau jika tipe file berupa gambar
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({ ...prev, [field]: url }));
    } else {
      setPreviewUrls((prev) => ({ ...prev, [field]: 'pdf' }));
    }
  };

  const handleFaceScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setFaceScanned(true);
    }, 2000);
  };

  const missingDocuments = ['sim', 'skck', 'stnk'].filter((field) => !files[field]);
  const isNikValid = formData.nik.length === 16;
  const isPhoneValid = PHONE_REGEX.test(formData.phone.trim());

  const isTextInputsValid =
    formData.fullName.trim() !== '' &&
    formData.phone.trim() !== '' &&
    isPhoneValid &&
    formData.address.trim() !== '' &&
    formData.plateNumber.trim() !== '';

  const isFormComplete = faceScanned && missingDocuments.length === 0 && isNikValid && isTextInputsValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    updateMitraProfile({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      vehicleType: formData.vehicleType,
      plateNumber: formData.plateNumber.trim(),
      verificationStatus: 'pending',
    });
  };

  const renderUploadBox = (field, label, accept) => {
    const file = files[field];
    const preview = previewUrls[field];
    const error = fileErrors[field];

    return (
      <div className="flex flex-col items-center">
        <label
          className={`w-full p-4 rounded-xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center min-h-[160px] ${
            file
              ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
              : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-purple-50/30 hover:border-purple-300'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, field)}
            className="hidden"
          />

          {!file ? (
            <>
              <Upload className="w-6 h-6 text-[#4B2172] mb-1.5" />
              <p className="text-[10px] font-bold text-neutral-800 mb-0.5">{label}</p>
              <p className="text-[8px] text-neutral-400 mb-3">
                {field === 'skck' ? 'Format PDF/JPG (Maks 2MB)' : 'Format JPG/PNG (Maks 2MB)'}
              </p>
              <span className="px-3 py-1 bg-purple-50 text-[#4B2172] rounded-lg text-[8px] font-bold">
                Pilih Berkas
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 w-full">
              {/* Preview Gambar / PDF */}
              {preview === 'pdf' ? (
                <div className="w-24 h-24 rounded-lg bg-emerald-100/80 border border-emerald-300 flex flex-col items-center justify-center text-emerald-700 p-2">
                  <FileCheck className="w-8 h-8 mb-1" />
                  <span className="text-[7px] font-bold truncate max-w-full">{file.name}</span>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${label}`}
                    className="h-28 max-w-full object-cover rounded-lg border border-neutral-200 shadow-sm"
                  />
                </div>
              )}

              {/* Teks Status Berhasil Unggah */}
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-[9px] mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{label} berhasil diunggah</span>
              </div>
              <span className="text-[8px] text-neutral-400 underline font-medium">
                (Klik untuk mengganti)
              </span>
            </div>
          )}
        </label>

        {error && (
          <p className="text-[8px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> VERIFIKASI KEAMANAN MITRA
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Mitra Onboarding & Verification
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Lengkapi data diri, unggah dokumen legalitas, dan lakukan pemindaian Face ID untuk aktivasi akun.
          </p>
        </div>
        {submitted && (
          <StatusBadge variant={mitraVerificationStatus === 'approved' ? 'emerald' : 'amber'}>
            {mitraVerificationStatus === 'approved' ? 'Terverifikasi' : 'Menunggu Verifikasi Admin'}
          </StatusBadge>
        )}
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5 text-[10px]">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4B2172]" /> 1. Informasi Data Diri & Kendaraan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="cth: Budi Santoso"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nomor NIK KTP
                </label>
                <input
                  type="text"
                  name="nik"
                  required
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="3372xxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                {formData.nik.length > 0 && !isNikValid && (
                  <p className="text-[8px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> NIK harus 16 digit ({formData.nik.length}/16).
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="0812xxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
                {formData.phone.trim().length > 0 && !isPhoneValid && (
                  <p className="text-[8px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Format tidak valid. Gunakan cth: 0812xxxxxxxx.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Jenis Kendaraan
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                >
                  <option value="Motor">Sepeda Motor</option>
                  <option value="Mobil">Mobil / Minibus</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nomor Plat Kendaraan
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  required
                  placeholder="cth: AD 1234 XX"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Alamat Domisili
                </label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  placeholder="Masukkan alamat lengkap domisili saat ini..."
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172] resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 2. Unggah Dokumen Legalitas */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#4B2172]" /> 2. Unggah Dokumen Legalitas (SIM, SKCK, STNK)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderUploadBox('sim', 'Foto SIM C/A', 'image/*')}
              {renderUploadBox('skck', 'Foto SKCK Aktif', 'image/*,application/pdf')}
              {renderUploadBox('stnk', 'Foto STNK Kendaraan', 'image/*')}
            </div>
          </div>

          {/* 3. Face ID */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 text-center space-y-3">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-[#4B2172]" /> 3. Pendaftaran Data Face ID Scan
            </h2>
            <p className="text-[10px] text-neutral-400">
              Sistem memerlukan verifikasi wajah untuk keamanan dan validasi identitas.
            </p>

            <div className="max-w-xs mx-auto p-5 bg-neutral-900 rounded-2xl text-white flex flex-col items-center justify-center relative shadow-inner min-h-[180px]">
              {isScanning ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-400 animate-spin flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-[10px] font-bold text-purple-200">Memindai Wajah...</p>
                </div>
              ) : faceScanned ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-400">Face ID Berhasil Didaftarkan!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[9px] text-neutral-400 mb-3">Posisikan wajah Anda di depan kamera</p>
                  <button
                    type="button"
                    onClick={handleFaceScan}
                    className="px-3.5 py-1.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[9px] font-bold transition cursor-pointer"
                  >
                    Mulai Face ID Scan
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 pt-1">
            <button
              type="submit"
              disabled={!isFormComplete}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold transition shadow-sm ${
                isFormComplete
                  ? 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Kirim Data Onboarding & Verifikasi
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-[18px] font-bold text-neutral-800">
            {mitraVerificationStatus === 'approved'
              ? 'Akun Anda Sudah Terverifikasi!'
              : 'Pendaftaran Berhasil Dikirim!'}
          </h2>
          <p className="text-[10px] text-neutral-400 max-w-sm mx-auto">
            {mitraVerificationStatus === 'approved'
              ? 'Data dan dokumen Anda sudah disetujui oleh tim verifikasi regional. Anda sekarang bisa membuat trip baru.'
              : 'Dokumen dan data Face ID Anda sedang ditinjau oleh tim verifikasi regional. Akun Anda akan diaktifkan setelah proses validasi selesai.'}
          </p>
          {mitraVerificationStatus !== 'approved' && (
            <button
              onClick={() => updateMitraProfile({ verificationStatus: 'unverified' })}
              className="mt-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold rounded-xl transition cursor-pointer"
            >
              Ulangi / Edit Data
            </button>
          )}
        </div>
      )}
    </div>
  );
}