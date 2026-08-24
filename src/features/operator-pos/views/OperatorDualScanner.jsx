import { useState } from 'react';
import { QrCode, Camera, ArrowRightLeft, CheckCircle2, ShieldCheck, Lock, Unlock, KeyRound, UserCheck, ScanLine, Upload, X as XIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import QrScannerModal from '../../../components/ui/QrScannerModal';

export default function OperatorDualScanner() {
  const toast = useToast();
  const [scanMode, setScanMode] = useState('origin'); // 'origin' (Scan 1) atau 'destination' (Scan 2)
  
  // State Input Form Simulasi Scanner
  const [tripQr, setTripQr] = useState('');
  const [ticketQr, setTicketQr] = useState('');
  
  // State untuk Modal Handover Verification (Memperbaiki Cacat Logika Escrow)
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentHandoverData, setCurrentHandoverData] = useState({ trip: '', ticket: '' });
  const [otpCode, setOtpCode] = useState('');

  // FIX: Foto KTP penerima sebelumnya cuma kotak dekoratif (tidak ada <input
  // type="file">, tidak pernah divalidasi) — operator bisa mencairkan escrow
  // tanpa benar-benar mengunggah foto KTP walau UI menyebutnya wajib.
  // Sekarang benar-benar berupa input file dan wajib diisi sebelum submit.
  const [receiverKtpPhoto, setReceiverKtpPhoto] = useState(null);
  const [receiverKtpPreviewUrl, setReceiverKtpPreviewUrl] = useState(null);
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);

  const handleReceiverKtpChange = (file) => {
    setReceiverKtpPhoto(file || null);
    setReceiverKtpPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  // Target field mana yang sedang diisi oleh pemindai kamera: 'trip' | 'ticket' | null (modal tertutup)
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
  
  // Riwayat Scan
  const [scanHistory, setScanHistory] = useState([
    { id: 'LOG-881', type: 'Handover & Escrow Released', trip: 'TRIP-9081', ticket: 'PKG-44910', status: 'SUCCESS (Escrow Released)', time: '11:30 WIB' },
    { id: 'LOG-880', type: 'Scan 1 (Origin)', trip: 'TRIP-9082', ticket: 'PKG-44911', status: 'IN_TRANSIT', time: '10:00 WIB' }
  ]);

  const handleProcessScan = (e) => {
    e.preventDefault();
    if (!tripQr || !ticketQr) {
      toast.warning('Mohon pastikan QR Trip Mitra dan QR Tiket/Paket Customer telah terisi!', { title: 'Data Belum Lengkap' });
      return;
    }

    if (scanMode === 'origin') {
      const newLog = {
        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
        type: 'Scan 1 (Origin)',
        trip: tripQr,
        ticket: ticketQr,
        status: 'IN_TRANSIT (Berangkat)',
        time: 'Baru saja'
      };
      setScanHistory([newLog, ...scanHistory]);
      toast.success('Scan 1 berhasil! Status trip diperbarui menjadi IN_TRANSIT.', { title: 'Scan Berhasil' });
      setTripQr('');
      setTicketQr('');
    } else {
      // PERBAIKAN LOGIKA: Scan 2 tidak langsung melepas escrow, melainkan memicu Handover Verification (OTP & KTP)
      setCurrentHandoverData({ trip: tripQr, ticket: ticketQr });
      setOtpCode('');
      handleReceiverKtpChange(null);
      setShowHandoverModal(true);
    }
  };

  const handleVerifyHandover = (e) => {
    e.preventDefault();
    if (isSubmittingHandover) return; // cegah submit ganda

    if (!otpCode || otpCode.length < 6) {
      toast.warning('Masukkan Kode OTP 6-digit penerima dengan benar!', { title: 'OTP Tidak Valid' });
      return;
    }

    // FIX: foto KTP penerima sekarang benar-benar wajib sebelum escrow bisa dicairkan.
    if (!receiverKtpPhoto) {
      toast.warning('Unggah foto KTP penerima terlebih dahulu sebelum melanjutkan!', { title: 'Foto KTP Belum Diunggah' });
      return;
    }

    setIsSubmittingHandover(true);

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
    handleReceiverKtpChange(null);
    setTripQr('');
    setTicketQr('');
    setIsSubmittingHandover(false);
    toast.success('Verifikasi Handover sukses (OTP & KTP terverifikasi)! Dana escrow berhasil dicairkan ke Mitra.', { title: 'Handover Selesai' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-4 sm:p-6 lg:p-8 relative">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-operator font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <QrCode className="w-3.5 h-3.5" /> Sistem Keamanan Pos & Escrow Terintegrasi
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Dual QR Code Scanner & Handover</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Pemindai kamera pos untuk validasi berurutan dilanjutkan verifikasi penyerahan barang.</p>
        </div>

        {/* Tab Pemilih Mode Scan */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setScanMode('origin')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              scanMode === 'origin' ? 'bg-brand-operator text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Scan 1 (Origin / Asal)
          </button>
          <button
            onClick={() => setScanMode('destination')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              scanMode === 'destination' ? 'bg-brand-operator text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Scan 2 (Destination / Tujuan)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Simulasi Kamera & Form Input QR */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-neutral-900">
              {scanMode === 'origin' ? 'Check-in Pos Asal (Scan 1)' : 'Check-in Pos Tujuan (Scan 2)'}
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${scanMode === 'origin' ? 'bg-pink-50 text-brand-operator' : 'bg-blue-50 text-blue-700'}`}>
              {scanMode === 'origin' ? 'Triggers: IN_TRANSIT' : 'Triggers: Handover Verification'}
            </span>
          </div>

          {/* Ringkasan status kamera + tombol buka pemindai */}
          <div className="relative w-full h-32 bg-neutral-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white mb-4 border-2 border-dashed border-neutral-700">
            <Camera className="w-8 h-8 text-neutral-500 mb-2" />
            <p className="text-[10px] text-neutral-500 text-center px-4">
              Gunakan tombol &quot;Scan Kamera&quot; di tiap kolom di bawah, atau ketik manual.
            </p>
          </div>

          <form onSubmit={handleProcessScan} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-600">QR CODE TRIP MITRA</label>
                <button
                  type="button"
                  onClick={() => setScannerTarget('trip')}
                  className="flex items-center gap-1 text-[10px] font-extrabold text-brand-operator hover:text-brand-magenta-dark transition cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5" /> Scan Kamera
                </button>
              </div>
              <input 
                type="text" 
                required
                placeholder="cth: TRIP-9081"
                value={tripQr}
                onChange={(e) => setTripQr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-operator font-mono font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-neutral-600">QR TIKET / PAKET CUSTOMER</label>
                <button
                  type="button"
                  onClick={() => setScannerTarget('ticket')}
                  className="flex items-center gap-1 text-[10px] font-extrabold text-brand-operator hover:text-brand-magenta-dark transition cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5" /> Scan Kamera
                </button>
              </div>
              <input 
                type="text" 
                required
                placeholder="cth: PKG-44910"
                value={ticketQr}
                onChange={(e) => setTicketQr(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-operator font-mono font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-brand-operator hover:bg-brand-magenta-dark text-white font-bold rounded-xl shadow-lg shadow-brand-operator/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {scanMode === 'origin' ? <ArrowRightLeft className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{scanMode === 'origin' ? 'Proses Scan 1 (Set In-Transit)' : 'Proses Scan 2 & Lanjut Handover'}</span>
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Dual Scan */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Riwayat Log Dual Scan & Handover Pos</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Catatan seluruh pemindaian trip, pencocokan paket, dan pelepasan escrow aman.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-3">LOG ID & WAKTU</th>
                  <th className="py-4 px-3">TIPE PROSES</th>
                  <th className="py-4 px-3">QR TRIP</th>
                  <th className="py-4 px-3">QR TIKET/PAKET</th>
                  <th className="py-4 px-3">STATUS & ESCROW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
                {scanHistory.map((log) => {
                  const isSuccess = log.status.includes('SUCCESS') || log.status.includes('Released');
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-4 px-3">
                        <p className="font-extrabold text-neutral-900">{log.id}</p>
                        <p className="text-[10px] text-neutral-500 font-semibold">{log.time}</p>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-pink-50 text-brand-operator'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-neutral-800">{log.trip}</td>
                      <td className="py-4 px-3 font-mono font-bold text-neutral-800">{log.ticket}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL HANDOVER VERIFICATION (Mencegah Pencairan Dini / Cacat Logika Escrow) */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-brand-operator flex items-center justify-center font-extrabold border border-pink-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">Verifikasi Penyerahan (Handover)</h3>
                  <p className="text-[11px] text-neutral-500">Wajib diisi sebelum dana escrow dilepaskan ke mitra.</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Target Trip:</span>
                <span className="font-mono font-bold text-neutral-800">{currentHandoverData.trip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Nomor Paket/Tiket:</span>
                <span className="font-mono font-bold text-neutral-800">{currentHandoverData.ticket}</span>
              </div>
            </div>

            <form onSubmit={handleVerifyHandover} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 mb-1">KODE OTP PENERIMA (6-DIGIT)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="Masukkan 6 digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-operator font-mono font-bold tracking-widest text-sm"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Kode OTP dikirimkan otomatis ke aplikasi penerima paket.</p>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 mb-1">VALIDASI FOTO KTP PENERIMA <span className="text-brand-operator">*Wajib</span></label>
                {receiverKtpPreviewUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                    <img
                      src={receiverKtpPreviewUrl}
                      alt="Pratinjau foto KTP penerima"
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-emerald-600">Foto KTP siap diverifikasi</p>
                      <p className="text-[10px] text-neutral-500 truncate">{receiverKtpPhoto?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReceiverKtpChange(null)}
                      aria-label="Hapus foto KTP"
                      className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-24 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-500 cursor-pointer hover:bg-neutral-50 transition">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Ambil / Unggah Foto KTP Penerima Fisik</span>
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowHandoverModal(false);
                    handleReceiverKtpChange(null);
                    setOtpCode('');
                  }}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHandover}
                  className="flex-1 py-3 bg-brand-operator hover:bg-brand-magenta-dark disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-brand-operator/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isSubmittingHandover ? 'Memproses...' : 'Verifikasi & Cairkan Escrow'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PEMINDAI KAMERA QR (menggantikan kotak simulasi statis) */}
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