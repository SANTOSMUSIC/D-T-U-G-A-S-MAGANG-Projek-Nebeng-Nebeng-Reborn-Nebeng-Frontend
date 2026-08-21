import { useState, useEffect } from 'react';
import { MapPin, Compass, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function AdminRegionalDashboard() {
  const toast = useToast();
  const [isLoadingDisrupted, setIsLoadingDisrupted] = useState(true);
  // State untuk daftar Trip Disrupted yang memerlukan penanganan kendala rute
  const [disruptedTrips, setDisruptedTrips] = useState([
    { 
      id: 'TRIP-701', 
      origin: 'Solo (Pos Pusat)', 
      destination: 'Yogyakarta', 
      mitra: 'Budi Santoso', 
      vehicle: 'Motor (AD 1234 XX)', 
      issue: 'Kendaraan Mogok / Mesin Rusak', 
      location: 'Km 15 Jalur Solo-Jogja', 
      time: '15 menit lalu' 
    },
    { 
      id: 'TRIP-804', 
      origin: 'Solo', 
      destination: 'Semarang', 
      mitra: 'Siti Aminah', 
      vehicle: 'Mobil (H 5678 YY)', 
      issue: 'Ban Bocor / Kempes', 
      location: ' Bypass Bawen', 
      time: '40 menit lalu' 
    }
  ]);

  // Statistik khusus wilayah operasional
  const regionalStats = [
    {
      title: 'Jumlah Pos Aktif',
      value: '14 Pos',
      change: '+2 pos baru bulan ini',
      isPositive: true,
      icon: MapPin,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      title: 'Trip Berangkat / Tiba',
      value: '42 Trip',
      change: '18 berangkat, 24 tiba hari ini',
      isPositive: true,
      icon: Compass,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Trip Disrupted (Kendala)',
      value: `${disruptedTrips.length} Trip`,
      change: disruptedTrips.length > 0 ? 'Butuh Penanganan Rute' : 'Aman Lancar',
      isPositive: disruptedTrips.length === 0,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700 border-red-100',
    },
    {
      title: 'Antrean Verifikasi',
      value: '5 Berkas',
      change: 'Menunggu review KTP & Face ID',
      isPositive: false,
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ];

  const recentRegionalActivities = [
    { id: 1, text: 'Pos Mitra Solo Grand Mall melaporkan 12 paket masuk.', time: '10 menit lalu', type: 'Pos' },
    { id: 2, text: 'Trip TRIP-901 (Solo → Jogja) berhasil berangkat dari pos.', time: '25 menit lalu', type: 'Trip' },
    { id: 3, text: 'Verifikasi berkas kurir atas nama Agus Setiawan disetujui.', time: '1 jam lalu', type: 'Verifikasi' },
    { id: '4', text: 'Transaksi lokal senilai Rp 145.000 tercatat di Pos Pasar Klewer.', time: '2 jam lalu', type: 'Transaksi' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingDisrupted(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Handler untuk menyelesaikan penanganan kendala trip yang terganggu
  const handleResolveDisruptedTrip = (tripId) => {
    setDisruptedTrips(disruptedTrips.filter(t => t.id !== tripId));
    toast.success(`Penanganan untuk Trip ${tripId} telah diselesaikan dan rute dinyatakan normal kembali.`, { title: 'Trip Dipulihkan' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" /> Portal Admin Regional
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Dashboard Wilayah Operasional</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Pemantauan menyeluruh pos mitra, arus trip, status gangguan rute, dan verifikasi pengguna wilayah.</p>
        </div>
        <div className="flex items-center gap-3 bg-purple-50 px-4 py-3 rounded-2xl border border-purple-100">
          <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider">WILAYAH AKTIF</p>
            <p className="text-xs font-extrabold text-neutral-900 mt-0.5">Jawa Tengah - Surakarta & Sekitarnya</p>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utama (Termasuk Statistik Trip Disrupted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {regionalStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {stat.change}
                </span>
              </div>
              <h2 className="text-neutral-500 text-xs font-extrabold uppercase tracking-wider">{stat.title}</h2>
              <p className="text-2xl font-extrabold text-neutral-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* WIDGET PEMANTAUAN KHUSUS: TRIP DISRUPTED (PENANGANAN KENDALA RUTE) */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">Pemantauan Trip Disrupted (Kendala Rute)</h2>
              <p className="text-xs text-neutral-500">Daftar perjalanan mitra yang mengalami hambatan darurat di lapangan.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-extrabold">
            {disruptedTrips.length} Aktif Membutuhkan Respon
          </span>
        </div>

        {isLoadingDisrupted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : disruptedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disruptedTrips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/40 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">{trip.id}</span>
                    <span className="text-[10px] text-neutral-500 font-medium">Dilaporkan {trip.time}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>{trip.origin}</span>
                    <span className="text-red-600">&rarr;</span>
                    <span>{trip.destination}</span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">Mitra: <strong className="text-neutral-900">{trip.mitra}</strong> ({trip.vehicle})</p>
                  <div className="p-2.5 bg-white rounded-xl border border-red-100 text-xs space-y-1">
                    <p className="text-red-600 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Kendala: {trip.issue}
                    </p>
                    <p className="text-neutral-500 text-[11px]">📍 Posisi: {trip.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-red-200/60">
                  <button 
                    onClick={() => toast.info(`Menghubungkan ke tim pos terdekat & mitra ${trip.mitra} untuk evakuasi rute...`, { title: 'Bantuan Dikirim' })}
                    className="flex-1 py-2 px-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Kirim Bantuan Lapangan
                  </button>
                  <button 
                    onClick={() => handleResolveDisruptedTrip(trip.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan Kendala
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-xs font-extrabold text-neutral-800">Semua Perjalanan Berjalan Normal</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Tidak ada laporan trip disrupted atau kendala rute aktif di wilayah regional ini.</p>
          </div>
        )}
      </div>

      {/* Bagian Aktivitas & Pemantauan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          <h2 className="text-base font-extrabold text-neutral-900 mb-4">Aktivitas & Logistik Regional Terbaru</h2>
          <div className="space-y-4">
            {recentRegionalActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100/60 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {act.type[0]}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-neutral-800">{act.text}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{act.time}</p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5 text-purple-200" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">Kepatuhan & Keamanan</h2>
            <p className="text-purple-200 text-xs mt-2 leading-relaxed">
              Pastikan seluruh antrean verifikasi Face ID dan berkas identitas kurir/pos di wilayah Anda diselesaikan tepat waktu untuk menjaga kualitas layanan operasional.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-200 font-semibold">Tingkat Kepatuhan Pos</span>
              <span className="font-extrabold text-white">98.4%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[98.4%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}