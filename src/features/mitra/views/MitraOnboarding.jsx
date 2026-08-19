import React, { useState } from 'react';
import { User, FileText, Upload, Camera, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MitraOnboarding() {
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

  const [faceScanned, setFaceScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files[0].name }));
    }
  };

  const handleFaceScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setFaceScanned(true);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#312e81] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verifikasi Keamanan Mitra
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Mitra Onboarding & Verification</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Lengkapi data diri, unggah dokumen legalitas, dan lakukan pemindaian Face ID untuk aktivasi akun.</p>
        </div>
        {submitted && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> Status: Menunggu Verifikasi Admin
          </div>
        )}
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bagian 1: Data Diri */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#312e81]" /> 1. Informasi Data Diri & Kendaraan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nama Lengkap (Sesuai KTP)</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required
                  placeholder="cth: Budi Santoso"
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nomor NIK KTP</label>
                <input 
                  type="text" 
                  name="nik" 
                  required
                  placeholder="3372xxxxxxxxxxxx"
                  value={formData.nik} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nomor Telepon / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone" 
                  required
                  placeholder="0812xxxxxxxx"
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Jenis Kendaraan</label>
                <select 
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                >
                  <option value="Motor">Sepeda Motor</option>
                  <option value="Mobil">Mobil / Minibus</option>
                  <option value="Box">Mobil Box / Pick Up</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nomor Plat Kendaraan</label>
                <input 
                  type="text" 
                  name="plateNumber" 
                  required
                  placeholder="cth: AD 1234 XX"
                  value={formData.plateNumber} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Alamat Domisili</label>
                <textarea 
                  name="address" 
                  required
                  rows="2"
                  placeholder="Masukkan alamat lengkap domisili saat ini..."
                  value={formData.address} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#312e81]"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bagian 2: Unggah Dokumen */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-[#312e81]" /> 2. Unggah Dokumen Legalitas (SIM, SKCK, STNK)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* SIM */}
              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 text-center flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs font-extrabold text-neutral-800 mb-1">Foto SIM C/A</p>
                <p className="text-[10px] text-neutral-400 mb-3">{files.sim ? files.sim : 'Format JPG/PNG (Maks 2MB)'}</p>
                <label className="px-3 py-1.5 bg-[#312e81] text-white rounded-xl text-[11px] font-bold cursor-pointer hover:bg-[#1e1b4b] transition">
                  Pilih Berkas
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'sim')} className="hidden" />
                </label>
              </div>

              {/* SKCK */}
              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 text-center flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs font-extrabold text-neutral-800 mb-1">Foto SKCK Aktif</p>
                <p className="text-[10px] text-neutral-400 mb-3">{files.skck ? files.skck : 'Format PDF/JPG (Maks 2MB)'}</p>
                <label className="px-3 py-1.5 bg-[#312e81] text-white rounded-xl text-[11px] font-bold cursor-pointer hover:bg-[#1e1b4b] transition">
                  Pilih Berkas
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'skck')} className="hidden" />
                </label>
              </div>

              {/* STNK */}
              <div className="p-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 text-center flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs font-extrabold text-neutral-800 mb-1">Foto STNK Kendaraan</p>
                <p className="text-[10px] text-neutral-400 mb-3">{files.stnk ? files.stnk : 'Format JPG/PNG (Maks 2MB)'}</p>
                <label className="px-3 py-1.5 bg-[#312e81] text-white rounded-xl text-[11px] font-bold cursor-pointer hover:bg-[#1e1b4b] transition">
                  Pilih Berkas
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'stnk')} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Bagian 3: Face ID Scan */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 text-center">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center justify-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-[#312e81]" /> 3. Pendaftaran Data Face ID Scan
            </h2>
            <p className="text-xs text-neutral-400 mb-6">Sistem memerlukan verifikasi wajah untuk keamanan dan validasi identitas pengemudi mitra.</p>
            
            <div className="max-w-xs mx-auto p-6 bg-neutral-900 rounded-3xl text-white flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[220px]">
              {isScanning ? (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-blue-400 animate-spin flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-blue-300">Memindai Wajah...</p>
                </div>
              ) : faceScanned ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-extrabold text-emerald-400">Face ID Berhasil Didaftarkan!</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Data biometrik tersimpan aman</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-medium text-neutral-300 mb-4">Posisikan wajah Anda di depan kamera</p>
                  <button 
                    type="button"
                    onClick={handleFaceScan}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Mulai Face ID Scan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Kirim */}
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={!faceScanned}
              className={`px-8 py-4 rounded-2xl font-extrabold text-xs transition shadow-lg ${
                faceScanned 
                  ? 'bg-[#312e81] hover:bg-[#1e1b4b] text-white shadow-indigo-900/30 cursor-pointer' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Kirim Data Onboarding & Verifikasi
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900">Pendaftaran Berhasil Dikirim!</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Dokumen dan data Face ID Anda sedang ditinjau oleh tim verifikasi regional. Akun Anda akan diaktifkan setelah proses validasi selesai.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-4 px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Ulangi / Edit Data
          </button>
        </div>
      )}
    </div>
  );
}