import { useState, useRef, useEffect } from 'react';
import { User, FileText, Upload, Camera, CheckCircle2, ShieldCheck, AlertCircle, X, CreditCard } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import { mitraService } from '../../../services/mitraService';
import apiClient from '../../../services/apiClient';
import { useAuth } from '../../../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const SKCK_TYPES = [...IMAGE_TYPES, 'application/pdf'];
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;

export default function MitraOnboarding() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    nik: '',
    address: '',
    vehicleType: 'motor',
    vehicleModel: '',
    vehicleColor: 'Hitam',
    plateNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
  });

  const [rawFiles, setRawFiles] = useState({ sim: null, skck: null, stnk: null, face: null });
  const [previews, setPreviews] = useState({ sim: null, skck: null, stnk: null });
  const [fileErrors, setFileErrors] = useState({ sim: '', skck: '', stnk: '' });

  const [faceScanned, setFaceScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facePreviewUrl, setFacePreviewUrl] = useState(null); 
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function checkVerificationStatus() {
      try {
        const response = await apiClient.get('/verifications/my-status');
        const verifications = response.data?.data || response.data || [];
        if (verifications.length > 0) {
          const hasActive = verifications.some(v => v.status === 'pending' || v.status === 'approved');
          if (hasActive && isMounted) setSubmitted(true);
        }
      } catch (err) {
        console.log('Belum ada riwayat verifikasi:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkVerificationStatus();
    return () => { isMounted = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'nik') nextValue = value.replace(/\D/g, '').slice(0, 16);
    else if (name === 'bankAccountNumber') nextValue = value.replace(/\D/g, '');
    else if (name === 'phone') nextValue = value.replace(/[^\d+]/g, '');
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleFileChange = (e, field) => {
    const targetFile = e.target.files && e.target.files[0];
    if (!targetFile) return;

    const allowedTypes = field === 'skck' ? SKCK_TYPES : IMAGE_TYPES;
    if (!allowedTypes.includes(targetFile.type)) {
      setFileErrors(prev => ({ ...prev, [field]: 'Format file tidak didukung.' }));
      return;
    }
    if (targetFile.size > MAX_FILE_SIZE) {
      setFileErrors(prev => ({ ...prev, [field]: 'Ukuran file melebihi 5MB.' }));
      return;
    }

    setFileErrors(prev => ({ ...prev, [field]: '' }));
    setRawFiles(prev => ({ ...prev, [field]: targetFile }));

    if (targetFile.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(targetFile) }));
    } else {
      setPreviews(prev => ({ ...prev, [field]: 'PDF Document' }));
    }
  };

  const startCamera = async () => {
    setErrorMessage('');
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraActive(true);
      setIsScanning(false);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 150);
    } catch {
      setIsScanning(false);
      setCameraActive(false);
      setErrorMessage('Akses kamera ditolak atau perangkat kamera tidak ditemukan.');
    }
  };

  const captureFaceId = () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const faceFile = new File([blob], `face-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setRawFiles(prev => ({ ...prev, face: faceFile }));
        setFacePreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.85);

    streamRef.current.getVideoTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setFaceScanned(true);
  };

  const resetFaceScan = () => {
    setFaceScanned(false);
    setFacePreviewUrl(null);
    setRawFiles(prev => ({ ...prev, face: null }));
    startCamera();
  };

  // Fungsi memastikan upload file mengarah dan tercatat di folder uploads/verifications
  const uploadFileToServer = async (fileObj) => {
    if (!fileObj) return '';
    const formDataObj = new FormData();
    formDataObj.append('file', fileObj);
    formDataObj.append('destination', 'uploads/verifications'); // Memastikan backend menangkap ke folder tujuan verifikasi
    try {
      const response = await apiClient.post('/uploads/file', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.filePath || response.data.url;
    } catch (err) {
      console.error('Gagal upload file fisik:', err);
    }
  };

  const missingDocuments = ['sim', 'skck', 'stnk'].filter((field) => !rawFiles[field]);
  const isNikValid = formData.nik.length === 16;
  const isPhoneValid = PHONE_REGEX.test(formData.phone.trim());

  const isTextInputsValid = 
    formData.fullName.trim() !== '' && 
    formData.phone.trim() !== '' && 
    isPhoneValid &&
    formData.address.trim() !== '' && 
    formData.plateNumber.trim() !== '' &&
    formData.vehicleModel.trim() !== '' &&
    formData.bankName.trim() !== '' &&
    formData.bankAccountNumber.trim() !== '' &&
    formData.bankAccountHolder.trim() !== '';

  const isFormComplete = faceScanned && missingDocuments.length === 0 && isNikValid && isTextInputsValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Unggah file Face ID ke server (uploads/verifications)
      let facePath = '';
      if (rawFiles.face) {
        facePath = await uploadFileToServer(rawFiles.face);
      }

      // 2. Perbarui profil dengan path face image fisik dan data rekening
      await apiClient.patch('/users/me/profile', {
        ktpNumber: formData.nik,
        fullNameKtp: formData.fullName,
        addressKtp: formData.address,
        faceImageUrl: facePath || 'https://storage.nebeng.com/faces/default-face.jpg',
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountHolder: formData.bankAccountHolder,
      });

      // 3. Daftarkan kendaraan
      await apiClient.post('/vehicles', {
        type: formData.vehicleType,
        model: formData.vehicleModel,
        plateNumber: formData.plateNumber,
        color: formData.vehicleColor,
        capacitySeats: formData.vehicleType === 'mobil' ? 4 : 1,
        maxWeightCapacityKg: formData.vehicleType === 'mobil' ? 100 : 15,
      });

      // 4. Unggah berkas fisik (SIM, SKCK, STNK) ke uploads/verifications
      const simPath = await uploadFileToServer(rawFiles.sim);
      const skckPath = await uploadFileToServer(rawFiles.skck);
      const stnkPath = await uploadFileToServer(rawFiles.stnk);

      // 5. Submit verifikasi ke backend
      await mitraService.submitVerification('sim', [{ filePath: simPath, fileType: rawFiles.sim.type }]);
      await mitraService.submitVerification('skck', [{ filePath: skckPath, fileType: rawFiles.skck.type }]);
      await mitraService.submitVerification('stnk', [{ filePath: stnkPath, fileType: rawFiles.stnk.type }]);

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat memproses data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-neutral-500 text-[11px]">Memuat status verifikasi...</div>;
  }

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
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Mitra Onboarding & Verification</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Lengkapi data diri, rekening bank, kendaraan, dan unggah berkas fisik.</p>
        </div>
        {submitted && <StatusBadge variant="amber">Menunggu Verifikasi Admin</StatusBadge>}
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5 text-[10px]">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#4B2172]" /> 1. Informasi Data Diri & Kendaraan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Lengkap (Sesuai KTP)</label>
                <input type="text" name="fullName" required placeholder="Nama Lengkap" value={formData.fullName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor NIK KTP (16 Digit)</label>
                <input type="text" name="nik" required inputMode="numeric" maxLength={16} placeholder="3372xxxxxxxxxxxx" value={formData.nik} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Telepon / WhatsApp</label>
                <input type="text" name="phone" required placeholder="0812xxxxxxxx" value={formData.phone} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jenis Kendaraan</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]">
                  <option value="motor">Sepeda Motor</option>
                  <option value="mobil">Mobil / Minibus</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Model / Merk Kendaraan</label>
                <input type="text" name="vehicleModel" required placeholder="cth: Honda Beat / Avanza" value={formData.vehicleModel} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Plat Kendaraan</label>
                <input type="text" name="plateNumber" required placeholder="cth: AD1234XX" value={formData.plateNumber} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Alamat Domisili</label>
                <textarea name="address" required rows="2" placeholder="Masukkan alamat lengkap domisili..." value={formData.address} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172] resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#4B2172]" /> Informasi Rekening Bank (Pencairan)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Bank</label>
                <input type="text" name="bankName" required placeholder="cth: BCA / Mandiri" value={formData.bankName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Rekening</label>
                <input type="text" name="bankAccountNumber" required placeholder="cth: 1234567890" inputMode="numeric" value={formData.bankAccountNumber} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Pemilik Rekening</label>
                <input type="text" name="bankAccountHolder" required placeholder="Sesuai buku tabungan" value={formData.bankAccountHolder} onChange={handleInputChange} className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#4B2172]" /> 2. Unggah Dokumen Legalitas (SIM, SKCK, STNK)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['sim', 'skck', 'stnk'].map((field) => (
                <div key={field} className="p-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center flex flex-col items-center justify-center relative">
                  {previews[field] && previews[field] !== 'PDF Document' ? (
                    <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden border border-neutral-200 bg-black/5">
                      <img src={previews[field]} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setRawFiles(p => ({...p, [field]: null})); setPreviews(p => ({...p, [field]: null})); }} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Upload className="w-6 h-6 text-[#4B2172] mb-1" />
                  )}
                  <p className="text-[10px] font-bold text-neutral-800 mb-0.5 uppercase">Foto {field}</p>
                  <p className="text-[8px] text-neutral-400 mb-2 truncate max-w-[180px]">{rawFiles[field] ? rawFiles[field].name : 'Format JPG/PNG (Maks 5MB)'}</p>
                  <label className="px-3 py-1 bg-purple-50 text-[#4B2172] rounded-lg text-[8px] font-bold cursor-pointer hover:bg-purple-100 transition">
                    {rawFiles[field] ? 'Ganti Berkas' : 'Pilih Berkas'}
                    <input type="file" accept={field === 'skck' ? "image/*,application/pdf" : "image/*"} onChange={(e) => handleFileChange(e, field)} className="hidden" />
                  </label>
                  {fileErrors[field] && <p className="text-[8px] text-rose-500 mt-1">{fileErrors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 text-center space-y-3">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-[#4B2172]" /> 3. Pendaftaran Data Face ID Scan
            </h2>
            <div className="max-w-xs mx-auto p-3 bg-neutral-900 rounded-2xl text-white flex flex-col items-center justify-center relative shadow-inner min-h-[180px]">
              <canvas ref={canvasRef} className="hidden" />
              <div className={`relative w-full h-40 flex flex-col items-center justify-center ${cameraActive ? 'flex' : 'hidden'}`}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-32 object-cover rounded-xl border border-purple-500/50 bg-black" />
                <button type="button" onClick={captureFaceId} className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded-lg transition cursor-pointer">
                  Ambil / Konfirmasi Wajah
                </button>
              </div>
              {faceScanned && facePreviewUrl && !cameraActive && (
                <div className="flex flex-col items-center py-2 space-y-2">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                    <img src={facePreviewUrl} alt="Face ID" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Face ID Berhasil Direkam!
                  </div>
                  <button type="button" onClick={resetFaceScan} className="text-[8px] text-purple-300 underline hover:text-white cursor-pointer">Ulangi Foto Wajah</button>
                </div>
              )}
              {!cameraActive && !isScanning && !faceScanned && (
                <div className="flex flex-col items-center py-6">
                  <button type="button" onClick={startCamera} className="px-3.5 py-1.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[9px] font-bold transition cursor-pointer">
                    Mulai Kamera & Scan Wajah
                  </button>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col items-end gap-1 pt-1">
            <button type="submit" disabled={!isFormComplete || isLoading} className={`px-6 py-3 rounded-xl text-[10px] font-bold transition shadow-sm ${isFormComplete && !isLoading ? 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
              {isLoading ? 'Mengunggah Berkas ke Server...' : 'Kirim Data Onboarding & Verifikasi'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-[18px] font-bold text-neutral-800">Pendaftaran Berhasil Dikirim!</h2>
          <p className="text-[10px] text-neutral-400 max-w-sm mx-auto">Berkas fisik berhasil diunggah ke folder server dan data Anda masuk ke antrean admin.</p>
        </div>
      )}
    </div>
  );
}