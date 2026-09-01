import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function BiometricOnboarding() {
  const navigate = useNavigate();
  const { markCustomerVerified } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    phone: ''
  });
  const [showNikPii, setShowNikPii] = useState(false);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleKtpUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKtpPreview((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(file);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (ktpPreview) URL.revokeObjectURL(ktpPreview);
    };
  }, [ktpPreview]);

  const startFaceScan = () => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> KEAMANAN & VERIFIKASI BIOMETRIK
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Biometric Onboarding & Face ID
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Lakukan verifikasi identitas resmi untuk mengaktifkan seluruh fitur transaksi aman dan escrow di aplikasi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3.5 rounded-2xl border transition ${step >= 1 ? 'border-[#4B2172] bg-purple-50/50 text-[#4B2172]' : 'border-neutral-200 bg-white text-neutral-400'}`}>
          <span className="text-[8px] font-bold uppercase tracking-wider block">Langkah 1</span>
          <p className="text-[10px] font-bold">Data Diri & NIK</p>
        </div>
        <div className={`p-3.5 rounded-2xl border transition ${step >= 2 ? 'border-[#4B2172] bg-purple-50/50 text-[#4B2172]' : 'border-neutral-200 bg-white text-neutral-400'}`}>
          <span className="text-[8px] font-bold uppercase tracking-wider block">Langkah 2</span>
          <p className="text-[10px] font-bold">Upload Foto KTP</p>
        </div>
        <div className={`p-3.5 rounded-2xl border transition ${step >= 3 ? 'border-[#4B2172] bg-purple-50/50 text-[#4B2172]' : 'border-neutral-200 bg-white text-neutral-400'}`}>
          <span className="text-[8px] font-bold uppercase tracking-wider block">Langkah 3</span>
          <p className="text-[10px] font-bold">Pemindaian Face ID</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 max-w-xl mx-auto space-y-4">
        {step === 1 && (
          <div className="space-y-3.5 text-[10px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-neutral-800">1. Masukkan Informasi Identitas</h2>
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} /> Enkripsi AES-256
              </span>
            </div>
            
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap (Sesuai KTP)</label>
              <input 
                type="text" 
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Nomor Induk Kependudukan (NIK)</label>
                <button
                  type="button"
                  onClick={() => setShowNikPii(!showNikPii)}
                  className="text-[8px] text-[#4B2172] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showNikPii ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showNikPii ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
              </div>
              <input 
                type={showNikPii ? "text" : "password"} 
                inputMode="numeric"
                maxLength={16}
                placeholder="3372xxxxxxxxxxxx"
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172] tracking-wider"
              />
            </div>
            
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp/HP</label>
              <input 
                type="text" 
                placeholder="0812xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.fullName.trim() || formData.nik.length !== 16 || !formData.phone.trim()}
              className={`w-full py-3 rounded-xl text-[10px] font-bold transition shadow-sm flex items-center justify-center gap-1.5 ${
                !formData.fullName.trim() || formData.nik.length !== 16 || !formData.phone.trim()
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
              }`}
            >
              <span>Lanjut ke Upload KTP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5 text-[10px]">
            <h2 className="text-[14px] font-bold text-neutral-800">2. Unggah Foto KTP Asli</h2>
            <label htmlFor="ktp-upload" className="border-2 border-dashed border-neutral-200 hover:border-[#4B2172] rounded-xl p-6 text-center bg-neutral-50 flex flex-col items-center justify-center cursor-pointer transition">
              {ktpPreview ? (
                <div className="space-y-2">
                  <img src={ktpPreview} alt="Preview KTP" className="w-48 h-28 object-cover rounded-lg shadow-sm border border-neutral-200 mx-auto" />
                  <p className="text-[8px] text-emerald-600 font-bold">KTP berhasil diunggah (Klik untuk mengganti)</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-[#4B2172] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-neutral-700">Klik untuk upload foto KTP</p>
                  <p className="text-[8px] text-neutral-400">Format: JPG, PNG (Maks. 5MB)</p>
                </div>
              )}
              <input id="ktp-upload" type="file" accept="image/*" onChange={handleKtpUpload} className="hidden" />
            </label>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setStep(1)} 
                className="w-1/3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer"
              >
                Kembali
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!ktpPreview}
                className={`w-2/3 py-2.5 rounded-xl text-[10px] font-bold transition shadow-sm flex items-center justify-center gap-1.5 ${
                  !ktpPreview
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
                }`}
              >
                <span>Lanjut ke Face ID</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3.5 text-center text-[10px]">
            <h2 className="text-[14px] font-bold text-neutral-800">3. Pemindaian Face ID & Liveness</h2>
            <p className="text-neutral-400 text-[9px]">Posisikan wajah Anda di dalam bingkai lingkaran untuk pengenalan biometrik otomatis.</p>
            
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-[#4B2172] mx-auto flex items-center justify-center relative bg-neutral-900 overflow-hidden shadow-inner">
              {isScanning ? (
                <div className="absolute inset-0 bg-[#4B2172]/40 flex flex-col items-center justify-center animate-pulse">
                  <RefreshCw className="w-8 h-8 text-white animate-spin mb-1" />
                  <span className="text-[8px] text-white font-bold">Memindai Liveness...</span>
                </div>
              ) : scanSuccess ? (
                <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white">
                  <CheckCircle2 className="w-10 h-10 mb-0.5 text-white" />
                  <span className="text-[10px] font-bold">Terverifikasi!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-neutral-400">
                  <Camera className="w-8 h-8 mb-1 text-purple-300" />
                  <span className="text-[8px]">Kamera Siap</span>
                </div>
              )}
            </div>

            {!scanSuccess ? (
              <button 
                onClick={startFaceScan}
                disabled={isScanning}
                className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer mt-2"
              >
                {isScanning ? 'Sedang Memindai Wajah...' : 'Mulai Scan Face ID'}
              </button>
            ) : (
              <div className="space-y-2 mt-2">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[9px] font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Onboarding Biometrik Sukses & Akun Aktif!
                </div>
                <button
                  onClick={() => {
                    markCustomerVerified();
                    navigate('/customer/booking');
                  }}
                  className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[10px] font-bold transition cursor-pointer"
                >
                  Selesai & Mulai Cari Trip
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}