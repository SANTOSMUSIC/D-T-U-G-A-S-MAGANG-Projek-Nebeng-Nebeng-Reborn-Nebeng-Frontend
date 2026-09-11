import { useEffect, useState, useRef } from 'react';
import { Upload, CheckCircle2, ShieldCheck, Camera, ArrowRight, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/apiClient';

const MAX_KTP_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_KTP_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;

export default function BiometricOnboarding() {
  const { user, checkAuthStatus } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    nik: '',
    addressKtp: '',
    phone: user?.phone || ''
  });
  
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceFile, setFaceFile] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Jika sudah approved, langsung disable / redirect dari onboarding ke booking
  useEffect(() => {
    let isMounted = true;
    const checkLiveApproval = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (isMounted && res.data && res.data.statusVerification === 'approved') {
          navigate('/customer/booking', { replace: true });
        }
      } catch (err) {
        console.error('Gagal memeriksa status verifikasi:', err);
      }
    };
    checkLiveApproval();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleManualCheckStatus = async () => {
    if (isCheckingStatus) return;
    setIsCheckingStatus(true);
    try {
      if (checkAuthStatus) await checkAuthStatus();
      const res = await apiClient.get('/auth/me');
      
      if (res.data && res.data.statusVerification === 'approved') {
        toast.success('Verifikasi Anda telah disetujui!', { title: 'Sukses' });
        navigate('/customer/booking', { replace: true });
        return;
      } else {
        const statusRes = await apiClient.get('/verifications/my-status');
        if (statusRes.data && Array.isArray(statusRes.data) && statusRes.data.length > 0) {
          const latest = statusRes.data[0];
          if (latest.status === 'pending') {
            toast.info('Status pengajuan Anda masih dalam antrean peninjauan Admin.', { title: 'Menunggu' });
            setIsSubmittedPending(true);
          } else if (latest.status === 'rejected') {
            toast.error(`Pengajuan ditolak. Alasan: ${latest.rejectionReason || 'Periksa kembali dokumen.'}`, { title: 'Ditolak' });
            setIsSubmittedPending(false);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning('Terlalu banyak permintaan. Mohon tunggu sebentar.', { title: 'Peringatan' });
      } else {
        toast.error('Gagal memperbarui status dari server.', { title: 'Error' });
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const isPhoneValid = PHONE_REGEX.test(formData.phone.trim());

  const handleKtpUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!ALLOWED_KTP_TYPES.includes(file.type)) {
      toast.error('Format file harus JPG atau PNG.', { title: 'Format Tidak Didukung' });
      return;
    }

    if (file.size > MAX_KTP_SIZE_BYTES) {
      toast.error('Ukuran file KTP maksimal 5MB.', { title: 'File Terlalu Besar' });
      return;
    }

    setKtpFile(file);
    setKtpPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    return () => {
      if (ktpPreview) URL.revokeObjectURL(ktpPreview);
      if (facePreview) URL.revokeObjectURL(facePreview);
      if (currentVideoRef && currentVideoRef.srcObject) {
        const tracks = currentVideoRef.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [ktpPreview, facePreview]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Gagal membuka kamera:', err);
      toast.error('Gagal mengakses kamera perangkat untuk Face ID.', { title: 'Kamera Error' });
      setIsCameraActive(false);
    }
  };

  const captureFaceImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsScanning(false);
        toast.error('Gagal menangkap gambar wajah.', { title: 'Error' });
        return;
      }
      const capturedFile = new File([blob], `face-id-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFaceFile(capturedFile);
      setFacePreview(URL.createObjectURL(blob));

      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      setIsCameraActive(false);
      setIsScanning(false);
      toast.success('Foto Face ID berhasil direkam.', { title: 'Sukses' });
    }, 'image/jpeg', 0.85);
  };

  const uploadFileToServer = async (fileObj) => {
    if (!fileObj) return '';
    const formDataObj = new FormData();
    formDataObj.append('file', fileObj);
    formDataObj.append('destination', 'uploads/verifications');
    try {
      const response = await apiClient.post('/uploads/file', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.filePath || response.data.url;
    } catch (err) {
      console.error('Gagal upload file fisik:', err);
    }
  };

  const handleSubmitVerification = async () => {
    setIsLoading(true);
    try {
      let ktpFilePath = '/uploads/verifications/ktp-default.jpg';
      let faceFilePath = '/uploads/verifications/face-default.jpg';

      if (ktpFile) {
        ktpFilePath = await uploadFileToServer(ktpFile);
      }

      if (faceFile) {
        faceFilePath = await uploadFileToServer(faceFile);
      }

      await apiClient.post('/verifications/submit', {
        type: 'ktp',
        ktpNumber: formData.nik.trim(),
        fullNameKtp: formData.fullName.trim(),
        addressKtp: formData.addressKtp.trim() || 'Alamat sesuai KTP',
        faceImageUrl: faceFilePath,
        files: [
          { filePath: ktpFilePath, fileType: ktpFile?.type || 'image/jpeg' },
          { filePath: faceFilePath, fileType: 'image/jpeg' }
        ]
      });

      toast.success('Dokumen KTP & Face ID berhasil dikirim untuk ditinjau.', { title: 'Terkirim' });
      setIsSubmittedPending(true);

      if (checkAuthStatus) await checkAuthStatus();
    } catch (error) {
      console.error('Gagal mengirim verifikasi:', error);
      toast.error(error.response?.data?.message || 'Gagal mengirim data verifikasi.', { title: 'Error Server' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmittedPending) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-12 bg-white rounded-2xl shadow-sm border border-neutral-200 text-center space-y-4 font-['Inter']">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-[16px] font-bold text-neutral-800">Verifikasi Sedang Ditinjau</h2>
        <p className="text-[11px] text-neutral-500">
          Dokumen KTP dan Face ID Anda telah berhasil dikirim ke pusat verifikasi. Menu transaksi akan terbuka otomatis setelah Admin menyetujui pengajuan Anda.
        </p>
        <button
          onClick={handleManualCheckStatus}
          disabled={isCheckingStatus}
          className="py-2.5 px-5 bg-[#4B2172] text-white rounded-xl text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
          <span>{isCheckingStatus ? 'Memeriksa...' : 'Cek Status Verifikasi'}</span>
        </button>
      </div>
    );
  }

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
            <h2 className="text-[14px] font-bold text-neutral-800">1. Masukkan Informasi Identitas</h2>
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
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">NIK</label>
              <input 
                type="text" 
                maxLength={16}
                value={formData.nik}
                placeholder="16 digit nomor NIK KTP"
                onChange={(e) => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Alamat Sesuai KTP</label>
              <input 
                type="text" 
                placeholder="Contoh: Jl. Merdeka No. 12"
                value={formData.addressKtp}
                onChange={(e) => setFormData({...formData, addressKtp: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor WhatsApp/HP</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^\d+]/g, '')})}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.fullName.trim() || formData.nik.length !== 16 || !isPhoneValid}
              className="w-full py-3 bg-[#4B2172] text-white rounded-xl text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>Lanjut ke Upload KTP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5 text-[10px]">
            <h2 className="text-[14px] font-bold text-neutral-800">2. Unggah Foto KTP Asli</h2>
            <label htmlFor="ktp-upload" className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center bg-neutral-50 flex flex-col items-center justify-center cursor-pointer">
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
            <div className="flex gap-2">
              <button 
                onClick={() => setStep(1)} 
                className="w-1/3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!ktpPreview} 
                className="w-2/3 py-2.5 bg-[#4B2172] text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
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
            
            {!facePreview ? (
              <div className="space-y-3">
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-[#4B2172] mx-auto overflow-hidden bg-neutral-900 flex items-center justify-center relative shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[9px] p-2">
                      Kamera belum aktif
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="py-2 px-4 bg-purple-100 text-[#4B2172] font-bold rounded-xl cursor-pointer flex items-center gap-1 mx-auto"
                  >
                    <Camera className="w-3.5 h-3.5" /> Aktifkan Kamera Wajah
                  </button>
                ) : (
                  <button
                    onClick={captureFaceImage}
                    disabled={isScanning}
                    className="w-full py-3 bg-[#4B2172] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isScanning ? 'Merekam Wajah...' : 'Ambil Foto Wajah (Capture)'}
                  </button>
                )}
                
                <div className="pt-2">
                  <button 
                    onClick={() => setStep(2)} 
                    className="py-1.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold cursor-pointer"
                  >
                    Kembali ke Langkah 2
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-2 border-emerald-500 shadow-sm">
                  <img src={facePreview} alt="Face Captured" className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Wajah Berhasil Direkam!
                </div>
                <button
                  onClick={handleSubmitVerification}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? 'Mengirim Data...' : 'Kirim Verifikasi & Selesai'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}