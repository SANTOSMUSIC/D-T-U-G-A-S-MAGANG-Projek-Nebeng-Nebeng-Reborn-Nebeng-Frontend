import React, { useState } from 'react';
import { UserCheck, Upload, Camera, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

export default function BiometricOnboarding() {
  const [step, setStep] = useState(1); // 1: Data Diri, 2: Upload KTP, 3: Face ID
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    phone: ''
  });
  const [ktpPreview, setKtpPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleKtpUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKtpPreview(URL.createObjectURL(file));
    }
  };

  const startFaceScan = () => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Keamanan & Verifikasi
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Biometric Onboarding & Face ID</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Lakukan verifikasi identitas resmi untuk mengaktifkan seluruh fitur transaksi aman dan escrow di aplikasi.</p>
        </div>
      </div>

      {/* Indikator Langkah (Stepper) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className={`p-4 rounded-2xl border transition ${step >= 1 ? 'border-pink-500 bg-pink-50/50 text-pink-700' : 'border-neutral-200 bg-white text-neutral-500'}`}>
          <span className="text-[10px] font-extrabold uppercase">Langkah 1</span>
          <p className="text-xs font-bold">Data Diri & NIK</p>
        </div>
        <div className={`p-4 rounded-2xl border transition ${step >= 2 ? 'border-pink-500 bg-pink-50/50 text-pink-700' : 'border-neutral-200 bg-white text-neutral-500'}`}>
          <span className="text-[10px] font-extrabold uppercase">Langkah 2</span>
          <p className="text-xs font-bold">Upload Foto KTP</p>
        </div>
        <div className={`p-4 rounded-2xl border transition ${step >= 3 ? 'border-pink-500 bg-pink-50/50 text-pink-700' : 'border-neutral-200 bg-white text-neutral-500'}`}>
          <span className="text-[10px] font-extrabold uppercase">Langkah 3</span>
          <p className="text-xs font-bold">Pemindaian Face ID</p>
        </div>
      </div>

      {/* Konten Utama Onboarding */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 max-w-2xl mx-auto">
        
        {/* Step 1: Input Data Diri */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-neutral-900 mb-2">1. Masukkan Informasi Identitas</h2>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
              <input 
                type="text" 
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
              <input 
                type="text" 
                placeholder="3372xxxxxxxxxxxx"
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
              />
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.fullName.trim() || !formData.nik.trim()}
              className={`w-full mt-4 py-3.5 rounded-2xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                !formData.fullName.trim() || !formData.nik.trim()
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                  : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-900/20 cursor-pointer'
              }`}
            >
              <span>Lanjut ke Upload KTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Upload KTP */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-neutral-900 mb-2">2. Unggah Foto KTP Asli</h2>
            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center bg-neutral-50 flex flex-col items-center justify-center">
              {ktpPreview ? (
                <div className="space-y-3">
                  <img src={ktpPreview} alt="Preview KTP" className="w-64 h-40 object-cover rounded-xl shadow-sm border border-neutral-200 mx-auto" />
                  <p className="text-[10px] text-emerald-600 font-bold">KTP berhasil diunggah</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-neutral-700">Klik untuk upload atau pilih file foto KTP</p>
                  <p className="text-[10px] text-neutral-500">Format: JPG, PNG (Maks. 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleKtpUpload} className="mt-4 text-xs cursor-pointer" />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setStep(1)} 
                className="w-1/3 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Kembali
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!ktpPreview}
                className={`w-2/3 py-3.5 rounded-2xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                  !ktpPreview
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                    : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-900/20 cursor-pointer'
                }`}
              >
                <span>Lanjut ke Face ID</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pemindaian Face ID (Liveness Detection) */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-extrabold text-neutral-900 mb-1">3. Pemindaian Face ID & Liveness</h2>
            <p className="text-neutral-500 text-xs mb-4">Posisikan wajah Anda di dalam bingkai lingkaran untuk pengenalan biometrik otomatis.</p>
            
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-pink-500 mx-auto flex items-center justify-center relative bg-neutral-900 overflow-hidden shadow-inner">
              {isScanning ? (
                <div className="absolute inset-0 bg-pink-500/20 flex flex-col items-center justify-center animate-pulse">
                  <RefreshCw className="w-10 h-10 text-white animate-spin mb-2" />
                  <span className="text-[10px] text-white font-extrabold">Memindai Liveness...</span>
                </div>
              ) : scanSuccess ? (
                <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white">
                  <CheckCircle2 className="w-12 h-12 mb-1 text-white" />
                  <span className="text-xs font-extrabold">Terverifikasi!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-neutral-500">
                  <Camera className="w-12 h-12 mb-2 text-pink-400" />
                  <span className="text-[10px]">Kamera Siap</span>
                </div>
              )}
            </div>

            {!scanSuccess ? (
              <button 
                onClick={startFaceScan}
                disabled={isScanning}
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-900/20 cursor-pointer mt-4"
              >
                {isScanning ? 'Sedang Memindai Wajah...' : 'Mulai Scan Face ID'}
              </button>
            ) : (
              <div className="space-y-3 mt-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Onboarding Biometrik Sukses & Akun Aktif!
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Selesai & Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}