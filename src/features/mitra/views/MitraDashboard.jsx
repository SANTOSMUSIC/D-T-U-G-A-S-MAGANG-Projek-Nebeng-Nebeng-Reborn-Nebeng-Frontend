import { Wallet, Star, Calendar, TrendingUp, CheckCircle2, Clock, MapPin, Package } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function MitraDashboard() {
  const upcomingTrips = [
    { id: 'TRIP-501', route: 'Solo (Pos Pusat) → Yogyakarta', time: 'Besok, 08:00 WIB', packages: '4 Paket', status: 'Dijadwalkan' },
    { id: 'TRIP-502', route: 'Solo → Semarang', time: '20 Jun 2026, 10:30 WIB', packages: '2 Paket', status: 'Menunggu Keberangkatan' },
  ];

  const recentHistory = [
    { id: 'TRIP-498', route: 'Solo → Surabaya', date: 'Kemarin', earnings: 'Rp 350.000', rating: 5.0, status: 'Selesai' },
    { id: 'TRIP-497', route: 'Solo → Madiun', date: '16 Jun 2026', earnings: 'Rp 200.000', rating: 4.8, status: 'Selesai' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> MITRA POS UTAMA DASHBOARD
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Ringkasan Aktivitas Mitra
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Kelola trip mendatang, pantau riwayat perjalanan, statistik rating, dan total saldo dompet Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#4B2172]/10 border border-[#4B2172]/20 rounded-full shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#4B2172] uppercase tracking-wider">STATUS MITRA</p>
            <p className="text-[10px] font-bold text-neutral-800">Aktif & Terverifikasi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="TOTAL SALDO WALLET"
          value="Rp 4.850.000"
          subtitle="Komisi siap ditarik"
          icon={Wallet}
        />
        <StatCard
          title="STATISTIK RATING MITRA"
          value="4.92 / 5.0"
          subtitle="Berdasarkan 128 ulasan"
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-[#4B2172] rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-[14px] font-bold text-neutral-800">Ringkasan Trip Mendatang</h2>
            </div>
            <StatusBadge variant="purple">2 Aktif</StatusBadge>
          </div>

          <div className="space-y-3">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                  <StatusBadge variant="purple">{trip.status}</StatusBadge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-[#4B2172] shrink-0" />
                  <span>{trip.route}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[9px] text-neutral-400 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {trip.time}</span>
                  <span className="flex items-center gap-1 font-bold text-neutral-700"><Package className="w-2.5 h-2.5 text-[#4B2172]" /> {trip.packages}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Perjalanan</h2>
            </div>
            <span className="text-[8px] font-bold text-neutral-400">Terakhir Selesai</span>
          </div>

          <div className="space-y-3">
            {recentHistory.map((history) => (
              <div key={history.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">{history.id}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{history.earnings}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{history.route}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[9px] text-neutral-400 font-medium">
                  <span>{history.date}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-current" />
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