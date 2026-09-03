import { Link } from 'react-router-dom';
import { Wallet, Star, Calendar, TrendingUp, CheckCircle2, Clock, MapPin, Package, ArrowRight } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import { useMitraData } from '../../../context/MitraDataContext';
import { useAuth } from '../../../context/AuthContext';

// Menghitung label hari ("Hari ini" / "Besok" / tanggal) dari tanggal ISO trip,
// bukan teks statis seperti sebelumnya yang selalu bilang "Besok".
function formatTripSchedule(dateStr, timeStr) {
  const tripDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((tripDate - today) / 86400000);

  let dayLabel;
  if (diffDays === 0) dayLabel = 'Hari ini';
  else if (diffDays === 1) dayLabel = 'Besok';
  else if (diffDays > 1) dayLabel = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  else dayLabel = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return `${dayLabel}, ${timeStr} WIB`;
}

export default function MitraDashboard() {
  const { trips, availableBalance, escrowHold } = useMitraData();
  const { mitraVerificationStatus } = useAuth();

  // FIX (badge status statis): sebelumnya "STATUS MITRA: Aktif &
  // Terverifikasi" selalu tampil apa pun kondisi akunnya, tidak
  // terhubung ke proses verifikasi di MitraOnboarding.jsx sama sekali.
  // Sekarang mengikuti mitraVerificationStatus (unverified/pending/
  // approved/rejected) yang persisten lewat AuthContext.
  const STATUS_META = {
    approved: { label: 'Aktif & Terverifikasi', dotClass: 'bg-emerald-400' },
    pending: { label: 'Menunggu Verifikasi Admin', dotClass: 'bg-amber-400' },
    rejected: { label: 'Verifikasi Ditolak', dotClass: 'bg-rose-400' },
    unverified: { label: 'Belum Verifikasi', dotClass: 'bg-neutral-300' },
  };
  const statusMeta = STATUS_META[mitraVerificationStatus] ?? STATUS_META.unverified;

  const upcomingTrips = trips
    .filter((t) => t.status === 'Aktif' || t.status === 'In Transit')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 2);

  const recentHistory = trips
    .filter((t) => t.status === 'Selesai')
    .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
    .slice(0, 2);

  const totalWallet = availableBalance + escrowHold;

  // FIX (hapus dummy data): sebelumnya rating "4.92 / 5.0" dan "128 ulasan"
  // di-hardcode dan tidak pernah berubah siapa pun mitranya. Rating asli
  // seharusnya berasal dari agregasi model TripReview (schema.prisma) —
  // sementara itu belum diwire ke backend, jadi dihitung dari field
  // `rating` pada trip yang sudah Selesai (kalau ada), dan tampil sebagai
  // "Belum ada rating" kalau belum ada satu pun trip dengan rating.
  const ratedTrips = trips.filter((t) => t.status === 'Selesai' && typeof t.rating === 'number');
  const avgRating = ratedTrips.length > 0
    ? (ratedTrips.reduce((sum, t) => sum + t.rating, 0) / ratedTrips.length).toFixed(2)
    : null;

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
            <p className="text-[10px] font-bold text-neutral-800 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
              {statusMeta.label}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="TOTAL SALDO WALLET"
          value={`Rp ${totalWallet.toLocaleString('id-ID')}`}
          subtitle={`Rp ${availableBalance.toLocaleString('id-ID')} siap ditarik, Rp ${escrowHold.toLocaleString('id-ID')} tertahan (escrow)`}
          icon={Wallet}
        />
        <StatCard
          title="STATISTIK RATING MITRA"
          value={avgRating ? `${avgRating} / 5.0` : 'Belum ada rating'}
          subtitle={ratedTrips.length > 0 ? `Berdasarkan ${ratedTrips.length} ulasan` : 'Rating akan muncul setelah trip pertama diulas'}
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
            {upcomingTrips.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Ada Trip Mendatang"
                description="Jadwalkan trip baru lewat menu Kelola Trip & Jadwal."
              />
            ) : upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                  <StatusBadge variant={trip.status === 'In Transit' ? 'amber' : 'purple'}>{trip.status === 'Aktif' ? 'Dijadwalkan' : trip.status}</StatusBadge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-[#4B2172] shrink-0" />
                  <span>{trip.origin} &rarr; {trip.destination}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-[9px] text-neutral-400 font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatTripSchedule(trip.date, trip.time)}</span>
                  <span className="flex items-center gap-1 font-bold text-neutral-700"><Package className="w-2.5 h-2.5 text-[#4B2172]" /> {trip.luggage} Kg</span>
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
            {recentHistory.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Belum Ada Trip Selesai"
                description="Riwayat akan muncul di sini setelah trip pertama Anda selesai."
              />
            ) : recentHistory.map((history) => (
              <div key={history.id} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-neutral-800 font-mono">{history.id}</span>
                  <span className="text-[10px] font-bold text-emerald-600">Rp {history.estimation.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{history.origin} &rarr; {history.destination}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[9px] text-neutral-400 font-medium">
                  <span>{new Date(`${history.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{history.rating ?? '-'}</span>
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