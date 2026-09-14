import { useState, useEffect } from 'react';
import {
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import { useAuth } from '../../../context/AuthContext';
import { operatorService } from '../../../services/operatorService';

const PRIMARY_COLOR = '#4FBF99';
const PRIMARY_ACCENT = '#66CDAA';

export default function OperatorDashboard() {
  const { user } = useAuth();

  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsSchedule, setTripsSchedule] = useState([]);

  // State Paginasi & Trigger Refetch
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Ambil posId operator
  const operatorPosId =
    user?.assignedPickupPointId || user?.posId || user?.pickupPointId;

  // Handler Manual Refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const loadOperatorData = async () => {
      setIsLoadingTrips(true);
      try {
        const result = await operatorService.getTrips({
          page: currentPage,
          limit: limit,
          posId: operatorPosId,
        });

        if (!isMounted) return;

        const formatted = (result.data || []).map((t) => {
          const timeSource = t.departureTime || t.departureDate || t.createdAt;
          let formattedTime = '-';

          if (timeSource) {
            const d = new Date(timeSource);
            if (!isNaN(d.getTime())) {
              formattedTime =
                d.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) + ' WIB';
            }
          }

          const isIncoming = operatorPosId
            ? String(t.destinationPointId) === String(operatorPosId)
            : false;

          return {
            id: String(t.id),
            type: isIncoming ? 'Masuk' : 'Keluar',
            partnerName:
              t.mitra?.name || t.driver?.name || t.mitraName || 'Mitra Pos',
            service: t.vehicleType === 'mobil' ? 'Mobil' : 'Motor',
            plateNumber: t.vehicle?.plateNumber || '-',
            time: formattedTime,
            status: t.status || 'scheduled',
            originName: t.originPoint?.name || 'Pos Asal',
            destName: t.destinationPoint?.name || 'Pos Tujuan',
          };
        });

        setTripsSchedule(formatted);
        if (result.meta) {
          setPaginationMeta(result.meta);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Gagal mengambil data operasional pos:', error);
          setTripsSchedule([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrips(false);
        }
      }
    };

    loadOperatorData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, limit, operatorPosId, refreshTrigger]);

  // Penghitungan statistik dari data di halaman aktif
  const incomingCount = tripsSchedule.filter((t) => t.type === 'Masuk').length;
  const outgoingCount = tripsSchedule.filter((t) => t.type === 'Keluar').length;

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getStatusConfig = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed':
          return {
            label: 'Selesai',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            dot: 'bg-emerald-500',
          };
        case 'in_transit':
        case 'ongoing':
          return {
            label: 'Berjalan',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            dot: 'bg-blue-500 animate-pulse',
          };
        case 'scheduled':
          return {
            label: 'Dijadwalkan',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
          };
        case 'cancelled':
        case 'canceled':
          return {
            label: 'Dibatalkan',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            dot: 'bg-rose-500',
          };
        default:
          return {
            label: status || 'Pending',
            bg: 'bg-neutral-100',
            text: 'text-neutral-600',
            border: 'border-neutral-200',
            dot: 'bg-neutral-400',
          };
      }
    };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: PRIMARY_COLOR }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: PRIMARY_COLOR }}
            >
              POS OPERASIONAL WILAYAH | {user?.name ? user.name.toUpperCase() : 'OPERATOR POS'}
            </span>
          </div>

          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Dashboard Operasional Pos
          </h1>

          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pantau jadwal trip mitra yang masuk dan keluar di pos Anda secara realtime dari server.
          </p>
        </div>

        {/* Tanggal & Tombol Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isLoadingTrips}
            title="Muat ulang data"
            className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTrips ? 'animate-spin' : ''}`} />
          </button>

          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full"
            style={{
              backgroundColor: `${PRIMARY_ACCENT}1A`,
              border: `1px solid ${PRIMARY_ACCENT}33`,
            }}
          >
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold shrink-0"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: PRIMARY_COLOR }}
              >
                TANGGAL HARI INI
              </p>
              <p className="text-[10px] font-bold text-neutral-800">{todayLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="TRIP MASUK (HALAMAN INI)"
          value={`${incomingCount} Trip`}
          subtitle={`Total Keseluruhan: ${paginationMeta.total}`}
          icon={ArrowDownLeft}
        />
        <StatCard
          title="TRIP KELUAR (HALAMAN INI)"
          value={`${outgoingCount} Trip`}
          subtitle={`Total Keseluruhan: ${paginationMeta.total}`}
          icon={ArrowUpRight}
        />
        <StatCard
          title="STATUS OPERASIONAL POS"
          value="Buka / Normal"
          subtitle="Terverifikasi Sistem"
          icon={CheckCircle2}
        />
      </div>

      {/* Tabel Jadwal Trip Terpaginasi */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{
                backgroundColor: `${PRIMARY_ACCENT}1A`,
                color: PRIMARY_COLOR,
              }}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-neutral-800">
                Jadwal Trip Mitra Masuk & Keluar Pos
              </h2>
              <p className="text-[10px] text-neutral-400">
                Data terpaginasi langsung dari server backend (Total: {paginationMeta.total} trip)
              </p>
            </div>
          </div>

          {/* Limit Selector */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-neutral-500 font-medium">Tampilkan per halaman:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-neutral-200 rounded-lg px-2.5 py-1 bg-white text-neutral-700 font-semibold focus:outline-none focus:border-[#4FBF99]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Tabel Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">ID TRIP & WAKTU</th>
                <th className="py-3 px-4">TIPE ARAH</th>
                <th className="py-3 px-4">MITRA & KENDARAAN</th>
                <th className="py-3 px-4">LAYANAN</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">RUTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-[10px]">
              {isLoadingTrips ? (
                <SkeletonTableRows rows={limit} columns={6} />
              ) : tripsSchedule.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Calendar}
                      title="Belum Ada Jadwal Trip"
                      description="Belum ada trip mitra di database yang dijadwalkan untuk pos ini."
                    />
                  </td>
                </tr>
              ) : (
                tripsSchedule.map((trip) => (
                  <tr key={trip.id} className="hover:bg-neutral-50/60 transition border-b border-neutral-100">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-800 font-mono text-[11px]">
                        #{trip.id}
                      </p>
                      <p className="text-[9px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#4FBF99]" />
                        {trip.time}
                      </p>
                    </td>

                    {/* BAGIAN TIPE ARAH DISEMPURNAKAN */}
                    <td className="py-3.5 px-4">
                      {trip.type === 'Masuk' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-purple-600" />
                          Masuk Pos
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
                          <ArrowUpRight className="w-3.5 h-3.5 text-teal-600" />
                          Keluar Pos
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-800">{trip.partnerName}</p>
                      <p className="text-[9px] text-neutral-400 font-mono">{trip.plateNumber}</p>
                    </td>
                    
                    <td className="py-3.5 px-4 font-semibold text-neutral-700">{trip.service}</td>

                    {/* BAGIAN STATUS DISEMPURNAKAN */}
                    <td className="py-3.5 px-4">
                      {(() => {
                        const config = getStatusConfig(trip.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                            {config.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] text-neutral-600 font-medium bg-neutral-100 px-2 py-1 rounded-md">
                        {trip.originName} ➔ {trip.destName}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Paginasi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
          <div>
            Menampilkan data <span className="font-bold text-neutral-800">{tripsSchedule.length}</span> dari total{' '}
            <span className="font-bold text-neutral-800">{paginationMeta.total}</span> data
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || isLoadingTrips}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <span className="font-semibold text-neutral-700 px-2">
              {paginationMeta.page} / {paginationMeta.totalPages || 1}
            </span>
            <button
              disabled={currentPage >= paginationMeta.totalPages || isLoadingTrips}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}