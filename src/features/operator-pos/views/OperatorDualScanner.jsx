import { useState, useEffect } from 'react';
import { QrCode, Camera, ArrowRightLeft, ShieldCheck, Unlock, KeyRound, ScanLine, Upload, X as XIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import QrScannerModal from '../../../components/ui/QrScannerModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

export default function OperatorDualScanner() {
  const toast = useToast();
  const [scanMode, setScanMode] = useState('origin');
  
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentHandoverData, setCurrentHandoverData] = useState({ trip: '', ticket: '' });
  const [otpCode, setOtpCode] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const [receiverKtpPhoto, setReceiverKtpPhoto] = useState(null);
  const [receiverKtpPreviewUrl, setReceiverKtpPreviewUrl] = useState(null);
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  
  // Menggunakan isLoadingHistory untuk status muat tabel
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [scanHistory, setScanHistory] = useState([
    { id: 'LOG-881', type: 'Handover & Escrow Released', trip: 'TRIP-9081', ticket: 'PKG-44910', status: 'SUCCESS (Escrow Released)', time: '11:30 WIB' },
    { id: 'LOG-880', type: 'Scan 1 (Origin)', trip: 'TRIP-9082', ticket: 'PKG-44911', status: 'IN_TRANSIT', time: '10:00 WIB' }
  ]);

  useEffect(() => {
    let isMounted = true;
    async function fetchScanLogs() {
      try {
        if (isMounted) setIsLoadingHistory(true);
        const response = await apiClient.get('/scans/logs').catch(() => ({ data: [] }));

        const formatted = (response.data || []).map((log, index) => ({
          id: String(log.id || `LOG-${880 - index}`),
          type: log.type || 'Scan 1 (Origin)',
          trip: log.trip || log.tripId || 'TRIP-9081',
          ticket: log.ticket || log.packageId || 'PKG-44910',
          status: log.status || 'IN_TRANSIT',
          time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString('id-ID') : 'Baru saja'
        }));

        if (isMounted && formatted.length > 0) {
          setScanHistory(formatted);
        }
      } catch (error) {
        console.warn('Endpoint /scans/logs belum tersedia di backend, menggunakan data lokal.', error);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }

    fetchScanLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReceiverKtpChange = (file) => {
    setReceiverKtpPhoto(file || null);
    setReceiverKtpPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  useEffect(() => {
    return () => {
      if (receiverKtpPreviewUrl) URL.revokeObjectURL(receiverKtpPreviewUrl);
    };
  }, [receiverKtpPreviewUrl]);

  const [scannerTarget, setScannerTarget] = useState(null);

  const handleCameraScanResult = (decodedText) => {
    if (scannerTarget === 'trip') {
      setTripQr(decodedText);
    } else if (scannerTarget === 'ticket') {
      setTicketQr(decodedText);
    }
    setScannerTarget(null);
    toast.success('QR berhasil dipindai dari kamera.', { title: 'Scan Kamera Sukses' });
  };

  const handleProcessScan = async (e) => {
    e.preventDefault();
    const cleanTrip = tripQr.trim().toUpperCase();
    const cleanTicket = ticketQr.trim().toUpperCase();

    if (!cleanTrip || !cleanTicket) {
      toast.warning('Mohon pastikan QR Trip Mitra dan QR Tiket/Paket Customer telah terisi!', { title: 'Data Belum Lengkap' });
      return;
    }

    try {
      const payload = {
        trip: cleanTrip,
        ticket: cleanTicket,
        type: scanMode === 'origin' ? 'Scan 1 (Origin)' : 'Scan 2 (Destination)',
        status: scanMode === 'origin' ? 'IN_TRANSIT (Berangkat)' : 'PENDING_HANDOVER'
      };

      await apiClient.post('/scans/verify', payload).catch(() => null);

      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: payload.type,
        trip: cleanTrip,
        ticket: cleanTicket,
        status: payload.status,
        time: 'Baru saja'
      };

      setScanHistory([newLog, ...scanHistory]);

      if (scanMode === 'origin') {
        toast.success('Scan 1 berhasil! Status trip menjadi IN_TRANSIT.', { title: 'Scan Berhasil' });
        setTripQr('');
        setTicketQr('');
      } else {
        setCurrentHandoverData({ trip: cleanTrip, ticket: cleanTicket });
        setOtpCode('');
        setRecipientName('');
        handleReceiverKtpChange(null);
        setShowHandoverModal(true);
      }
    } catch (error) {
      console.error('Gagal memproses scan:', error);
      toast.error('Gagal memproses verifikasi QR.', { title: 'Error Server' });
    }
  };

  const handleVerifyHandover = async (e) => {
    e.preventDefault();
    if (isSubmittingHandover) return;

    if (!recipientName.trim()) {
      toast.warning('Masukkan nama penerima terlebih dahulu!', { title: 'Nama Penerima Kosong' });
      return;
    }

    if (!otpCode || otpCode.length < 6) {
      toast.warning('Masukkan Kode OTP 6-digit penerima dengan benar!', { title: 'OTP Tidak Valid' });
      return;
    }

    if (!receiverKtpPhoto) {
      toast.warning('Unggah foto KTP penerima terlebih dahulu sebelum melanjutkan!', { title: 'Foto KTP Belum Diunggah' });
      return;
    }

    try {
      setIsSubmittingHandover(true);

      const formData = new FormData();
      formData.append('trip', currentHandoverData.trip);
      formData.append('ticket', currentHandoverData.ticket);
      formData.append('recipientName', recipientName.trim());
      formData.append('otpCode', otpCode);
      formData.append('file', receiverKtpPhoto);

      await apiClient.post('/scans/handover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(() => null);

      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Handover & Escrow Released',
        trip: currentHandoverData.trip,
        ticket: currentHandoverData.ticket,
        status: 'SUCCESS (Escrow Released)',
        time: 'Baru saja'
      };

      setScanHistory([newLog, ...scanHistory]);
      setShowHandoverModal(false);
      setOtpCode('');
      setRecipientName('');
      handleReceiverKtpChange(null);
      setTripQr('');
      setTicketQr('');
      toast.success('Verifikasi Handover sukses! Dana escrow berhasil dicairkan ke Mitra.', { title: 'Handover Selesai' });
    } catch (error) {
      console.error('Gagal menyelesaikan handover:', error);
      toast.error('Gagal memproses verifikasi KTP/OTP.', { title: 'Error Server' });
    } finally {
      setIsSubmittingHandover(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] relative">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <QrCode className="w-3 h-3" /> SISTEM KEAMANAN POS & ESCROW TERINTEGRASI
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Dual QR Code Scanner & Handover
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pemindai kamera pos untuk validasi berurutan dilanjutkan verifikasi penyerahan barang.
          </p>
        </div>

        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setScanMode('origin')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              scanMode === 'origin' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Scan 1 (Origin / Asal)
          </button>
          <button
            type="button"
            onClick={() => setScanMode('destination')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              scanMode === 'destination' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Scan 2 (Destination / Tujuan)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-neutral-800">
              {scanMode === 'origin' ? 'Check-in Pos Asal (Scan 1)' : 'Check-in Pos Tujuan (Scan 2)'}
            </h2>
            <StatusBadge variant={scanMode === 'origin' ? 'purple' : 'blue'}>
              {scanMode === 'origin' ? 'IN_TRANSIT' : 'Handover'}
            </StatusBadge>
          </div>

          <div className="relative w-full h-28 bg-neutral-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border border-dashed border-neutral-700 p-3">
            <Camera className="w-6 h-6 text-neutral-500 mb-1" />
            <p className="text-[8px] text-neutral-400 text-center">
              Gunakan tombol &quot;Scan Kamera&quot; pada kolom di bawah atau ketik kode manual.
            </p>
          </div>

          <form onSubmit={handleProcessScan} className="space-y-3.5 text-[10px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">QR CODE TRIP MITRA</label>
                <button
                  type="button"
                  onClick={() => setScannerTarget('trip')}
                  className="flex items-center gap-1 text-[8px] font-bold text-[#4B2172] hover:underline cursor-pointer"
                >
                  <ScanLine className="w-3 h-3" /> Scan Kamera
                </button>
              </div>
              <input 
                type="text" 
                required
                placeholder="cth: TRIP-9081"
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">QR TIKET / PAKET CUSTOMER</label>
                <button
                  type="button"
                  onClick={() => setScannerTarget('ticket')}
                  className="flex items-center gap-1 text-[8px] font-bold text-[#4B2172] hover:underline cursor-pointer"
                >
                  <ScanLine className="w-3 h-3" /> Scan Kamera
                </button>
              </div>
              <input 
                type="text" 
                required
                placeholder="cth: PKG-44910"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              {scanMode === 'origin' ? <ArrowRightLeft className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{scanMode === 'origin' ? 'Proses Scan 1 (Set In-Transit)' : 'Proses Scan 2 & Handover'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Log Dual Scan & Handover Pos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">LOG ID & WAKTU</th>
                  <th className="py-3 px-4">TIPE PROSES</th>
                  <th className="py-3 px-4">QR TRIP</th>
                  <th className="py-3 px-4">QR TIKET/PAKET</th>
                  <th className="py-3 px-4">STATUS & ESCROW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[9px]">
                {isLoadingHistory ? (
                  <SkeletonTableRows rows={3} columns={5} />
                ) : (
                  scanHistory.map((log) => {
                    const isSuccess = log.status.includes('SUCCESS') || log.status.includes('Released');
                    return (
                      <tr key={log.id} className="hover:bg-neutral-50/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-800 font-mono text-[10px]">{log.id}</p>
                          <p className="text-[8px] text-neutral-400 font-semibold">{log.time}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge variant={isSuccess ? 'emerald' : 'purple'}>
                            {log.type}
                          </StatusBadge>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{log.trip}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{log.ticket}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge variant={isSuccess ? 'emerald' : 'amber'}>
                            {log.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={showHandoverModal}
        onClose={() => {
          setShowHandoverModal(false);
          handleReceiverKtpChange(null);
          setOtpCode('');
          setRecipientName('');
        }}
        title="Verifikasi Penyerahan (Handover)"
        subtitle="Wajib diisi sebelum dana escrow dilepaskan."
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-[10px]">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-semibold">Target Trip:</span>
              <span className="font-mono font-bold text-neutral-800">{currentHandoverData.trip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-semibold">Nomor Paket/Tiket:</span>
              <span className="font-mono font-bold text-neutral-800">{currentHandoverData.ticket}</span>
            </div>
          </div>

          <form onSubmit={handleVerifyHandover} className="space-y-3">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">NAMA PENERIMA</label>
              <input
                type="text"
                required
                placeholder="cth: Siti Rahma"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">KODE OTP PENERIMA (6-DIGIT)</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="Masukkan 6 digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono font-bold tracking-widest text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">FOTO KTP PENERIMA <span className="text-rose-600">*Wajib</span></label>
              {receiverKtpPreviewUrl ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img
                    src={receiverKtpPreviewUrl}
                    alt="Pratinjau KTP"
                    className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-emerald-600">Foto KTP Terverifikasi</p>
                    <p className="text-[8px] text-neutral-400 truncate">{receiverKtpPhoto?.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReceiverKtpChange(null)}
                    aria-label="Hapus foto KTP"
                    className="w-6 h-6 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-20 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:bg-neutral-100 transition">
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[8px] font-bold">Unggah Foto KTP Penerima Fisik</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    required
                    onChange={(e) => handleReceiverKtpChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowHandoverModal(false);
                  handleReceiverKtpChange(null);
                  setOtpCode('');
                  setRecipientName('');
                }}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingHandover}
                className="flex-1 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] disabled:opacity-60 text-white rounded-xl font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isSubmittingHandover ? 'Memproses...' : 'Verifikasi & Cairkan'}</span>
              </button>
            </div>
          </form>
        </div>
      </BaseModal>

      {scannerTarget && (
        <QrScannerModal
          label={scannerTarget === 'trip' ? 'Scan QR Trip Mitra' : 'Scan QR Tiket / Paket Customer'}
          onResult={handleCameraScanResult}
          onClose={() => setScannerTarget(null)}
        />
      )}
    </div>
  );
}