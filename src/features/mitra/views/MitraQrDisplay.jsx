import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Smartphone, RefreshCw, ShieldCheck, QrCode, AlertCircle } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import { useMitraData } from '../../../hooks/useMitraData';

// NOTE: butuh `npm install qrcode` di project ini. QR kini digenerate
// sepenuhnya di client (canvas), tidak lagi mengirim data rute/kendaraan
// ke layanan pihak ketiga (api.qrserver.com) dan tidak lagi bergantung
// pada koneksi ke server eksternal untuk menampilkan QR.

export default function MitraQrDisplay() {
  const { trips } = useMitraData();
  const activeTrips = trips.filter((t) => t.status === 'Aktif' || t.status === 'In Transit');

  const [selectedTripId, setSelectedTripId] = useState(activeTrips[0]?.id ?? null);
  // Token acak dibuat lewat initializer function useState (lazy init), jadi
  // Math.random() hanya dieksekusi satu kali oleh React saat state pertama
  // kali dibuat — bukan dipanggil langsung di badan komponen tiap render.
  const [dynamicToken, setDynamicToken] = useState(
    () => `TOKEN-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [countdown, setCountdown] = useState(30);
  const [qrError, setQrError] = useState(false);
  const canvasRef = useRef(null);

  // Kalau trip yang sebelumnya dipilih hilang (mis. dibatalkan/selesai),
  // otomatis jatuh balik ke trip aktif pertama yang tersedia (dihitung
  // langsung saat render, tanpa efek, supaya tidak memicu render ganda).
  const current =
    activeTrips.find((t) => t.id === selectedTripId) ?? activeTrips[0] ?? null;

  // Auto-refresh token dinamis setiap 30 detik untuk keamanan.
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setDynamicToken(`TOKEN-${Math.floor(1000 + Math.random() * 9000)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedTripId]);

  // Render QR ke canvas secara lokal setiap kali trip/token berubah.
  useEffect(() => {
    if (!current || !canvasRef.current) return;
    const qrPayload = `ID:${current.id}|Rute:${current.origin}->${current.destination}|Kendaraan:${current.vehicle}|TS:${dynamicToken}`;

    QRCode.toCanvas(canvasRef.current, qrPayload, { width: 160, margin: 1 }, (err) => {
      setQrError(Boolean(err));
    });
  }, [current, dynamicToken]);

  const handleManualRefresh = () => {
    setDynamicToken(`TOKEN-${Math.floor(1000 + Math.random() * 9000)}`);
    setCountdown(30);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> TAMPILAN LAYAR PERANGKAT MITRA
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Digital Dynamic QR Trip Display
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Tunjukkan QR Code dinamis ini kepada Operator Pos saat verifikasi keberangkatan atau kedatangan di pos mitra.
          </p>
        </div>
      </div>

      {activeTrips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <EmptyState
            icon={QrCode}
            title="Belum Ada Trip Aktif"
            description="QR Code hanya tersedia untuk trip berstatus Aktif atau In Transit. Buat trip baru lewat menu Kelola Trip & Jadwal."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-1 space-y-3">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
              <QrCode className="w-3.5 h-3.5 text-[#4B2172]" /> Pilih Trip Aktif
            </h2>
            <div className="space-y-2">
              {activeTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    handleManualRefresh();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedTripId === trip.id 
                      ? 'border-[#4B2172] bg-purple-50/50 shadow-sm' 
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                    <StatusBadge variant={trip.status === 'In Transit' ? 'amber' : 'purple'}>{trip.status}</StatusBadge>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-700">{trip.origin} &rarr; {trip.destination}</p>
                  <p className="text-[8px] text-neutral-400 mt-0.5">{trip.vehicle} • {trip.date} {trip.time} WIB</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-2 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-xs bg-neutral-900 p-5 rounded-2xl text-white shadow-lg border-4 border-neutral-800 relative">
              <div className="flex justify-between items-center text-[8px] text-neutral-500 mb-3 px-1">
                <span>Nebeng App Driver</span>
                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-2.5 h-2.5" /> Secure Token</span>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-inner my-1 flex flex-col items-center">
                <div className="w-40 h-40 bg-white p-1 rounded-lg flex items-center justify-center relative shadow-sm border border-neutral-100">
                  {qrError ? (
                    <div className="flex flex-col items-center gap-1.5 text-rose-600 text-center px-2">
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-[8px] font-bold">Gagal membuat QR. Coba tekan "Perbarui Sekarang".</p>
                    </div>
                  ) : (
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  )}
                </div>
                <p className="text-neutral-900 font-bold text-[12px] font-mono mt-2">{current?.id}</p>
                <p className="text-neutral-400 text-[9px] font-medium">{current?.origin} &rarr; {current?.destination}</p>
              </div>

              <div className="mt-3 bg-white/10 p-2.5 rounded-lg border border-white/10 text-left space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[8px] text-purple-200 font-bold uppercase">Token Keamanan:</p>
                  <span className="text-[8px] font-mono font-bold text-emerald-400">{dynamicToken}</span>
                </div>
                <p className="text-[10px] text-white font-semibold">{current?.date} • {current?.time} WIB</p>
                <p className="text-[9px] text-neutral-300">{current?.vehicle}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[8px] text-emerald-400 font-bold bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Auto-refresh: {countdown}s
                </span>
                <button
                  onClick={handleManualRefresh}
                  className="text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  Perbarui Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}