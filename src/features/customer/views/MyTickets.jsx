import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Ticket, QrCode, Copy, CheckCircle2, Clock, ArrowRight, Activity, MapPin, BellRing, Star, Award, Gift, Sparkles } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function MyTickets() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('aktif'); // 'aktif' | 'riwayat' | 'reward'
    const [copiedOtp, setCopiedOtp] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeModalType, setActiveModalType] = useState(null); // 'qr' | 'tracking' | 'review'

  // State untuk form ulasan
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Data dummy tiket dengan log status real-time & ulasan
  const [allTickets, setAllTickets] = useState([
    {
      id: 'TKT-2026-001',
      type: 'penumpang',
      title: 'Nebeng Penumpang',
      from: 'Pos Solo Kota',
      to: 'Pos Semarang Indah',
      mitra: 'Budi Santoso',
      vehicle: 'Toyota Avanza (H 1234 AB)',
      schedule: '2026-08-25 • 08:00 WIB',
      detail: '2 Kursi (Nomor 1A, 1B)',
      status: 'Aktif',
      currentStatusText: 'In Transit (Menuju Semarang)',
      otp: null,
      trackingLogs: [
        { status: 'Checked-in at Pos', location: 'Pos Solo Kota', time: '07:45 WIB', completed: true, active: false },
        { status: 'In Transit', location: 'Perjalanan Tol Batang-Semarang', time: '08:30 WIB', completed: true, active: true },
        { status: 'Arrived at Pos Destination', location: 'Pos Semarang Indah', time: 'Estimasi 10:00 WIB', completed: false, active: false }
      ]
    },
    {
      id: 'TKT-2026-002',
      type: 'barang',
      title: 'Nebeng Barang (Paket Elektronik)',
      from: 'Pos Solo Kota',
      to: 'Pos Yogyakarta Pusat',
      mitra: 'Siti Aminah',
      vehicle: 'Yamaha NMAX (AD 5678 CD)',
      schedule: '2026-08-25 • 10:30 WIB',
      detail: '1 Item - 5 Kg (Elektronik)',
      otp: '482910',
      status: 'Aktif',
      currentStatusText: 'Checked-in at Pos Asal',
      trackingLogs: [
        { status: 'Checked-in at Pos', location: 'Pos Solo Kota', time: '10:15 WIB', completed: true, active: true },
        { status: 'In Transit', location: 'Menunggu Driver Berangkat', time: '-', completed: false, active: false },
        { status: 'Arrived at Pos Destination', location: 'Pos Yogyakarta Pusat', time: '-', completed: false, active: false }
      ]
    },
    {
      id: 'TKT-2026-003',
      type: 'penumpang',
      title: 'Nebeng Penumpang',
      from: 'Pos Yogyakarta Pusat',
      to: 'Pos Solo Kota',
      mitra: 'Joko Widodo',
      vehicle: 'Honda Mobilio (AB 1234 XY)',
      schedule: '2026-08-20 • 14:00 WIB',
      detail: '1 Kursi (Nomor 2C)',
      status: 'Selesai',
      currentStatusText: 'Perjalanan Selesai',
      otp: null,
      rating: 5,
      review: 'Driver sangat ramah dan tepat waktu! Pos pengantaran aman.',
      trackingLogs: [
        { status: 'Checked-in at Pos', location: 'Pos Yogyakarta Pusat', time: '13:45 WIB', completed: true, active: false },
        { status: 'In Transit', location: 'Jalur Jogja-Solo', time: '14:15 WIB', completed: true, active: false },
        { status: 'Arrived at Pos Destination', location: 'Pos Solo Kota', time: '16:00 WIB', completed: true, active: false }
      ]
    }
  ]);

  // Data dummy riwayat poin reward
  const rewardData = {
    totalPoints: 450,
    history: [
      { id: 'REW-01', type: 'earn', title: 'Reward Trip Selesai (TKT-2026-003)', points: '+50', date: '20 Aug 2026', desc: 'Bonus loyalitas perjalanan aman' },
      { id: 'REW-02', type: 'redeem', title: 'Penukaran Voucher Diskon Pos Rp 20.000', points: '-100', date: '15 Aug 2026', desc: 'Potongan biaya trip berikutnya' },
      { id: 'REW-03', type: 'earn', title: 'Bonus Onboarding Biometrik Verifikasi', points: '+500', date: '10 Aug 2026', desc: 'Verifikasi identitas berhasil' }
    ]
  };

  const filteredTickets = allTickets.filter(ticket => {
    if (activeTab === 'aktif') {
      return ticket.status === 'Aktif';
    } else if (activeTab === 'riwayat') {
      return ticket.status === 'Selesai' || ticket.status === 'Batal';
    }
    return true;
  });

  const isLoadingTickets = useSimulatedLoading([activeTab], 600);

  const handleCopyOtp = (otp) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const openModal = (ticket, type) => {
    setSelectedTicket(ticket);
    setActiveModalType(type);
    if (type === 'review') {
      setRating(ticket.rating || 5);
      setReviewText(ticket.review || '');
    }
  };

  const submitReview = (e) => {
    e.preventDefault();
    setAllTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, rating, review: reviewText };
      }
      return t;
    }));
    setActiveModalType(null);
    toast.success('Ulasan dan rating berhasil dikirim! Terima kasih.', { title: 'Terkirim' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 mb-6">
        <div className="flex items-center gap-2 text-pink-600 text-xs font-extrabold uppercase tracking-wider mb-1">
          <Ticket className="w-4 h-4" />
          <span>Tiket, QR Code & Reward</span>
        </div>
        <h1 className="text-2xl font-black text-neutral-900">My Tickets & Live Digital QR</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Tunjukkan QR Code digital di Pos, pantau status real-time, beri ulasan mitra, dan kelola Poin Reward Anda.
        </p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab('aktif')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer shadow-sm ${
            activeTab === 'aktif'
              ? 'bg-[#e61994] text-white shadow-pink-500/20'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Tiket Aktif ({allTickets.filter(t => t.status === 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer shadow-sm ${
            activeTab === 'riwayat'
              ? 'bg-[#e61994] text-white shadow-pink-500/20'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          Riwayat Perjalanan ({allTickets.filter(t => t.status !== 'Aktif').length})
        </button>
        <button
          onClick={() => setActiveTab('reward')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer shadow-sm flex items-center gap-2 ${
            activeTab === 'reward'
              ? 'bg-[#e61994] text-white shadow-pink-500/20'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Poin & Reward ({rewardData.totalPoints} Poin)</span>
        </button>
      </div>

      {/* KONTEN TAB: TIPIK & RIWAYAT */}
      {activeTab !== 'reward' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingTickets ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
            ))
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-pink-100">
                      {ticket.title}
                    </span>
                    <span className="text-xs font-bold text-neutral-500">{ticket.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-black text-neutral-900 mb-4">
                    <span>{ticket.from}</span>
                    <ArrowRight className="w-4 h-4 text-pink-600" />
                    <span>{ticket.to}</span>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-4 mb-4 border border-neutral-100 space-y-1.5 text-xs">
                    <p className="font-bold text-neutral-800">
                      Mitra: <span className="font-normal text-neutral-600">{ticket.mitra} ({ticket.vehicle})</span>
                    </p>
                    <p className="font-bold text-neutral-800">
                      Jadwal: <span className="font-normal text-neutral-600">{ticket.schedule}</span>
                    </p>
                    <p className="font-bold text-neutral-800">
                      Detail: <span className="font-normal text-neutral-600">{ticket.detail}</span>
                    </p>
                  </div>

                  {ticket.otp && (
                    <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-extrabold text-pink-700 uppercase tracking-wider mb-1">
                        Kode OTP Pengambilan Paket
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-neutral-900 tracking-widest">{ticket.otp}</span>
                        <button
                          onClick={() => handleCopyOtp(ticket.otp)}
                          className="px-3 py-1.5 bg-white border border-pink-200 text-pink-700 rounded-xl text-xs font-bold hover:bg-pink-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {copiedOtp === ticket.otp ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-600">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ulasan yang sudah diberikan (jika ada pada riwayat) */}
                  {ticket.rating && (
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3 mb-4 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-800">Ulasan & Rating Anda</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(ticket.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-600 italic">"{ticket.review}"</p>
                    </div>
                  )}
                </div>

                <div>
                  {/* Real-time Status Notification Banner */}
                  <div 
                    onClick={() => openModal(ticket, 'tracking')}
                    className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 mb-4 flex items-center justify-between cursor-pointer hover:bg-purple-100/50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-600"></span>
                      </span>
                      <div>
                        <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">Real-time Status</p>
                        <p className="text-xs font-bold text-neutral-900">{ticket.currentStatusText}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-pink-600 underline">Lacak</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                      ticket.status === 'Aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {ticket.status}
                    </span>

                    {ticket.status === 'Aktif' && (
                      <button
                        onClick={() => openModal(ticket, 'qr')}
                        className="px-4 py-2 bg-[#e61994] hover:bg-[#d01484] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Tampilkan QR Pos</span>
                      </button>
                    )}

                    {ticket.status === 'Selesai' && (
                      <button
                        onClick={() => openModal(ticket, 'review')}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>{ticket.rating ? 'Ubah Ulasan' : 'Beri Ulasan'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white rounded-3xl border border-neutral-100">
              <EmptyState
                icon={Clock}
                title="Belum Ada Tiket"
                description="Belum ada data perjalanan pada kategori ini."
              />
            </div>
          )}
        </div>
      ) : (
        /* KONTEN TAB: POIN & REWARD */
        <div className="space-y-6">
          {/* Banner Saldo Poin */}
          <div className="bg-gradient-to-r from-purple-700 via-[#e61994] to-pink-500 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-pink-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Loyalty Reward Points</span>
              </div>
              <h2 className="text-3xl font-black">{rewardData.totalPoints} Poin Tersedia</h2>
              <p className="text-xs text-pink-100 max-w-md">
                Kumpulkan poin dari setiap perjalanan aman di Pos Mitra dan tukarkan dengan diskon menarik atau cashback eksklusif!
              </p>
            </div>
            <button 
              onClick={() => toast.info('Fitur penukaran voucher segera hadir di update berikutnya!', { title: 'Segera Hadir' })}
              className="px-6 py-3.5 bg-white text-[#e61994] rounded-2xl text-xs font-black shadow-xl hover:bg-neutral-50 transition cursor-pointer flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Tukar Poin Reward</span>
            </button>
          </div>

          {/* Riwayat Poin */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
            <h3 className="text-sm font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-600" />
              <span>Riwayat Perolehan & Penukaran Poin</span>
            </h3>

            <div className="space-y-3">
              {rewardData.history.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      item.type === 'earn' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {item.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">{item.title}</p>
                      <p className="text-[11px] text-neutral-500">{item.desc} • {item.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${item.type === 'earn' ? 'text-emerald-600' : 'text-pink-600'}`}>
                    {item.points} Poin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: LIVE DIGITAL QR POS */}
      {selectedTicket && activeModalType === 'qr' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-widest">Live Digital QR Pos</span>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-sm font-extrabold text-neutral-900 mb-1">{selectedTicket.title}</h3>
            <p className="text-xs text-neutral-500 mb-4">{selectedTicket.from} ➔ {selectedTicket.to}</p>
            
            <div className="w-52 h-52 bg-white rounded-2xl mx-auto flex items-center justify-center border-2 border-neutral-100 p-3 shadow-md mb-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NEBENG-${selectedTicket.type.toUpperCase()}-${selectedTicket.id}-SECURE`} 
                alt="Scannable QR Code" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            
            <p className="text-[10px] font-mono font-bold text-neutral-500 mb-4 bg-neutral-50 py-1.5 px-3 rounded-xl border border-neutral-200">
              NEBENG-{selectedTicket.type.toUpperCase()}-{selectedTicket.id}-SECURE
            </p>

            <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100 text-left text-xs mb-4">
              <p className="font-bold text-pink-700">Instruksi di Pos:</p>
              <p className="text-neutral-600 text-[11px]">Tunjukkan QR Code di atas kepada petugas pos atau mitra untuk diverifikasi.</p>
            </div>
            
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: REAL-TIME STATUS TRACKER */}
      {selectedTicket && activeModalType === 'tracking' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Live Status Notification</span>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-sm font-black text-neutral-900">{selectedTicket.title}</h3>
              <p className="text-xs text-neutral-500">ID: {selectedTicket.id}</p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-4">
              {selectedTicket.trackingLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 relative">
                  {index !== selectedTicket.trackingLogs.length - 1 && (
                    <div className={`absolute left-3 top-6 w-0.5 h-full -ml-[1px] ${log.completed ? 'bg-pink-600' : 'bg-neutral-200'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                    log.completed ? 'bg-pink-600 text-white shadow-md' : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {log.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${log.active ? 'text-pink-600' : 'text-neutral-900'}`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-500" /> {log.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-800 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Notifikasi diperbarui secara otomatis dari sistem Pos & Mitra secara real-time.</span>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: BERI RATING & ULASAN MITRA */}
      {selectedTicket && activeModalType === 'review' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">Beri Rating & Ulasan Mitra</span>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-center">
              <h3 className="text-sm font-extrabold text-neutral-900">{selectedTicket.mitra}</h3>
              <p className="text-xs text-neutral-500">{selectedTicket.vehicle} • {selectedTicket.id}</p>
            </div>

            <form onSubmit={submitReview} className="space-y-4">
              {/* Pemilihan Bintang */}
              <div className="text-center bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <p className="text-xs font-bold text-neutral-700 mb-2">Seberapa puas Anda dengan perjalanan ini?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition transform hover:scale-110 cursor-pointer"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-neutral-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-amber-600 mt-2">{rating} dari 5 Bintang</p>
              </div>

              {/* Input Teks Ulasan */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 mb-1">Ulasan / Testimoni</label>
                <textarea
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Bagikan pengalaman perjalanan atau pelayanan mitra pos..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:border-pink-600 transition"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}