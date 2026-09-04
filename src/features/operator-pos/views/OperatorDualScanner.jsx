import { useState } from 'react';
import { QrCode, Camera, ArrowRightLeft, ShieldCheck, Unlock, KeyRound, ScanLine } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import QrScannerModal from '../../../components/ui/QrScannerModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { operatorService } from '../../../services/operatorService';

export default function OperatorDualScanner() {
  const toast = useToast();
  const [scanMode, setScanMode] = useState('origin');
  
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  const [posId, setPosId] = useState('1'); // ID Pos default / dinamis operator
  
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentHandoverData, setCurrentHandoverData] = useState({ trip: '', ticket: '' });
  const [otpCode, setOtpCode] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

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

  // 1. Proses Scan 1 (Origin) atau Persiapan Scan 2 (Destination)
  const handleProcessScan = async (e) => {
    e.preventDefault();
    const cleanTrip = tripQr.trim().toUpperCase();
    const cleanTicket = ticketQr.trim().toUpperCase();

    if (!cleanTrip || !cleanTicket) {
      toast.warning('Mohon pastikan QR Trip Mitra dan QR Tiket/Paket Customer telah terisi!', { title: 'Data Belum Lengkap' });
      return;
    }

    if (scanMode === 'origin') {
      try {
        setIsLoadingHistory(true);
        const payload = {
          qrCodeTrip: cleanTrip,
          qrCodeTicket: cleanTicket,
          posId: String(posId),
          scanType: 'checkin_origin'
        };

        const response = await operatorService.scanCheckpoint(payload);

        const newLog = {
          id: response.checkpoint?.id ? String(response.checkpoint.id) : `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'Scan 1 (Origin)',
          trip: cleanTrip,
          ticket: cleanTicket,
          status: 'IN_TRANSIT (Berangkat)',
          time: 'Baru saja'
        };

        setScanHistory([newLog, ...scanHistory]);
        toast.success(response.message || 'Check-in Pos Asal berhasil!', { title: 'Scan Berhasil' });
        setTripQr('');
        setTicketQr('');
      } catch (error) {
        console.error('Gagal memproses scan origin:', error);
        toast.error(error.response?.data?.message || 'Gagal memverifikasi check-in pos asal.', { title: 'Error Server' });
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      // Jika mode destination, buka modal handover untuk memasukkan OTP & verifikasi penyerahan
      setCurrentHandoverData({ trip: cleanTrip, ticket: cleanTicket });
      setOtpCode('');
      setRecipientName('');
      setShowHandoverModal(true);
    }
  };

  // 2. Proses Scan 2 (Destination) & Handover / Release Escrow
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

    try {
      setIsSubmittingHandover(true);

      const payload = {
        qrCodeTrip: currentHandoverData.trip,
        qrCodeTicket: currentHandoverData.ticket,
        posId: String(posId),
        scanType: 'checkin_destination',
        otpClaim: otpCode
      };

      const response = await operatorService.scanCheckpoint(payload);

      const newLog = {
        id: response.checkpoint?.id ? String(response.checkpoint.id) : `LOG-${Math.floor(100 + Math.random() * 900)}`,
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
      setTripQr('');
      setTicketQr('');
      toast.success(response.message || 'Verifikasi Handover sukses! Dana escrow dicairkan ke Mitra.', { title: 'Handover Selesai' });
    } catch (error) {
      console.error('Gagal menyelesaikan handover:', error);
      toast.error(error.response?.data?.message || 'Gagal memproses verifikasi OTP tujuan.', { title: 'Error Server' });
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
            Pemindai pos untuk validasi check-in asal dan pelepasan dana escrow di pos tujuan.
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

          <div className="relative w-full h-24 bg-neutral-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border border-dashed border-neutral-700 p-3">
            <Camera className="w-5 h-5 text-neutral-500 mb-1" />
            <p className="text-[8px] text-neutral-400 text-center">
              Gunakan tombol &quot;Scan Kamera&quot; atau ketik kode QR manual.
            </p>
          </div>

          <form onSubmit={handleProcessScan} className="space-y-3 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">ID POS TEMPAT BERTUGAS</label>
              <input 
                type="text" 
                required
                placeholder="cth: 1"
                value={posId}
                onChange={(e) => setPosId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium"
              />
            </div>

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
                placeholder="cth: TRIP-A2D4CS13"
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
                placeholder="cth: TKT-SDJF12H"
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
              <span>{scanMode === 'origin' ? 'Proses Scan Asal (Check-in Origin)' : 'Lanjut Verifikasi OTP Tujuan'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Log Dual Scan Pos Sesi Ini</h2>
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
                ) : scanHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Belum ada log scan checkpoint yang tercatat pada sesi ini.
                    </td>
                  </tr>
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
          setOtpCode('');
          setRecipientName('');
        }}
        title="Verifikasi Penyerahan & OTP"
        subtitle="Wajib memasukkan OTP klaim penerima untuk melepas dana escrow."
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

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowHandoverModal(false);
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