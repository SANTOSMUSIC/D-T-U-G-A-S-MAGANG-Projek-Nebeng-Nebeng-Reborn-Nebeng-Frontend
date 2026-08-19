import React from 'react';
import { MapPin, Compass, CreditCard, ShieldCheck, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminRegionalDashboard() {
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
      title: 'Jumlah Transaksi Lokal',
      value: 'Rp 18.450.000',
      change: '156 total transaksi lokal',
      isPositive: true,
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
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

  return (
    // ml-64 dihapus karena parent layout sudah mengatur posisi konten terhadap sidebar
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" /> Portal Admin Regional
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Dashboard Wilayah Operasional</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Pemantauan menyeluruh pos mitra, arus trip, transaksi lokal, dan verifikasi pengguna wilayah.</p>
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

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {regionalStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {stat.change}
                </span>
              </div>
              <h2 className="text-neutral-400 text-xs font-extrabold uppercase tracking-wider">{stat.title}</h2>
              <p className="text-2xl font-extrabold text-neutral-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
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
                  <p className="text-[10px] text-neutral-400 mt-0.5">{act.time}</p>
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