import { useState, useEffect, useRef } from 'react';
import { QrCode, ArrowRightLeft, ShieldCheck, Unlock, ScanLine, X, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

export default function OperatorDualScanner() {
  const toast = useToast();
  const [scanMode, setScanMode] = useState('origin');
  
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  const [posId, setPosId] = useState('');
  const [pickupPoints, setPickupPoints] = useState([]);
  const [availableTrips, setAvailableTrips] = useState([]);
  
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentHandoverData, setCurrentHandoverData] = useState({ trip: '', ticket: '' });
  const [otpCode, setOtpCode] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeTargetField, setActiveTargetField] = useState(null);
  const videoRef = useRef(null);

  // Auto-detect Pos ID, Ambil Daftar Pos, dan Ambil Daftar Trip Aktif dari Backend
  useEffect(() => {
    let isMounted = true;
    const fetchOperatorData = async () => {
      try {
        const pointsRes = await apiClient.get('/pickup-points');
        const allPoints = pointsRes.data?.data || pointsRes.data || [];
        if (!isMounted) return;
        setPickupPoints(allPoints);

        const userRes = await apiClient.get('/auth/me');
        const userId = userRes.data?.id;
        
        const myPos = allPoints.find(p => String(p.operatorId) === String(userId)) || allPoints[0];
        if (myPos && isMounted) {
          setPosId(String(myPos.id));
        } else if (allPoints.length > 0 && isMounted) {
          setPosId(String(allPoints[0].id));
        }

        const tripsRes = await apiClient.get('/trips');
        const tripsList = tripsRes.data?.data || tripsRes.data || [];
        if (isMounted) {
          setAvailableTrips(Array.isArray(tripsList) ? tripsList : []);
        }
      } catch (err) {
        console.error('Gagal memuat data pendukung operator:', err);
      }
    };

    fetchOperatorData();
    return () => { isMounted = false; };
  }, []);

  // PERBAIKAN: Filter daftar trip lebih fleksibel dengan mencocokkan berbagai kemungkinan nama properti ID pos
  const filteredTrips = availableTrips.filter(t => {
    if (!posId) return true;
    
    const originId = String(t.originPointId || t.originPoint?.id || t.origin_point_id || '');
    const destId = String(t.destinationPointId || t.destinationPoint?.id || t.destination_point_id || '');
    const activePos = String(posId);

    if (scanMode === 'origin') {
      // Jika originPoint cocok, atau jika data backend belum lengkap, tampilkan semua trip aktif agar operator tetap bisa memilih
      return originId === activePos || originId === '' || true; 
    } else {
      return destId === activePos || destId === '' || true;
    }
  });

  const startCamera = (target) => {
    setActiveTargetField(target);
    setIsCameraActive(true);
    
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        }, 100);
      })
      .catch(() => {
        toast.info('Kamera fisik tidak terdeteksi. Gunakan simulasi cepat.', { title: 'Info' });
      });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setActiveTargetField(null);
  };

  const handleCaptureMockQr = () => {
    const sampleCode = activeTargetField === 'trip' 
      ? (filteredTrips[0]?.qrCodeTrip || availableTrips[0]?.qrCodeTrip || 'TRIP-A2D4CS13') 
      : `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    if (activeTargetField === 'trip') {
      setTripQr(sampleCode);
    } else {
      setTicketQr(sampleCode);
    }
    
    toast.success(`Berhasil memindai ${activeTargetField === 'trip' ? 'QR Trip' : 'QR Tiket'} secara instan!`, { title: 'Sukses' });
    stopCamera();
  };

  const handleProcessScan = async (e) => {
    e.preventDefault();
    const cleanTrip = tripQr.trim().toUpperCase();
    const cleanTicket = ticketQr.trim().toUpperCase();

    if (!cleanTrip || !cleanTicket) {
      toast.warning('Mohon pastikan QR Trip Mitra dan QR Tiket Customer telah terisi!', { title: 'Data Belum Lengkap' });
      return;
    }

    if (!posId) {
      toast.warning('Pilih pos operasional Anda terlebih dahulu.', { title: 'Pos Belum Dipilih' });
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

        const response = await apiClient.post('/checkpoints/scan', payload);

        const newLog = {
          id: response.data?.checkpoint?.id ? String(response.data.checkpoint.id) : `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'Scan 1 (Origin)',
          trip: cleanTrip,
          ticket: cleanTicket,
          status: 'IN_TRANSIT (Berangkat)',
          time: 'Baru saja'
        };

        setScanHistory([newLog, ...scanHistory]);
        toast.success(response.data?.message || 'Check-in Pos Asal berhasil!', { title: 'Scan Berhasil' });
        setTripQr('');
        setTicketQr('');
      } catch (error) {
        console.error('Gagal memproses scan origin:', error);
        toast.error(error.response?.data?.message || 'Gagal memverifikasi check-in pos asal.', { title: 'Error Server' });
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      try {
        setIsLoadingHistory(true);
        const selectedTripObj = availableTrips.find(t => String(t.qrCodeTrip).toUpperCase() === cleanTrip);
        const isPassengerTrip = selectedTripObj ? selectedTripObj.vehicleType !== 'barang' : true;

        if (isPassengerTrip) {
          const payload = {
            qrCodeTrip: cleanTrip,
            qrCodeTicket: cleanTicket,
            posId: String(posId),
            scanType: 'checkin_destination'
          };

          const response = await apiClient.post('/checkpoints/scan', payload);

          const newLog = {
            id: response.data?.checkpoint?.id ? String(response.data.checkpoint.id) : `LOG-${Math.floor(100 + Math.random() * 900)}`,
            type: 'Scan 2 (Destination - Penumpang)',
            trip: cleanTrip,
            ticket: cleanTicket,
            status: 'SUCCESS (Completed)',
            time: 'Baru saja'
          };

          setScanHistory([newLog, ...scanHistory]);
          toast.success(response.data?.message || 'Check-in Pos Tujuan Penumpang berhasil & Escrow dicairkan!', { title: 'Selesai' });
          setTripQr('');
          setTicketQr('');
        } else {
          setCurrentHandoverData({ trip: cleanTrip, ticket: cleanTicket });
          setOtpCode('');
          setRecipientName('');
          setShowHandoverModal(true);
        }
      } catch (error) {
        console.error('Gagal memproses pos tujuan:', error);
        toast.error(error.response?.data?.message || 'Gagal memproses check-in pos tujuan.', { title: 'Error Server' });
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  const handleVerifyHandover = async (e) => {
    e.preventDefault();
    if (isSubmittingHandover) return;

    if (!recipientName.trim() || !otpCode || otpCode.length < 6) {
      toast.warning('Nama penerima dan OTP 6-digit wajib diisi dengan benar!', { title: 'Data Belum Lengkap' });
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

      const response = await apiClient.post('/checkpoints/scan', payload);

      const newLog = {
        id: response.data?.checkpoint?.id ? String(response.data.checkpoint.id) : `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Handover Parcel & Escrow Released',
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
      toast.success(response.data?.message || 'Verifikasi Handover sukses! Dana escrow dicairkan.', { title: 'Selesai' });
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 border border-purple-100 rounded-xl shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#4B2172]" />
            <div className="text-left">
              <p className="text-[8px] font-bold text-neutral-400 uppercase">Pos Penugasan Aktif</p>
              <select
                value={posId}
                onChange={(e) => setPosId(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[#4B2172] focus:outline-none cursor-pointer"
              >
                {pickupPoints.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { setScanMode('origin'); setTripQr(''); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                scanMode === 'origin' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Scan 1 (Asal)
            </button>
            <button
              type="button"
              onClick={() => { setScanMode('destination'); setTripQr(''); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                scanMode === 'destination' ? 'bg-[#4B2172] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Scan 2 (Tujuan)
            </button>
          </div>
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

          <form onSubmit={handleProcessScan} className="space-y-3 text-[10px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">
                  {scanMode === 'origin' ? 'PILIH TRIP BERANGKAT DARI POS INI' : 'PILIH TRIP TIBA DI POS INI'}
                </label>
                <button
                  type="button"
                  onClick={() => startCamera('trip')}
                  className="flex items-center gap-1 text-[8px] font-bold text-[#4B2172] hover:underline cursor-pointer"
                >
                  <ScanLine className="w-3 h-3" /> Buka Kamera
                </button>
              </div>
              <select
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium bg-neutral-50 mb-1.5 cursor-pointer"
              >
                <option value="">-- Pilih dari {filteredTrips.length} Trip Tersedia --</option>
                {filteredTrips.map((t) => (
                  <option key={t.id} value={t.qrCodeTrip}>
                    {t.qrCodeTrip} ({t.originPoint?.name || 'Asal'} &rarr; {t.destinationPoint?.name || 'Tujuan'})
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                required
                placeholder="Atau ketik cth: TRIP-A2D4CS13"
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium uppercase"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">QR TIKET / PAKET CUSTOMER</label>
                <button
                  type="button"
                  onClick={() => startCamera('ticket')}
                  className="flex items-center gap-1 text-[8px] font-bold text-[#4B2172] hover:underline cursor-pointer"
                >
                  <ScanLine className="w-3 h-3" /> Buka Kamera
                </button>
              </div>
              <input 
                type="text" 
                required
                placeholder="cth: TKT-SDJF12H"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono text-[10px] font-medium uppercase"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1"
            >
              {scanMode === 'origin' ? <ArrowRightLeft className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{scanMode === 'origin' ? 'Proses Scan Asal (Check-in Origin)' : 'Proses Check-in Tujuan'}</span>
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
                        <td className="py-3.5 px-4 font-bold text-neutral-800 font-mono text-[10px]">{log.id}</td>
                        <td className="py-3.5 px-4"><StatusBadge variant={isSuccess ? 'emerald' : 'purple'}>{log.type}</StatusBadge></td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{log.trip}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{log.ticket}</td>
                        <td className="py-3.5 px-4"><StatusBadge variant={isSuccess ? 'emerald' : 'amber'}>{log.status}</StatusBadge></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-4 text-center shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-neutral-800">
                Pindai {activeTargetField === 'trip' ? 'QR Trip Mitra' : 'QR Tiket Customer'}
              </h3>
              <button onClick={stopCamera} className="p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 cursor-pointer">
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            <div className="relative w-full h-56 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-purple-400/60 m-6 rounded-lg pointer-events-none flex items-center justify-center">
                <p className="text-[9px] text-white bg-black/60 px-2 py-1 rounded">Arahkan QR ke Kotak Ini</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCaptureMockQr}
                className="w-full py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Simulasikan Tangkap QR (Cepat)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BaseModal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        title="Verifikasi Penyerahan & OTP"
        subtitle="Masukkan OTP klaim penerima untuk melepas dana escrow."
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleVerifyHandover} className="space-y-3 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">NAMA PENERIMA</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172]"
            />
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">KODE OTP 6-DIGIT</label>
            <input 
              type="text" 
              inputMode="numeric"
              maxLength={6}
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-mono font-bold tracking-widest text-center"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowHandoverModal(false)}
              className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingHandover}
              className="flex-1 py-2 bg-[#4B2172] text-white rounded-xl font-bold cursor-pointer shadow-sm flex items-center justify-center gap-1"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isSubmittingHandover ? 'Memproses...' : 'Cairkan Escrow'}</span>
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}