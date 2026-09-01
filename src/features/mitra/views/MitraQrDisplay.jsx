import { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, ShieldCheck, QrCode, Clock } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function MitraQrDisplay() {
  const [selectedTrip, setSelectedTrip] = useState('TRIP-701');
  const [dynamicToken, setDynamicToken] = useState('TOKEN-8819');
  const [countdown, setCountdown] = useState(30);

  const activeTrips = [
    { id: 'TRIP-701', route: 'Solo (Pos Pusat) → Yogyakarta', vehicle: 'Motor (AD 1234 XX)', time: '08:00 WIB, 25 Agu 2026' },
    { id: 'TRIP-702', route: 'Solo → Semarang', vehicle: 'Mobil (H 5678 YZ)', time: '10:00 WIB, 26 Agu 2026' }
  ];

  const current = activeTrips.find(t => t.id === selectedTrip) || activeTrips[0];

  // Auto-Refresh Token Dinamis setiap 30 detik untuk keamanan
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
  }, [selectedTrip]);

  const qrPayload = `ID:${current.id}|Rute:${current.route}|Kendaraan:${current.vehicle}|TS:${dynamicToken}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

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
                  setSelectedTrip(trip.id);
                  handleManualRefresh();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedTrip === trip.id 
                    ? 'border-[#4B2172] bg-purple-50/50 shadow-sm' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                  <StatusBadge variant="purple">Aktif</StatusBadge>
                </div>
                <p className="text-[10px] font-bold text-neutral-700">{trip.route}</p>
                <p className="text-[8px] text-neutral-400 mt-0.5">{trip.vehicle}</p>
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
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code ${current.id}`} 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-neutral-900 font-bold text-[12px] font-mono mt-2">{current.id}</p>
              <p className="text-neutral-400 text-[9px] font-medium">{current.route}</p>
            </div>

            <div className="mt-3 bg-white/10 p-2.5 rounded-lg border border-white/10 text-left space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[8px] text-purple-200 font-bold uppercase">Token Keamanan:</p>
                <span className="text-[8px] font-mono font-bold text-emerald-400">{dynamicToken}</span>
              </div>
              <p className="text-[10px] text-white font-semibold">{current.time}</p>
              <p className="text-[9px] text-neutral-300">{current.vehicle}</p>
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
    </div>
  );
}