import { useState, useEffect } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Ticket, QrCode, Clock, ArrowRight, Award, Star, Sparkles, MapPin, KeyRound, RefreshCw, Eye, EyeOff, Search, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useTickets } from '../../../context/TicketsContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import StatCard from '../../../components/ui/StatCard';

// Statuses that a customer is still allowed to self-cancel
const CANCELLABLE_STATUS_TEXT = 'Menunggu Check-in di Pos Asal';

export default function MyTickets() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('aktif');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeModalType, setActiveModalType] = useState(null);
  const [showOtpMap, setShowOtpMap] = useState({});
  const [qrDynamicToken, setQrDynamicToken] = useState('SEC-9081');
  const [qrCountdown, setQrCountdown] = useState(30);
  const [isCancelling, setIsCancelling] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const { tickets: allTickets, updateTicket } = useTickets();

  useEffect(() => {
    let timer;
    if (activeModalType === 'qr') {
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            setQrDynamicToken(`SEC-${Math.floor(1000 + Math.random() * 9000)}`);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeModalType]);

  const toggleOtpVisibility = (ticketId) => {
    setShowOtpMap(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const rewardData = {
    totalPoints: 0,
    history: []
  };

  const filteredTickets = allTickets.filter(ticket => {
    const matchesTab =
      activeTab === 'aktif' ? ticket.status === 'Aktif' :
      activeTab === 'riwayat' ? (ticket.status === 'Selesai' || ticket.status === 'Batal') :
      true;

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      ticket.id.toLowerCase().includes(q) ||
      ticket.from.toLowerCase().includes(q) ||
      ticket.to.toLowerCase().includes(q) ||
      ticket.mitra.toLowerCase().includes(q)
    );
  });

  const handleCancelTicket = () => {
    if (!selectedTicket || isCancelling) return;
    setIsCancelling(true);
    updateTicket(selectedTicket.id, {
      status: 'Batal',
      currentStatusText: 'Dibatalkan oleh Customer'
    });
    setTimeout(() => {
      setIsCancelling(false);
      setActiveModalType(null);
      setSelectedTicket(null);
      toast.success('Tiket berhasil dibatalkan. Dana escrow akan dikembalikan.', { title: 'Tiket Dibatalkan' });
    }, 400);
  };

  const isLoadingTickets = useSimulatedLoading([activeTab], 600);

  const openModal = (ticket, type) => {
    setSelectedTicket(ticket);
    setActiveModalType(type);
    if (type === 'qr') {
      setQrDynamicToken(`SEC-${Math.floor(1000 + Math.random() * 9000)}`);
      setQrCountdown(30);
    }
    if (type === 'review') {
      setRating(ticket.rating || 5);
      setReviewText(ticket.review || '');
    }
  };

  const submitReview = (e) => {
    e.preventDefault();
    updateTicket(selectedTicket.id, { rating, review: reviewText });
    setActiveModalType(null);
    toast.success('Ulasan dan rating berhasil dikirim! Terima kasih.', { title: 'Terkirim' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Ticket className="w-3 h-3" /> TIKET & LIVE DIGITAL QR
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            My Tickets & Live Digital QR
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Tunjukkan QR Code digital di Pos, pantau status real-time, dan kelola Poin Reward Anda.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari No. Tiket, Rute, atau Mitra..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-[10px] font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172] shadow-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('aktif')}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'aktif' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Tiket Aktif ({allTickets.filter(t => t.status === 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'riwayat' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Riwayat Perjalanan ({allTickets.filter(t => t.status !== 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('reward')}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reward' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Poin & Reward ({rewardData.totalPoints} Poin)</span>
        </button>
      </div>

      {activeTab !== 'reward' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoadingTickets ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <StatusBadge variant="purple">{ticket.title}</StatusBadge>
                    <span className="text-[10px] font-mono font-bold text-neutral-800">{ticket.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-800">
                    <span>{ticket.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4B2172]" />
                    <span>{ticket.to}</span>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1 text-[9px]">
                    <p className="font-bold text-neutral-800">
                      Mitra: <span className="font-normal text-neutral-600">{ticket.mitra} ({ticket.vehicle})</span>
                    </p>
                    <p className="font-bold text-neutral-800">
                      Jadwal: <span className="font-normal text-neutral-600">{ticket.schedule}</span>
                    </p>
                    <p className="font-bold text-neutral-800">
                      Detail: <span className="font-normal text-neutral-600">{ticket.detail}</span>
                    </p>
                    {ticket.totalPrice && (
                      <p className="font-bold text-neutral-800">
                        Total Bayar: <span className="font-normal text-emerald-600">{ticket.totalPrice}</span>
                      </p>
                    )}
                  </div>

                  {ticket.otp && (
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-[9px]">
                      <span className="text-[#4B2172] font-bold flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> OTP Penyerahan Barang:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] text-[#4B2172] tracking-wider">
                          {showOtpMap[ticket.id] ? ticket.otp : '******'}
                        </span>
                        <button
                          onClick={() => toggleOtpVisibility(ticket.id)}
                          className="text-[#4B2172] hover:text-[#3a1a59] cursor-pointer"
                        >
                          {showOtpMap[ticket.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <StatusBadge variant={ticket.status === 'Aktif' ? 'emerald' : 'default'}>
                      {ticket.status}
                    </StatusBadge>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(ticket, 'detail')}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[9px] font-bold transition cursor-pointer"
                      >
                        Detail & Tracking
                      </button>

                      {ticket.status === 'Aktif' && ticket.currentStatusText === CANCELLABLE_STATUS_TEXT && (
                        <button
                          onClick={() => openModal(ticket, 'cancel')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Batalkan</span>
                        </button>
                      )}

                      {ticket.status === 'Aktif' && (
                        <button
                          onClick={() => openModal(ticket, 'qr')}
                          className="px-3 py-1.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pos</span>
                        </button>
                      )}

                      {ticket.status === 'Selesai' && (
                        <button
                          onClick={() => openModal(ticket, 'review')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>{ticket.rating ? `Rating (${ticket.rating})` : 'Beri Ulasan'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white rounded-2xl border border-neutral-200">
              <EmptyState
                icon={searchQuery.trim() ? Search : Clock}
                title={searchQuery.trim() ? 'Tiket Tidak Ditemukan' : 'Belum Ada Tiket'}
                description={searchQuery.trim() ? 'Tidak ada tiket yang cocok dengan pencarian Anda.' : 'Belum ada data perjalanan pada kategori ini.'}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <StatCard
            variant="primary"
            title="LOYALTY REWARD POINTS"
            value={`${rewardData.totalPoints} Poin Tersedia`}
            subtitle="Kumpulkan poin dari setiap perjalanan aman di Pos Mitra!"
            icon={Sparkles}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-800">Riwayat Perolehan & Penukaran Poin</h3>
            <div className="space-y-2">
              {rewardData.history.length === 0 && (
                <p className="text-[10px] text-neutral-400 text-center py-4">Belum ada riwayat poin reward.</p>
              )}
              {rewardData.history.map(item => (
                <div key={item.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between text-[10px]">
                  <div>
                    <p className="font-bold text-neutral-800">{item.title}</p>
                    <p className="text-[8px] text-neutral-400">{item.desc} • {item.date}</p>
                  </div>
                  <span className={`font-bold font-mono text-[11px] ${item.points.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BaseModal
        isOpen={Boolean(selectedTicket && activeModalType === 'qr')}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.title}
        subtitle="Live Digital Dynamic QR Pos"
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-3">
          <div className="w-40 h-40 bg-white rounded-xl mx-auto flex items-center justify-center border border-neutral-200 p-2 shadow-sm">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NEBENG-${selectedTicket?.id}-${qrDynamicToken}`} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-[9px] font-mono font-bold text-neutral-600 bg-neutral-50 py-1 px-2.5 rounded-lg border border-neutral-200">
            NEBENG-{selectedTicket?.id}-{qrDynamicToken}
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[8px] text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
            <RefreshCw size={11} className="animate-spin" /> Auto-refresh QR: {qrCountdown} detik
          </div>

          <button
            onClick={() => setSelectedTicket(null)}
            className="w-full py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[10px] font-bold transition cursor-pointer shadow-sm"
          >
            Tutup
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(selectedTicket && activeModalType === 'detail')}
        onClose={() => setSelectedTicket(null)}
        title={`Detail Tiket: ${selectedTicket?.id}`}
        subtitle={selectedTicket?.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-[10px]">
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
            <p className="text-neutral-500">Rute: <strong className="text-neutral-800">{selectedTicket?.from} ➔ {selectedTicket?.to}</strong></p>
            <p className="text-neutral-500">Mitra: <strong className="text-neutral-800">{selectedTicket?.mitra}</strong> ({selectedTicket?.vehicle})</p>
            <p className="text-neutral-500">Detail: <strong className="text-neutral-800">{selectedTicket?.detail}</strong></p>
            {selectedTicket?.totalPrice && (
              <p className="text-neutral-500">Total Bayar: <strong className="text-emerald-600">{selectedTicket.totalPrice}</strong></p>
            )}
            {selectedTicket?.otp && (
              <p className="text-neutral-500">OTP Penyerahan Barang: <strong className="text-[#4B2172] font-mono text-[11px]">{selectedTicket.otp}</strong></p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-neutral-800">Status Tracking Perjalanan</h4>
            <div className="space-y-2 border-l-2 border-purple-200 pl-3 ml-1">
              {selectedTicket?.trackingLogs?.map((log, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full absolute -left-[17px] top-0.5 ${log.completed ? 'bg-[#4B2172]' : 'bg-neutral-300'}`} />
                  <p className={`font-bold ${log.completed ? 'text-neutral-800' : 'text-neutral-400'}`}>{log.status}</p>
                  <p className="text-[8px] text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {log.location} • {log.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSelectedTicket(null)}
            className="w-full py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(selectedTicket && activeModalType === 'review')}
        onClose={() => setSelectedTicket(null)}
        title="Beri Ulasan Perjalanan"
        subtitle={`Tiket ${selectedTicket?.id}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={submitReview} className="space-y-3.5 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pilih Rating</label>
            <div className="flex gap-2 justify-center py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="cursor-pointer"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Catatan Ulasan</label>
            <textarea
              rows="3"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Bagikan pengalaman Anda mengemudi bersama Mitra Pos..."
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#4B2172] resize-none"
            ></textarea>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition cursor-pointer shadow-sm"
            >
              Kirim Ulasan
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(selectedTicket && activeModalType === 'cancel')}
        onClose={() => { if (!isCancelling) setSelectedTicket(null); }}
        title="Batalkan Tiket"
        subtitle={selectedTicket?.id}
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-4 text-[10px]">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <p className="text-neutral-500">
            Yakin ingin membatalkan perjalanan <strong className="text-neutral-800">{selectedTicket?.from} → {selectedTicket?.to}</strong>? Dana escrow yang sudah dibayarkan akan dikembalikan ke wallet Anda.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTicket(null)}
              disabled={isCancelling}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer disabled:opacity-50"
            >
              Tidak, Kembali
            </button>
            <button
              onClick={handleCancelTicket}
              disabled={isCancelling}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-70"
            >
              {isCancelling ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Ya, Batalkan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}