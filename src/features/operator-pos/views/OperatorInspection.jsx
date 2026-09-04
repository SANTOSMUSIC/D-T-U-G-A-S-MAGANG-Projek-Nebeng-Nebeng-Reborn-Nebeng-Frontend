import { useState } from 'react';
import { PackageCheck, Camera, QrCode, X as XIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import { operatorService } from '../../../services/operatorService';

export default function OperatorInspection() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    qrCodeTrip: '',
    qrCodeTicket: '',
    posId: '',
    securitySealQr: ''
  });

  const [itemPhoto, setItemPhoto] = useState(null);
  const [itemPhotoPreviewUrl, setItemPhotoPreviewUrl] = useState(null);
  const [latestScanResult, setLatestScanResult] = useState(null);

  const handlePhotoFileChange = (file) => {
    setItemPhoto(file || null);
    setItemPhotoPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleScanAndSeal = async (e) => {
    e.preventDefault();
    if (!itemPhoto) {
      toast.warning('Wajib mengunggah foto fisik barang sebelum melakukan sealing & check-in!', { title: 'Foto Diperlukan' });
      return;
    }

    try {
      setIsLoading(true);

      // Memanggil API Checkpoint ke Backend untuk Check-in Asal & Pemasangan Segel
      const payload = {
        qrCodeTrip: formData.qrCodeTrip,
        qrCodeTicket: formData.qrCodeTicket,
        posId: formData.posId,
        scanType: 'checkin_origin',
        securitySealQr: formData.securitySealQr || `SEAL-${Math.floor(100000 + Math.random() * 900000)}`
      };

      const response = await operatorService.scanCheckpoint(payload);

      setLatestScanResult({
        id: response.checkpoint?.id || 'CHK-' + Date.now().toString().slice(-4),
        trip: response.checkpoint?.trip?.qrCodeTrip || formData.qrCodeTrip,
        order: response.checkpoint?.order?.qrCodeTiket || formData.qrCodeTicket,
        status: 'Check-in Asal & Segel Aktif',
        date: 'Baru saja'
      });

      setFormData({ qrCodeTrip: '', qrCodeTicket: '', posId: '', securitySealQr: '' });
      handlePhotoFileChange(null);
      toast.success(response.message || 'Check-in Pos Asal dan Segel QR berhasil dicatat ke database!', { title: 'Berhasil' });
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
                onChange={(e) => setFormData({...formData, qrCodeTrip: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
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
                onChange={(e) => setFormData({...formData, qrCodeTicket: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                ID POS TEMPAT BERTUGAS
              </label>
              <input 
                type="text" 
                required
                placeholder="cth: 10"
                value={formData.posId}
                onChange={(e) => setFormData({...formData, posId: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                UPLOAD FOTO KONDISI BARANG
              </label>
              {itemPhotoPreviewUrl ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={itemPhotoPreviewUrl} alt="Pratinjau Barang" className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-emerald-600">Foto Ter-upload</p>
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
                  <p className="text-[8px] text-neutral-400">PNG, JPG (Maks. 5MB)</p>
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
                  onChange={(e) => setFormData({...formData, securitySealQr: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
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
              disabled={isLoading}
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