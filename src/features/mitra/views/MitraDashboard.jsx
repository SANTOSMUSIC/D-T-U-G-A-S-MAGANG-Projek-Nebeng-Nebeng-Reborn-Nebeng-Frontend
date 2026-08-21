import React from 'react';
import { Wallet, Star, Calendar, TrendingUp, CheckCircle2, Clock, MapPin, Package } from 'lucide-react';

export default function MitraDashboard() {
  const upcomingTrips = [
    { id: 'TRIP-501', route: 'Solo (Pos Pusat) -> Yogyakarta', time: 'Besok, 08:00 WIB', packages: '4 Paket', status: 'Dijadwalkan' },
    { id: 'TRIP-502', route: 'Solo -> Semarang', time: '20 Jun 2026, 10:30 WIB', packages: '2 Paket', status: 'Menunggu Keberangkatan' },
  ];

  const recentHistory = [
    { id: 'TRIP-498', route: 'Solo -> Surabaya', date: 'Kemarin', earnings: 'Rp 350.000', rating: 5.0, status: 'Selesai' },
    { id: 'TRIP-497', route: 'Solo -> Madiun', date: '16 Jun 2026', earnings: 'Rp 200.000', rating: 4.8, status: 'Selesai' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#196be6] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Mitra Pos Utama Dashboard
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Ringkasan Aktivitas Mitra</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Kelola trip mendatang, pantau riwayat perjalanan, statistik rating, dan total saldo dompet Anda.</p>
        </div>
      </div>

      {/* Grid Statistik Atas (Wallet & Rating) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Saldo Wallet */}
        <div className="bg-gradient-to-br from-[#196be6] to-[#b819b8] text-white p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-blue-100 font-extrabold text-xs uppercase tracking-wider mb-1">Total Saldo Wallet</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Rp 4.850.000</h2>
            <p className="text-[11px] text-blue-100 mt-2 flex items-center gap-1 font-medium">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-white font-bold">Komisi Siap Tarik</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        {/* Statistik Rating */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-neutral-500 font-extrabold text-xs uppercase tracking-wider mb-1">Statistik Rating Mitra</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-3xl font-extrabold text-neutral-900">4.92</h2>
              <div className="flex items-center text-amber-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current text-amber-200" />
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 font-medium">Berdasarkan 128 ulasan pengirim & pos</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <Star className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Bagian Utama: Trip Mendatang & Riwayat Perjalanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ringkasan Trip Mendatang */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#196be6]" /> Ringkasan Trip Mendatang
            </h2>
            <span className="text-xs font-bold text-[#196be6] bg-blue-50 px-3 py-1 rounded-full">2 Aktif</span>
          </div>

          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-neutral-900">{trip.id}</span>
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{trip.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                  <MapPin className="w-4 h-4 text-[#196be6] shrink-0" />
                  <span>{trip.route}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.time}</span>
                  <span className="flex items-center gap-1 font-bold text-neutral-700"><Package className="w-3.5 h-3.5 text-[#196be6]" /> {trip.packages}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Riwayat Perjalanan */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Riwayat Perjalanan
            </h2>
            <span className="text-xs font-bold text-neutral-500">Terakhir Selesai</span>
          </div>

          <div className="space-y-4">
            {recentHistory.map((history) => (
              <div key={history.id} className="p-4 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50/60 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-neutral-900">{history.id}</span>
                  <span className="text-xs font-extrabold text-emerald-600">{history.earnings}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>{history.route}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  <span>{history.date}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{history.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}