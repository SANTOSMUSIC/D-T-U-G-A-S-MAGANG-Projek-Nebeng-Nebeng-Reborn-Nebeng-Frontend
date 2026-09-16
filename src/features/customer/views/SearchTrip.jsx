import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  ArrowRight,    
  CheckCircle2, 
  AlertCircle,
  KeyRound 
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useTickets } from '../../../context/TicketsContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/apiClient';

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const TODAY_ISO = new Date().toISOString().split('T')[0];
const PRIMARY_COLOR = '#4FBF99';
const formatRupiah = (value) => `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;

const inferServiceType = (trip) => {
  const rawType = (trip?.serviceType || '').toLowerCase();
  if (rawType === 'barang') return 'barang';
  if (rawType === 'mobil' || rawType === 'motor' || rawType === 'penumpang') return 'penumpang';
  return Number(trip?.maxWeightCapacityKg) > 15 ? 'barang' : 'penumpang';
};

export default function SearchTrip() {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const toast = useToast();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [serviceType, setServiceType] = useState('penumpang');

  const [pickupPoints, setPickupPoints] = useState([]);
  const [trips, setTrips] = useState([]);
  const [myBookedTripIds, setMyBookedTripIds] = useState(new Set());
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [showPinWarningModal, setShowPinWarningModal] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingStep, setBookingStep] = useState('form');

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [paymentGateway] = useState('QRIS');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [seatCount, setSeatCount] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  const [itemCategory, setItemCategory] = useState('Elektronik');
  const [itemCount, setItemCount] = useState(1);
  const [itemWeight, setItemWeight] = useState(5);
  const [itemSize, setItemSize] = useState('M');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  const sizeOptions = [
    { code: 'XXS', label: 'XXS (< 1 kg)', weight: 1 },
    { code: 'XS', label: 'XS (1-2 kg)', weight: 2 },
    { code: 'S', label: 'S (2-5 kg)', weight: 4 },
    { code: 'M', label: 'M (5-10 kg)', weight: 7 },
    { code: 'L', label: 'L (10-20 kg)', weight: 15 },
    { code: 'XL', label: 'XL (> 20 kg)', weight: 25 },
  ];

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setIsLoadingTrips(true);
      try {
        const params = {};
        if (date) params.date = date;
        if (origin) params.originPointId = origin;
        if (destination) params.destinationPointId = destination;

        const [resMe, resPoints, resMyOrders, resTrips] = await Promise.all([
          apiClient.get('/auth/me').catch(() => ({ data: null })),
          apiClient.get('/pickup-points', { params: { onlyActive: true } }).catch(() => ({ data: [] })),
          apiClient.get('/orders/me').catch(() => ({ data: [] })),
          apiClient.get('/trips', { params }).catch(() => ({ data: { data: [] } })),
        ]);

        if (ignore) return;

        if (resMe.data) {
          setUserProfile(resMe.data);
        }

        setPickupPoints(resPoints.data || []);

        const activeOrders = (resMyOrders.data || []).filter(o => o.status !== 'cancelled');
        const bookedIds = new Set(activeOrders.map(o => String(o.tripId || o.trip?.id)));
        setMyBookedTripIds(bookedIds);

        const list = resTrips.data?.data || resTrips.data || [];
        
        const activeList = list.filter((t) => {
          if (t.status === 'cancelled' || t.status === 'CANCELLED') return false;
          const tripCategory = inferServiceType(t);
          return tripCategory === serviceType;
        });

        setTrips(activeList);
      } catch (err) {
        console.error('Gagal memuat trip:', err);
      } finally {
        if (!ignore) {
          setIsLoadingTrips(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [origin, destination, date, serviceType]);

  const maxAllowedSeats = selectedTrip?.vehicle?.type === 'motor' 
    ? 1 
    : (selectedTrip?.seatAvailable ?? selectedTrip?.totalSeats ?? 1);

  const safeSeatCount = Math.min(Math.max(1, seatCount || 1), maxAllowedSeats);
  const safeItemCount = Math.max(1, itemCount || 1);
  const safeItemWeight = Math.max(1, itemWeight || 1);
  const totalAccumulatedWeight = safeItemCount * safeItemWeight;

  const isOverWeightCapacity =
    serviceType === 'barang' &&
    totalAccumulatedWeight > (selectedTrip?.remainingWeightCapacityKg || selectedTrip?.maxWeightCapacityKg || 0);

  const isOverSeatCapacity =
    serviceType === 'penumpang' && (seatCount > maxAllowedSeats || seatCount < 1);

  const isOverCapacity = isOverWeightCapacity || isOverSeatCapacity;

  const isPassengerPhoneValid =
    serviceType === 'penumpang' ? PHONE_REGEX.test(passengerPhone.trim()) : true;

  const isReceiverPhoneValid =
    serviceType === 'barang' ? PHONE_REGEX.test(receiverPhone.trim()) : true;

  const isPassengerValid =
    serviceType === 'penumpang' ? passengerName.trim() !== '' && isPassengerPhoneValid : true;

  const isBarangValid =
    serviceType === 'barang' ? receiverName.trim() !== '' && isReceiverPhoneValid : true;

  const isFormValid = !isOverCapacity && isPassengerValid && isBarangValid;

  const quantity = serviceType === 'barang' ? safeItemCount : safeSeatCount;
  const basePrice = selectedTrip?.price || 0;
  const totalPrice = basePrice * quantity;

  const handleSeatChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setSeatCount(1);
    } else if (val > maxAllowedSeats) {
      setSeatCount(maxAllowedSeats);
    } else {
      setSeatCount(val);
    }
  };

  const handlePhoneChange = (val, setter) => {
    const cleaned = val.replace(/[^0-9+]/g, '');
    if (cleaned.length <= 14) {
      setter(cleaned);
    }
  };

  const handleSizeChange = (sizeCode) => {
    setItemSize(sizeCode);
    const selectedOpt = sizeOptions.find((opt) => opt.code === sizeCode);
    if (selectedOpt) setItemWeight(selectedOpt.weight);
  };

  const handleOpenBooking = (trip) => {
    const hasPinConfigured = Boolean(userProfile?.hasPin || userProfile?.pinHash);

    if (!hasPinConfigured) {
      setShowPinWarningModal(true);
      return;
    }

    setSelectedTrip(trip);
    setBookingStep('form');
    setPin(['', '', '', '', '', '']);
    setIsCheckingOut(false);
    setSeatCount(1);
    setPassengerName(userProfile?.name || '');
    setPassengerPhone(userProfile?.phone || '');
    setItemCategory('Elektronik');
    setItemCount(1);
    setItemWeight(7);
    setItemSize('M');
    setReceiverName('');
    setReceiverPhone('');
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    if (isFormValid) setBookingStep('pin');
  };

  const handlePinChange = (val, index) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;

    if (cleaned.length > 1) {
      const newPin = [...pin];
      for (let i = 0; i < 6; i++) newPin[i] = cleaned[i] || '';
      setPin(newPin);
      const nextIndex = Math.min(cleaned.length, 5);
      document.getElementById(`pin-input-${nextIndex}`)?.focus();
      return;
    }

    const newPin = [...pin];
    newPin[index] = cleaned;
    setPin(newPin);

    if (cleaned && index < 5) {
      document.getElementById(`pin-input-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifyPinAndCheckout = async () => {
    if (pin.some((p) => p === '') || isCheckingOut || !selectedTrip) return;

    setIsCheckingOut(true);
    try {
      const orderPayload = {
        tripId: String(selectedTrip.id),
        type: serviceType === 'penumpang' ? 'passenger' : 'parcel',
        ...(serviceType === 'penumpang'
          ? { seatsBooked: safeSeatCount }
          : {
              items: [
                {
                  itemName: itemCategory,
                  itemCategory: itemCategory,
                  quantity: safeItemCount,
                  weightPerItemKg: itemWeight,
                  sizeEnum: itemSize.toLowerCase(),
                  recipientName: receiverName,
                  recipientPhone: receiverPhone,
                },
              ],
            }),
      };

      const resOrder = await apiClient.post('/orders', orderPayload);
      const createdOrder = resOrder.data;
      const orderIdStr = String(createdOrder.id);
      const pinString = pin.join('');

      await apiClient.post('/payments/checkout', {
        orderId: orderIdStr,
        paymentGateway: paymentGateway,
        pin: pinString,
      });

      addTicket({
        id: orderIdStr,
        type: serviceType,
        title: serviceType === 'barang' ? `Nebeng Barang (${itemCategory})` : 'Nebeng Penumpang',
        from: selectedTrip.originPoint?.name || 'Pos Asal',
        to: selectedTrip.destinationPoint?.name || 'Pos Tujuan',
        mitra: selectedTrip.mitra?.name || 'Mitra',
        vehicle: selectedTrip.vehicle ? `${selectedTrip.vehicle.model}` : '-',
        schedule: `${selectedTrip.departureDate?.split('T')[0]} • Sesuai Jadwal`,
        totalPrice: formatRupiah(totalPrice),
        detail: serviceType === 'barang'
          ? `${safeItemCount} Item (${totalAccumulatedWeight} Kg)`
          : `${safeSeatCount} Kursi`,
        status: 'Aktif',
        currentStatusText: 'Menunggu Check-in di Pos Asal',
        otp: createdOrder.otpClaim || null,
        trackingLogs: [],
      });

      setBookingStep('success');
      toast.success('Pemesanan & Otorisasi PIN berhasil!', { title: 'Sukses' });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal memproses transaksi.';
      toast.error(errorMsg, { title: 'Gagal' });

      if (errorMsg.toLowerCase().includes('pin')) {
        setBookingStep('pin');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: PRIMARY_COLOR }} />
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: PRIMARY_COLOR }}>
              <Compass className="w-3 h-3" /> EKSPLORASI LAYANAN
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Cari & Booking Trip</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Temukan perjalanan antar kota atau pengiriman barang dengan sistem Escrow terintegrasi.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Pos Asal</label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium">
              <option value="">Semua Pos Asal</option>
              {pickupPoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Pos Tujuan</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium">
              <option value="">Semua Pos Tujuan</option>
              {pickupPoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tanggal</label>
            <input type="date" min={TODAY_ISO} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium" />
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tipe Layanan</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setServiceType('penumpang')} className={`py-2 px-2 rounded-xl text-[10px] font-bold ${serviceType === 'penumpang' ? 'bg-[#4FBF99] text-white' : 'bg-neutral-50 border text-neutral-600'}`}>Penumpang</button>
              <button onClick={() => setServiceType('barang')} className={`py-2 px-2 rounded-xl text-[10px] font-bold ${serviceType === 'barang' ? 'bg-[#4FBF99] text-white' : 'bg-neutral-50 border text-neutral-600'}`}>Barang</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[14px] font-bold text-neutral-800">Hasil Trip Tersedia ({trips.length})</h2>
        {isLoadingTrips ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {trips.map((trip) => {
              const tripIdStr = String(trip.id);
              const isAlreadyBookedByMe = myBookedTripIds.has(tripIdStr);
              const isFullyBooked = inferServiceType(trip) === 'penumpang' 
                ? Number(trip.seatAvailable) <= 0 
                : Number(trip.remainingWeightCapacityKg) <= 0;

              return (
                <div key={trip.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge variant="purple">
                        {inferServiceType(trip) === 'penumpang' ? 'Nebeng Penumpang' : 'Nebeng Barang'}
                      </StatusBadge>

                      {isAlreadyBookedByMe ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Sudah Dipesan
                        </span>
                      ) : isFullyBooked ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-bold rounded-full flex items-center gap-1 border border-rose-300">
                          <AlertCircle className="w-2.5 h-2.5" /> Kuota Penuh
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-800">
                      <span>{trip.originPoint?.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: PRIMARY_COLOR }} />
                      <span>{trip.destinationPoint?.name}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-[9px] text-neutral-400 font-medium">
                      <span>📅 {trip.departureDate?.split('T')[0]}</span>
                      <span>🚗 {trip.vehicle ? `${trip.vehicle.model}` : '-'}</span>
                      <span>
                        ⚡ Sisa Kuota: {' '}
                        <strong style={{ color: PRIMARY_COLOR }}>
                          {serviceType === 'barang' 
                            ? `${trip.remainingWeightCapacityKg ?? trip.maxWeightCapacityKg ?? 0} Kg` 
                            : `${trip.seatAvailable ?? trip.totalSeats ?? 0} Kursi`}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <span className="text-[14px] font-bold text-emerald-600">{formatRupiah(trip.price)}</span>

                    {isAlreadyBookedByMe ? (
                      <button
                        onClick={() => navigate('/customer/tickets')}
                        className="w-full md:w-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                      >
                        Lihat Tiket Saya
                      </button>
                    ) : isFullyBooked ? (
                      <button
                        disabled
                        className="w-full md:w-auto py-2 px-4 bg-neutral-200 text-neutral-400 rounded-xl text-[10px] font-bold cursor-not-allowed"
                      >
                        Kuota Penuh
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBooking(trip)}
                        className="w-full md:w-auto py-2 px-4 bg-[#4FBF99] hover:bg-[#429f80] text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                      >
                        Pesan Sekarang
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Search} title="Tidak Ada Trip" description="Tidak ada jadwal trip yang cocok." />
        )}
      </div>

      <BaseModal
        isOpen={showPinWarningModal}
        onClose={() => setShowPinWarningModal(false)}
        title="PIN Transaksi Belum Dibuat"
        subtitle="Keamanan Akun"
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-4 text-[11px] py-2">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-neutral-800 text-[13px]">Atur PIN Transaksi Anda</p>
            <p className="text-neutral-500 leading-relaxed text-[10px]">
              Untuk alasan keamanan transaksi, Anda diwajibkan membuat 6-digit PIN Transaksi terlebih dahulu sebelum melakukan pemesanan.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowPinWarningModal(false)}
              className="w-1/2 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl font-bold transition"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setShowPinWarningModal(false);
                navigate('/customer/profile/pengaturan');
              }}
              className="w-1/2 py-2.5 bg-[#4FBF99] hover:bg-[#429f80] text-white rounded-xl font-bold transition shadow-sm"
            >
              Buat PIN Sekarang
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={bookingStep === 'form' ? 'Formulir Pemesanan' : bookingStep === 'pin' ? 'Konfirmasi PIN' : 'Selesai'}
        subtitle="Booking Engine"
        maxWidth="max-w-md"
      >
        {bookingStep === 'form' && (
          <form onSubmit={handleProceedToPin} className="space-y-3 text-[10px]">
            {serviceType === 'penumpang' ? (
              <>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">
                    Jumlah Kursi (Maks: {maxAllowedSeats})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxAllowedSeats}
                    value={seatCount}
                    onChange={handleSeatChange}
                    className="w-full p-2 bg-neutral-50 border rounded-xl font-bold"
                  />
                  {seatCount > maxAllowedSeats && (
                    <p className="text-[9px] text-rose-500 mt-0.5">Jumlah kursi melebihi sisa kuota!</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Nama Penumpang</label>
                    <input
                      type="text"
                      required
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={passengerPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setPassengerPhone)}
                      className="w-full p-2 bg-neutral-50 border rounded-xl font-bold"
                    />
                    {!isPassengerPhoneValid && passengerPhone.length > 0 && (
                      <p className="text-[9px] text-rose-500 mt-0.5">Format nomor tidak valid</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Kategori Barang</label>
                    <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full p-2 bg-neutral-50 border rounded-xl font-bold">
                      <option value="Elektronik">Elektronik</option>
                      <option value="Pakaian">Pakaian</option>
                      <option value="Dokumen">Dokumen</option>
                      <option value="Makanan">Makanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Ukuran Paket</label>
                    <select value={itemSize} onChange={(e) => handleSizeChange(e.target.value)} className="w-full p-2 bg-neutral-50 border rounded-xl font-bold">
                      {sizeOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">No. HP Penerima</label>
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={receiverPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setReceiverPhone)}
                      className="w-full p-2 bg-neutral-50 border rounded-xl font-bold"
                    />
                    {!isReceiverPhoneValid && receiverPhone.length > 0 && (
                      <p className="text-[9px] text-rose-500 mt-0.5">Format nomor tidak valid</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="p-3 bg-emerald-50 rounded-xl flex justify-between font-bold">
              <span>Total Biaya:</span>
              <span style={{ color: PRIMARY_COLOR }}>{formatRupiah(totalPrice)}</span>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-2.5 text-white rounded-xl font-bold shadow-sm transition ${
                isFormValid ? 'bg-[#4FBF99] hover:bg-[#429f80]' : 'bg-neutral-300 cursor-not-allowed'
              }`}
            >
              Lanjut ke Konfirmasi PIN
            </button>
          </form>
        )}

        {bookingStep === 'pin' && (
          <div className="space-y-4 text-center text-[10px]">
            <p className="text-neutral-600 font-medium">Masukkan PIN 6 Digit Anda untuk mengonfirmasi pemesanan:</p>
            <div className="flex justify-center gap-1.5">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-input-${index}`}
                  type="password"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, index)}
                  onKeyDown={(e) => handlePinKeyDown(e, index)}
                  className="w-8 h-9 text-center bg-neutral-50 border rounded-xl font-bold focus:border-[#4FBF99] focus:outline-none"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyPinAndCheckout}
              disabled={pin.some(p => p === '') || isCheckingOut}
              className={`w-full py-2.5 text-white rounded-xl font-bold transition ${
                pin.some(p => p === '') || isCheckingOut
                  ? 'bg-neutral-300 cursor-not-allowed'
                  : 'bg-[#4FBF99] hover:bg-[#429f80]'
              }`}
            >
              {isCheckingOut ? 'Memproses Pesanan...' : 'Konfirmasi Pemesanan'}
            </button>
          </div>
        )}

        {bookingStep === 'success' && (
          <div className="text-center py-4 space-y-3 text-[10px]">
            <p className="font-bold text-emerald-600 text-[14px]">Pemesanan Berhasil!</p>
            <p className="text-neutral-500">Tiket dan kode OTP Anda telah terbit.</p>
            <button
              onClick={() => { setSelectedTrip(null); navigate('/customer/tickets'); }}
              className="py-2.5 px-6 bg-[#4FBF99] hover:bg-[#429f80] text-white rounded-xl font-bold transition"
            >
              Lihat Tiket Saya
            </button>
          </div>
        )}
      </BaseModal>
    </div>
  );
}