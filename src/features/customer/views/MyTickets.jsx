import { useState, useEffect, useRef } from 'react';
import { Ticket, QrCode, Clock, ArrowRight, Award, Star, Sparkles, MapPin, KeyRound, RefreshCw, Eye, EyeOff, Search, XCircle, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import StatCard from '../../../components/ui/StatCard';
import apiClient from '../../../services/apiClient';

const formatRupiah = (value) =>
  `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;

const CANCELLABLE_STATUS_TEXT = 'pending_payment';

export default function MyTickets() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('aktif');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const [rewardSummary, setRewardSummary] = useState({ totalPoints: 0, history: [] });
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeModalType, setActiveModalType] = useState(null);
  const [showOtpMap, setShowOtpMap] = useState({});
  const [qrDynamicToken, setQrDynamicToken] = useState('SEC-9081');
  const [qrCountdown, setQrCountdown] = useState(30);
  const [isCancelling, setIsCancelling] = useState(false);

  const [chatConversationId, setChatConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatBottomRef = useRef(null);

  const conversationIdRef = useRef(chatConversationId);
  useEffect(() => {
    conversationIdRef.current = chatConversationId;
  }, [chatConversationId]);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoadingTickets(true);
      try {
        const res = await apiClient.get('/orders/me');
        if (isMounted) {
          const mappedTickets = (res.data || []).map((order) => {
            const isParcel = order.type === 'parcel';
            const trip = order.trip || {};
            const origin = trip.originPoint?.name || 'Pos Asal';
            const destination = trip.destinationPoint?.name || 'Pos Tujuan';
            const mitraName = trip.mitra?.name || 'Mitra';
            const mitraId = trip.mitraId || trip.mitra?.id || null;
            const vehicleModel = trip.vehicle ? `${trip.vehicle.model} (${trip.vehicle.plateNumber})` : 'Kendaraan Resmi';

            let statusText = 'Aktif';
            let currentStatusText = order.status;
            if (order.status === 'cancelled') {
              statusText = 'Batal';
            } else if (order.status === 'completed') {
              statusText = 'Selesai';
            }

            return {
              id: order.id,
              rawId: order.id,
              tripId: trip.id,
              revieweeId: mitraId,
              customerId: order.customerId,
              type: order.type,
              title: isParcel ? `Nebeng Barang (${order.itemOrders?.[0]?.itemCategory || 'Paket'})` : 'Nebeng Penumpang',
              from: origin,
              to: destination,
              mitra: mitraName,
              vehicle: vehicleModel,
              schedule: `${trip.departureDate?.split('T')[0] || 'Segera'} • Sesuai Jadwal`,
              totalPrice: formatRupiah(order.totalPrice),
              detail: isParcel
                ? `${order.totalItemsCount} Item (${order.totalWeightKg} Kg)`
                : `${order.seatsBooked} Kursi Penumpang`,
              status: statusText,
              currentStatusText: currentStatusText,
              otp: order.otpClaim || null,
              qrCodeTicket: order.qrCodeTicket,
              trackingLogs: [
                { status: 'Pesanan Dibuat & Menunggu Pembayaran', location: origin, time: order.createdAt?.split('T')[0], completed: true, active: true },
                { status: 'Checked-in at Pos Asal', location: origin, time: '-', completed: order.status !== 'pending_payment', active: false },
                { status: 'In Transit', location: 'Dalam Perjalanan', time: '-', completed: order.status === 'completed', active: false },
                { status: 'Arrived at Pos Tujuan', location: destination, time: '-', completed: order.status === 'completed', active: false }
              ]
            };
          });
          setTickets(mappedTickets);
        }
      } catch (err) {
        console.error('Gagal memuat daftar tiket:', err);
        if (isMounted) {
          toast.error('Gagal mengambil data tiket dari server.', { title: 'Error' });
        }
      } finally {
        if (isMounted) setIsLoadingTickets(false);
      }

      setIsLoadingRewards(true);
      try {
        const resReward = await apiClient.get('/rewards/me');
        if (isMounted) {
          setRewardSummary({
            totalPoints: resReward.data.rewardPoints || 0,
            history: resReward.data.history || []
          });
        }
      } catch (err) {
        console.error('Gagal memuat reward:', err);
      } finally {
        if (isMounted) setIsLoadingRewards(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (activeModalType !== 'chat') return;

    let isMounted = true;
    const fetchMessagesPeriodic = async () => {
      const currentId = conversationIdRef.current;
      if (!currentId) return;

      try {
        const resMsg = await apiClient.get(`/chat/conversation/${currentId}/messages`);
        if (isMounted) {
          setChatMessages(resMsg.data || []);
        }
      } catch {
        // Abaikan error saat polling latar belakang
      }
    };

    const interval = setInterval(fetchMessagesPeriodic, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeModalType]);

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

  useEffect(() => {
    if (activeModalType === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeModalType]);

  const toggleOtpVisibility = (ticketId) => {
    setShowOtpMap(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesTab =
      activeTab === 'aktif' ? ticket.status === 'Aktif' :
      activeTab === 'riwayat' ? (ticket.status === 'Selesai' || ticket.status === 'Batal') :
      true;

    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.trim().toLowerCase();
    return (
      String(ticket.id).toLowerCase().includes(q) ||
      ticket.from.toLowerCase().includes(q) ||
      ticket.to.toLowerCase().includes(q) ||
      ticket.mitra.toLowerCase().includes(q)
    );
  });

  const refreshData = async () => {
    try {
      const res = await apiClient.get('/orders/me');
      const mappedTickets = (res.data || []).map((order) => {
        const isParcel = order.type === 'parcel';
        const trip = order.trip || {};
        const origin = trip.originPoint?.name || 'Pos Asal';
        const destination = trip.destinationPoint?.name || 'Pos Tujuan';
        const mitraName = trip.mitra?.name || 'Mitra';
        const mitraId = trip.mitraId || trip.mitra?.id || null;
        const vehicleModel = trip.vehicle ? `${trip.vehicle.model} (${trip.vehicle.plateNumber})` : 'Kendaraan Resmi';

        let statusText = 'Aktif';
        let currentStatusText = order.status;
        if (order.status === 'cancelled') {
          statusText = 'Batal';
        } else if (order.status === 'completed') {
          statusText = 'Selesai';
        }

        return {
          id: order.id,
          rawId: order.id,
          tripId: trip.id,
          revieweeId: mitraId,
          customerId: order.customerId,
          type: order.type,
          title: isParcel ? `Nebeng Barang (${order.itemOrders?.[0]?.itemCategory || 'Paket'})` : 'Nebeng Penumpang',
          from: origin,
          to: destination,
          mitra: mitraName,
          vehicle: vehicleModel,
          schedule: `${trip.departureDate?.split('T')[0] || 'Segera'} • Sesuai Jadwal`,
          totalPrice: formatRupiah(order.totalPrice),
          detail: isParcel
            ? `${order.totalItemsCount} Item (${order.totalWeightKg} Kg)`
            : `${order.seatsBooked} Kursi Penumpang`,
          status: statusText,
          currentStatusText: currentStatusText,
          otp: order.otpClaim || null,
          qrCodeTicket: order.qrCodeTicket,
          trackingLogs: [
            { status: 'Pesanan Dibuat & Menunggu Pembayaran', location: origin, time: order.createdAt?.split('T')[0], completed: true, active: true },
            { status: 'Checked-in at Pos Asal', location: origin, time: '-', completed: order.status !== 'pending_payment', active: false },
            { status: 'In Transit', location: 'Dalam Perjalanan', time: '-', completed: order.status === 'completed', active: false },
            { status: 'Arrived at Pos Tujuan', location: destination, time: '-', completed: order.status === 'completed', active: false }
          ]
        };
      });
      setTickets(mappedTickets);
    } catch (err) {
      console.error('Gagal memperbarui data:', err);
    }
  };

  const handleCancelTicket = async () => {
    if (!selectedTicket || isCancelling) return;
    setIsCancelling(true);
    try {
      await apiClient.patch(`/orders/${selectedTicket.rawId}/cancel`);
      toast.success('Pesanan berhasil dibatalkan dan kuota dikembalikan.', { title: 'Sukses' });
      setActiveModalType(null);
      setSelectedTicket(null);
      refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan.', { title: 'Gagal' });
    } finally {
      setIsCancelling(false);
    }
  };

  const openModal = async (ticket, type) => {
    setSelectedTicket(ticket);
    setActiveModalType(type);

    if (type === 'qr') {
      setQrDynamicToken(`SEC-${Math.floor(1000 + Math.random() * 9000)}`);
      setQrCountdown(30);
    }
    if (type === 'chat') {
      setIsLoadingChat(true);
      setChatMessages([]);
      try {
        const resConv = await apiClient.post('/chat/conversation', {
          tripId: String(ticket.tripId),
          customerId: String(ticket.customerId)
        });

        const convId = resConv.data.id;
        setChatConversationId(convId);

        const resMsg = await apiClient.get(`/chat/conversation/${convId}/messages`);
        setChatMessages(resMsg.data || []);
      } catch (err) {
        console.error('Gagal memuat chat:', err);
        toast.error('Gagal membuka ruang chat dengan mitra.', { title: 'Error' });
      } finally {
        setIsLoadingChat(false);
      }
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !chatConversationId) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      const res = await apiClient.post(`/chat/conversation/${chatConversationId}/messages`, {
        messageText: textToSend
      });
      setChatMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
      toast.error('Gagal mengirim pesan.', { title: 'Error' });
    }
  };

  // DIPERBAIKI: Mengirim ulasan langsung ke backend `/reviews` dengan parameter tripId dan revieweeId
  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedTicket || isSubmittingReview) return;

    try {
      setIsSubmittingReview(true);
      const payload = {
        tripId: String(selectedTicket.tripId),
        revieweeId: String(selectedTicket.revieweeId),
        rating: Number(rating),
        comment: reviewText.trim() || undefined,
      };

      await apiClient.post('/reviews', payload);

      toast.success('Ulasan dan rating berhasil dikirim ke mitra!', { title: 'Sukses' });
      setActiveModalType(null);
      setSelectedTicket(null);
      setReviewText('');
      setRating(5);
      refreshData();
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err);
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan ke server.', { title: 'Error' });
    } finally {
      setIsSubmittingReview(false);
    }
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
            Tunjukkan QR Code digital di Pos, chat langsung dengan Mitra, dan kelola Poin Reward Anda.
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
          Tiket Aktif ({tickets.filter(t => t.status === 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'riwayat' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Riwayat Perjalanan ({tickets.filter(t => t.status !== 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('reward')}
          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reward' ? 'bg-[#4B2172] text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Poin & Reward ({rewardSummary.totalPoints} Poin)</span>
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
                    <span className="text-[10px] font-mono font-bold text-neutral-800">ID: {ticket.id}</span>
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
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 flex-wrap gap-2">
                    <StatusBadge variant={ticket.status === 'Aktif' ? 'emerald' : 'default'}>
                      {ticket.status}
                    </StatusBadge>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => openModal(ticket, 'detail')}
                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[9px] font-bold transition cursor-pointer"
                      >
                        Detail
                      </button>

                      {ticket.status === 'Aktif' && (
                        <button
                          onClick={() => openModal(ticket, 'chat')}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#4B2172] border border-purple-200 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat Mitra</span>
                        </button>
                      )}

                      {ticket.status === 'Aktif' && ticket.currentStatusText === CANCELLABLE_STATUS_TEXT && (
                        <button
                          onClick={() => openModal(ticket, 'cancel')}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Batalkan</span>
                        </button>
                      )}

                      {ticket.status === 'Aktif' && (
                        <button
                          onClick={() => openModal(ticket, 'qr')}
                          className="px-2.5 py-1.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pos</span>
                        </button>
                      )}

                      {ticket.status === 'Selesai' && (
                        <button
                          onClick={() => openModal(ticket, 'review')}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>Ulasan</span>
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
            value={`${rewardSummary.totalPoints} Poin Tersedia`}
            subtitle="Kumpulkan poin dari setiap perjalanan aman di Pos Mitra!"
            icon={Sparkles}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-800">Riwayat Perolehan Poin</h3>
            {isLoadingRewards ? (
              <div className="text-neutral-400 text-[10px]">Memuat riwayat poin...</div>
            ) : rewardSummary.history.length > 0 ? (
              <div className="space-y-2">
                {rewardSummary.history.map(item => (
                  <div key={item.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between text-[10px]">
                    <div>
                      <p className="font-bold text-neutral-800">{item.description || 'Reward Trip Selesai'}</p>
                      <p className="text-[8px] text-neutral-400">{item.createdAt?.split('T')[0]}</p>
                    </div>
                    <span className={`font-bold font-mono text-[11px] ${item.type === 'earn' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type === 'earn' ? `+${item.points}` : `-${item.points}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400">Belum ada riwayat transaksi poin.</p>
            )}
          </div>
        </div>
      )}

      <BaseModal
        isOpen={Boolean(selectedTicket && activeModalType === 'chat')}
        onClose={() => {
          setSelectedTicket(null);
          setChatConversationId(null);
        }}
        title={`Chat dengan Mitra (${selectedTicket?.mitra})`}
        subtitle={`Trip: ${selectedTicket?.from} ➔ ${selectedTicket?.to}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3 text-[10px]">
          <div className="h-72 overflow-y-auto p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5 flex flex-col">
            {isLoadingChat ? (
              <div className="flex items-center justify-center h-full text-neutral-400">Memuat pesan dari server...</div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => {
                const isMe = msg.sender?.role === 'customer' || msg.senderId === selectedTicket?.customerId;
                return (
                  <div key={index} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[7px] text-neutral-400 mb-0.5">{msg.sender?.name || 'Pengguna'}</span>
                    <div className={`p-2.5 rounded-2xl text-[10px] ${isMe ? 'bg-[#4B2172] text-white rounded-br-none' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm'}`}>
                      {msg.messageText}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-1">
                <MessageSquare className="w-6 h-6 opacity-40" />
                <p>Belum ada percakapan. Mulai chat dengan mitra sekarang.</p>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Tulis pesan ke mitra..."
              className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#4B2172]"
            />
            <button
              type="submit"
              disabled={!newMessageText.trim()}
              className="px-4 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      </BaseModal>

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
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NEBENG-${selectedTicket?.qrCodeTicket || selectedTicket?.id}-${qrDynamicToken}`} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-[9px] font-mono font-bold text-neutral-600 bg-neutral-50 py-1 px-2.5 rounded-lg border border-neutral-200">
            {selectedTicket?.qrCodeTicket || `NEBENG-${selectedTicket?.id}-${qrDynamicToken}`}
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
                  <div className={`w-2.5 h-2.5 rounded-full absolute -left-4.25 top-0.5 ${log.completed ? 'bg-[#4B2172]' : 'bg-neutral-300'}`} />
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
              disabled={isSubmittingReview}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="flex-1 py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
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
            Yakin ingin membatalkan pesanan <strong className="text-neutral-800">{selectedTicket?.from} → {selectedTicket?.to}</strong>? Kuota kursi/bagasi akan dikembalikan.
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