import { useState, useEffect } from 'react';
import { Calendar, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { operatorService } from '../../../services/operatorService';

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsSchedule, setTripsSchedule] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchOperatorData = async () => {
      try {
        if (isMounted) setIsLoadingTrips(true);
        
        // BUG FIX (kebocoran data lintas pos): sebelumnya dipanggil tanpa
        // parameter sama sekali, jadi operator berpotensi melihat trip
        // dari SEMUA pos, bukan cuma pos tempat dia ditugaskan. Sekarang
        // dikirim posId milik operator yang login (lihat user.posId di
        // authService.js) supaya backend bisa menyaringnya.
        const rawData = await operatorService.getTrips(user?.posId ? { posId: user.posId } : {});
        const myPosId = user?.posId ? String(user.posId) : null;

        // BUG FIX (statistik Trip Masuk/Keluar tidak berdasar data asli):
        // sebelumnya `type` ditentukan dari paritas index array hasil fetch
        // (index % 2), bukan dari data trip sesungguhnya — jadi kartu
        // "TOTAL TRIP MASUK POS" / "TOTAL TRIP KELUAR POS" pada dasarnya
        // menampilkan angka acak yang berubah kalau urutan data dari
        // backend berubah, bukan mencerminkan kondisi pos yang sebenarnya.
        // Sekarang arah trip ditentukan dari perbandingan posId pos tempat
        // operator bertugas terhadap origin/destination pickup point trip:
        // trip "Keluar" (berangkat dari pos ini) kalau posId ini adalah
        // pos asal trip, "Masuk" (tiba di pos ini) kalau posId ini adalah
        // pos tujuan trip.
        const getPointId = (point) => (point?.id !== undefined && point?.id !== null ? String(point.id) : null);
        const getTripDirection = (t) => {
          const originId = getPointId(t.originPickupPoint) ?? (t.originPointId != null ? String(t.originPointId) : null);
          const destinationId = getPointId(t.destinationPickupPoint) ?? (t.destinationPointId != null ? String(t.destinationPointId) : null);

          if (myPosId && originId === myPosId) return 'Keluar';
          if (myPosId && destinationId === myPosId) return 'Masuk';
          // Fallback kalau posId operator belum diketahui atau data trip
          // tidak membawa origin/destination — pakai status sebagai sinyal
          // terbaik berikutnya (trip yang sudah 'in_transit' dianggap baru
          // saja berangkat/Keluar dari pos ini, sisanya dianggap Masuk).
          return t.status === 'in_transit' ? 'Keluar' : 'Masuk';
        };

        const formatted = rawData.map((t, index) => ({
          id: String(t.id || `TRIP-${index + 9080}`),
          type: getTripDirection(t),
          partnerName: t.driver?.name || t.mitraName || 'Driver Mitra',
          service: t.serviceType || 'Ride / Transportasi',
          plateNumber: t.vehicle?.plateNumber || 'AD 1234 XY',
          time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '09:30 WIB',
          status: t.status === 'in_transit' ? 'Dalam Perjalanan' : 'Tiba di Pos',
          notes: t.notes || 'Aktivitas operasional pos'
        }));

        if (isMounted) {
          setTripsSchedule(formatted);
        }
      } catch (error) {
        console.error('Gagal mengambil data operasional pos:', error);
        setTripsSchedule([]);
      } finally {
        if (isMounted) {
          setIsLoadingTrips(false);
        }
      }
    };

    fetchOperatorData();

    return () => {
      isMounted = false;
    };
  }, [user?.posId]);

  const incomingCount = tripsSchedule.filter((trip) => trip.type === 'Masuk').length;
  const outgoingCount = tripsSchedule.filter((trip) => trip.type === 'Keluar').length;

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              POS OPERASIONAL WILAYAH | {user?.name ? user.name.toUpperCase() : 'OPERATOR POS'}
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Dashboard Operasional Pos
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pantau jadwal trip mitra yang masuk dan keluar di pos Anda hari ini dari database server.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#4B2172]/10 border border-[#4B2172]/20 rounded-full shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#4B2172] text-white flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#4B2172] uppercase tracking-wider">TANGGAL HARI INI</p>
            <p className="text-[10px] font-bold text-neutral-800">{todayLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="TOTAL TRIP MASUK POS"
          value={`${incomingCount} Trip`}
          subtitle="Jadwal aktif hari ini"
          icon={ArrowDownLeft}
        />
        <StatCard
          title="TOTAL TRIP KELUAR POS"
          value={`${outgoingCount} Trip`}
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
                      description="Belum ada trip mitra di database yang dijadwalkan masuk atau keluar."
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