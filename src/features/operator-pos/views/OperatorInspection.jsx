import { useState, useEffect } from 'react';
import { PackageCheck, Camera, QrCode, X as XIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import { operatorService } from '../../../services/operatorService';
import apiClient from '../../../services/apiClient';

export default function OperatorInspection() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [assignedPosName, setAssignedPosName] = useState('Memuat Pos...');
  const [isPosReady, setIsPosReady] = useState(false);
  
  const [formData, setFormData] = useState({
    qrCodeTrip: '',
    qrCodeTicket: '',
    posId: '',
    securitySealQr: ''
  });

  const [itemPhoto, setItemPhoto] = useState(null);
  const [itemPhotoPreviewUrl, setItemPhotoPreviewUrl] = useState(null);
  const [latestScanResult, setLatestScanResult] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOperatorPos = async () => {
      try {
        const userRes = await apiClient.get('/auth/me');
        const userId = userRes.data?.id;

        const pointsRes = await apiClient.get('/pickup-points');
        const allPoints = pointsRes.data?.data || pointsRes.data || [];
        
        const myPos = allPoints.find(p => String(p.operatorId) === String(userId)) || allPoints[0];

        if (!isMounted) return;

        if (myPos && myPos.id) {
          setFormData(prev => ({ ...prev, posId: String(myPos.id) }));
          setAssignedPosName(myPos.name || `Pos ID: ${myPos.id}`);
          setIsPosReady(true);
        } else {
          setAssignedPosName('Pos Belum Ditugaskan');
          setIsPosReady(false);
        }
      } catch (err) {
        console.error('Gagal mendeteksi pos operator otomatis:', err);
        if (isMounted) {
          setAssignedPosName('Gagal Memuat Pos');
          setIsPosReady(false);
        }
      }
    };

    fetchOperatorPos();
    return () => { isMounted = false; };
  }, []);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handlePhotoFileChange = async (file) => {
    if (!file) {
      setItemPhoto(null);
      setItemPhotoPreviewUrl(null);
      return;
    }

    try {
      setIsCompressing(true);
      const optimizedFile = await compressImage(file);
      setItemPhoto(optimizedFile);
      setItemPhotoPreviewUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(optimizedFile);
      });
    } catch {
      setItemPhoto(file);
      setItemPhotoPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleScanAndSeal = async (e) => {
    e.preventDefault();
    if (!isPosReady || !formData.posId) {
      toast.error('ID Pos operasional tidak terdeteksi. Hubungi Admin Regional.', { title: 'Akses Ditolak' });
      return;
    }

    if (!itemPhoto) {
      toast.warning('Wajib mengunggah foto fisik barang sebelum sealing & check-in!', { title: 'Foto Diperlukan' });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        qrCodeTrip: formData.qrCodeTrip.trim().toUpperCase(),
        qrCodeTicket: formData.qrCodeTicket.trim().toUpperCase(),
        posId: String(formData.posId),
        scanType: 'checkin_origin',
        securitySealQr: formData.securitySealQr.trim().toUpperCase() || `SEAL-${Math.floor(100000 + Math.random() * 900000)}`
      };

      const response = await operatorService.scanCheckpoint(payload);

      setLatestScanResult({
        id: response.checkpoint?.id ? String(response.checkpoint.id) : 'CHK-' + Date.now().toString().slice(-4),
        trip: response.checkpoint?.trip?.qrCodeTrip || formData.qrCodeTrip,
        order: response.checkpoint?.order?.qrCodeTiket || formData.qrCodeTicket,
        status: 'Check-in Asal & Segel Aktif',
        date: 'Baru saja'
      });

      setFormData(prev => ({ ...prev, qrCodeTrip: '', qrCodeTicket: '', securitySealQr: '' }));
      handlePhotoFileChange(null);
      toast.success(response.message || 'Check-in Pos Asal dan Segel QR berhasil dicatat!', { title: 'Berhasil' });
    } catch (error) {
      console.error('Gagal melakukan scan checkpoint:', error);
      toast.error(error.response?.data?.message || 'Gagal memproses ke server backend.', { title: 'Error Server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <PackageCheck className="w-3 h-3" /> POS OPERASIONAL & SECURITY SEALING
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Inspeksi & Sealing Checkpoint
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Validasi fisik paket pos asal, unggah foto kondisi, dan sinkronkan segel QR langsung ke database.
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl shrink-0 ${isPosReady ? 'bg-purple-50 border-purple-100 text-[#4B2172]' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          {isPosReady ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <div>
            <p className="text-[8px] font-bold uppercase opacity-70">Pos Penugasan Anda</p>
            <p className="text-[10px] font-bold">{assignedPosName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Form Validasi Pos Asal</h2>
          <form onSubmit={handleScanAndSeal} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                KODE QR TRIP MITRA
              </label>
              <input 
                type="text" 
                required
                placeholder="cth: TRIP-A2D4CS13"
                value={formData.qrCodeTrip}
                onChange={(e) => setFormData({...formData, qrCodeTrip: e.target.value.toUpperCase()})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px] uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                KODE QR TIKET / PARCEL
              </label>
              <input 
                type="text" 
                required
                placeholder="cth: TKT-SDJF12H"
                value={formData.qrCodeTicket}
                onChange={(e) => setFormData({...formData, qrCodeTicket: e.target.value.toUpperCase()})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px] uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                UPLOAD FOTO KONDISI BARANG
              </label>
              {itemPhotoPreviewUrl ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={itemPhotoPreviewUrl} alt="Pratinjau" className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-emerald-600">
                      {isCompressing ? 'Mengompresi...' : 'Foto Siap Dikirim'}
                    </p>
                    <p className="text-[8px] text-neutral-400 truncate">{itemPhoto?.name}</p>
                  </div>
                  <button type="button" onClick={() => handlePhotoFileChange(null)} className="w-6 h-6 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 cursor-pointer">
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-200 rounded-xl p-3.5 text-center hover:bg-neutral-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <Camera className="w-5 h-5 text-[#4B2172] mb-1" />
                  <p className="font-bold text-neutral-700 text-[10px]">Klik untuk Unggah Foto</p>
                  <p className="text-[8px] text-neutral-400">Otomatis terkompresi (Cepat & Ringan)</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => handlePhotoFileChange(e.target.files[0])} 
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                NOMOR STIKER SEGEL QR (SECURITY SEAL)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Opsional / Auto"
                  value={formData.securitySealQr}
                  onChange={(e) => setFormData({...formData, securitySealQr: e.target.value.toUpperCase()})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px] font-mono uppercase"
                />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, securitySealQr: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`})}
                  className="px-3 bg-purple-50 text-[#4B2172] font-bold text-[9px] rounded-xl hover:bg-purple-100 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> Auto
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isCompressing || !isPosReady}
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer mt-1 disabled:opacity-50"
            >
              {isLoading ? 'Memproses ke Server...' : 'Kunci & Check-in Asal'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Status Hasil Scan Checkpoint Terakhir</h2>
          
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">ID LOG</th>
                  <th className="py-3 px-4">TRIP QR</th>
                  <th className="py-3 px-4">TICKET QR</th>
                  <th className="py-3 px-4">STATUS BACKEND</th>
                  <th className="py-3 px-4">WAKTU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[9px]">
                {!latestScanResult ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-12">
                        <PackageCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-center text-neutral-400 text-[10px]">Belum ada aktivitas scan pos yang dikirim ke server pada sesi ini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr className="hover:bg-neutral-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-neutral-800 font-mono text-[10px]">{latestScanResult.id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4B2172]">{latestScanResult.trip}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700">{latestScanResult.order}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge variant="emerald">{latestScanResult.status}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-semibold">{latestScanResult.date}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}