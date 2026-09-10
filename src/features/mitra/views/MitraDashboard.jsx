import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Star, Calendar, TrendingUp, CheckCircle2, Clock, MapPin, Package, ArrowRight } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import apiClient from '../../../services/apiClient';

const formatRupiah = (value) =>
  `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;

function formatTripSchedule(dateStr, timeStr) {
  if (!dateStr) return '-';
  const tripDate = new Date(`${dateStr.split('T')[0]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((tripDate - today) / 86400000);

  let dayLabel;
  if (diffDays === 0) dayLabel = 'Hari ini';
  else if (diffDays === 1) dayLabel = 'Besok';
  else dayLabel = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${dayLabel}, ${timeStr ? timeStr.split('T')[1]?.substring(0, 5) : '08:00'} WIB`;
}

export default function MitraDashboard() {
  const [trips, setTrips] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, heldEscrowBalance: 0 });
  const [mitraProfile, setMitraProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMitraData = async () => {
      setIsLoading(true);
      try {
        const userRes = await apiClient.get('/auth/me');
        const currentUserId = String(userRes.data?.id);

        const resTrips = await apiClient.get('/trips');
        const allTrips = resTrips.data?.data || resTrips.data || [];
        const myTrips = allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId);

        const resWallet = await apiClient.get('/wallets/me').catch(() => ({ data: { balance: 0, heldEscrowBalance: 0 } }));

        if (isMounted) {
          setMitraProfile(userRes.data);
          setTrips(myTrips);
          setWallet(resWallet.data || { balance: 0, heldEscrowBalance: 0 });
        }
      } catch (err) {
        console.error('Gagal memuat data dashboard mitra dari server:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMitraData();
    return () => { isMounted = false; };
  }, []);

  const upcomingTrips = trips
    .filter((t) => t.status === 'scheduled' || t.status === 'in_transit')
    .slice(0, 2);

  const recentHistory = trips
    .filter((t) => t.status === 'completed')
    .slice(0, 2);

  const availableBalance = Number(wallet.balance || 0);
  const escrowHold = Number(wallet.heldEscrowBalance || 0);
  const totalWallet = availableBalance + escrowHold;

  // DIPERBAIKI: Mengambil data rating langsung dari respons dinamis backend (/auth/me)
  const ratingValue = mitraProfile?.rating;
  const totalReviews = mitraProfile?.totalReviews || 0;
  
  const ratingDisplay = ratingValue !== null && ratingValue !== undefined ? `${ratingValue} / 5.0` : "Belum ada rating";
  const ratingSubtitle = totalReviews > 0 ? `Berdasarkan ${totalReviews} ulasan perjalanan` : "Belum ada ulasan perjalanan";

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
          value={formatRupiah(totalWallet)}
          subtitle={`${formatRupiah(availableBalance)} siap ditarik, ${formatRupiah(escrowHold)} tertahan (escrow)`}
          icon={Wallet}
        />
        <StatCard
          title="STATISTIK RATING MITRA"
          value={ratingDisplay}
          subtitle={ratingSubtitle}
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
            <Link
              to="/mitra/trip"
              className="text-[9px] font-bold text-[#4B2172] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-[10px] text-neutral-400 p-3">Memuat data trip...</div>
            ) : upcomingTrips.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Ada Trip Mendatang"
                description="Jadwalkan trip baru lewat menu Kelola Trip & Jadwal."
              />
            ) : upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">TRIP-{trip.id}</span>
                  <StatusBadge variant={trip.status === 'in_transit' ? 'amber' : 'purple'}>
                    {trip.status === 'scheduled' ? 'Dijadwalkan' : 'Dalam Perjalanan'}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-[#4B2172] shrink-0" />
                  <span>{trip.originPoint?.name || 'Asal'} &rarr; {trip.destinationPoint?.name || 'Tujuan'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[9px] text-neutral-400 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatTripSchedule(trip.departureDate, trip.departureTime)}</span>
                  <span className="flex items-center gap-1 font-bold text-neutral-700"><Package className="w-2.5 h-2.5 text-[#4B2172]" /> {trip.remainingWeightCapacityKg} Kg Sisa</span>
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
            {isLoading ? (
              <div className="text-[10px] text-neutral-400 p-3">Memuat riwayat...</div>
            ) : recentHistory.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Belum Ada Trip Selesai"
                description="Riwayat akan muncul di sini setelah trip pertama Anda selesai."
              />
            ) : recentHistory.map((history) => (
              <div key={history.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">TRIP-{history.id}</span>
                  <span className="text-[10px] font-bold text-emerald-600">{formatRupiah(history.price)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{history.originPoint?.name || 'Asal'} &rarr; {history.destinationPoint?.name || 'Tujuan'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[9px] text-neutral-400 font-medium">
                  <span>{history.departureDate?.split('T')[0]}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{ratingValue !== null && ratingValue !== undefined ? ratingValue : '5.0'}</span>
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