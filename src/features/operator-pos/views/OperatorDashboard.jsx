import { useState, useEffect } from 'react';
import { Calendar, ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function OperatorDashboard() {
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsSchedule] = useState([
    {
      id: 'TRIP-9081',
      type: 'Masuk',
      partnerName: 'Budi Santoso',
      service: 'Ride / Transportasi',
      plateNumber: 'AD 1234 XY',
      time: '09:30 WIB',
      status: 'Tiba di Pos',
      notes: 'Penjemputan penumpang reguler Solo Grand Mall.'
    },
    {
      id: 'TRIP-9082',
      type: 'Keluar',
      partnerName: 'Siti Aminah',
      service: 'Kurir / Food',
      plateNumber: 'AD 5678 AB',
      time: '10:15 WIB',
      status: 'Menunggu Keberangkatan',
      notes: 'Pengiriman paket makanan kuliner Solo.'
    },
    {
      id: 'TRIP-9085',
      type: 'Masuk',
      partnerName: 'Joko Widodo',
      service: 'Kurir / Logistik',
      plateNumber: 'H 9876 CD',
      time: '11:00 WIB',
      status: 'Dalam Perjalanan ke Pos',
      notes: 'Transit paket logistik regional Jateng.'
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTrips(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              POS MITRA SOLO GRAND MALL | SHIFT PAGI
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Dashboard Operasional Pos
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pantau jadwal trip mitra yang masuk dan keluar di pos Anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#4B2172]/10 border border-[#4B2172]/20 rounded-full shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#4B2172] uppercase tracking-wider">TANGGAL HARI INI</p>
            <p className="text-[10px] font-bold text-neutral-800">19 Agu 2026</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="TOTAL TRIP MASUK POS"
          value="2 Trip"
          subtitle="Jadwal aktif hari ini"
          icon={ArrowDownLeft}
        />
        <StatCard
          title="TOTAL TRIP KELUAR POS"
          value="1 Trip"
          subtitle="Siap diberangkatkan"
          icon={ArrowUpRight}
        />
        <StatCard
          title="STATUS OPERASIONAL POS"
          value="Buka / Normal"
          subtitle="Terverifikasi Sistem"
          icon={CheckCircle2}
        />
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-[#4B2172] rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">Jadwal Trip Mitra Masuk & Keluar Hari Ini</h2>
              <p className="text-[10px] text-neutral-400">Daftar perjalanan yang dijadwalkan melintasi atau berpusat di pos Anda.</p>
            </div>
          </div>
        </div>

        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingTrips ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : tripsSchedule.length > 0 ? (
            tripsSchedule.map((trip) => (
              <div key={trip.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#4B2172] font-mono">{trip.id}</span>
                  <StatusBadge variant={trip.type === 'Masuk' ? 'purple' : 'blue'}>
                    {trip.type === 'Masuk' ? 'Masuk Pos' : 'Keluar Pos'}
                  </StatusBadge>
                </div>

                <div className="text-[10px] font-bold text-neutral-800">
                  {trip.partnerName} <span className="font-mono text-neutral-400 font-normal">({trip.plateNumber})</span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-neutral-500">
                  <span>Layanan: {trip.service}</span>
                  <span className="font-mono font-semibold text-neutral-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {trip.time}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <StatusBadge variant="neutral">{trip.status}</StatusBadge>
                  <span className="text-[8px] text-neutral-400 italic truncate max-w-[150px]">{trip.notes}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState
                icon={Calendar}
                title="Belum Ada Jadwal Trip"
                description="Belum ada trip mitra yang dijadwalkan masuk atau keluar hari ini."
              />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">ID TRIP & WAKTU</th>
                <th className="py-3 px-4">TIPE ARAH</th>
                <th className="py-3 px-4">MITRA & KENDARAAN</th>
                <th className="py-3 px-4">LAYANAN</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-[9px]">
              {isLoadingTrips ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : tripsSchedule.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Calendar}
                      title="Belum Ada Jadwal Trip"
                      description="Belum ada trip mitra yang dijadwalkan masuk atau keluar hari ini."
                    />
                  </td>
                </tr>
              ) : tripsSchedule.map((trip) => (
                <tr key={trip.id} className="hover:bg-neutral-50/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-neutral-800 font-mono text-[10px]">{trip.id}</p>
                    <p className="text-[8px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-[#4B2172]" /> {trip.time}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge variant={trip.type === 'Masuk' ? 'purple' : 'blue'}>
                      {trip.type === 'Masuk' ? 'Masuk Pos' : 'Keluar Pos'}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-neutral-800">{trip.partnerName}</p>
                    <p className="text-[8px] text-neutral-400 font-mono">{trip.plateNumber}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-700">{trip.service}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge variant="neutral">{trip.status}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[8px] text-neutral-400 italic">{trip.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}