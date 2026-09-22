import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  ArrowRight,    
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/apiClient';

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const TODAY_ISO = new Date().toISOString().split('T')[0];
const PRIMARY_COLOR = '#10367D';
const PRIMARY_HOVER = '#0C2C66';
const formatRupiah = (value) => `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;

const inferServiceType = (trip) => {
  const rawType = (trip?.serviceType || '').toLowerCase();
  if (rawType === 'barang') return 'barang';
  if (rawType === 'mobil' || rawType === 'motor' || rawType === 'penumpang') return 'penumpang';
  return Number(trip?.maxWeightCapacityKg) > 15 ? 'barang' : 'penumpang';
};

export default function SearchTrip() {
  const navigate = useNavigate();
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

  const [selectedTrip, setSelectedTrip] = useState(null);

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

  const [paymentMethod, setPaymentMethod] = useState('xendit');
  const [pin, setPin] = useState('');

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
        const params = {
          status: 'scheduled',
          date: date || TODAY_ISO,
        };
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

  const isPaymentValid = paymentMethod === 'xendit' ? true : pin.length === 6;

  const isFormValid = !isOverCapacity && isPassengerValid && isBarangValid && isPaymentValid;

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
    setSelectedTrip(trip);
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isFormValid || isCheckingOut || !selectedTrip) return;

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

      // 1. Create Order
      const resOrder = await apiClient.post('/orders', orderPayload);
      const createdOrder = resOrder.data;
      const orderIdStr = String(createdOrder.id);

      if (paymentMethod === 'xendit') {
        // 2. Request Xendit Invoice URL
        const resPayment = await apiClient.post('/payments/xendit/create-invoice', {
          orderId: orderIdStr
        });
        
        const invoiceUrl = resPayment.data.invoiceUrl;
  
        // 3. Redirect ke Payment Gateway (Xendit)
        toast.success('Mengalihkan ke halaman pembayaran...', { title: 'Tunggu Sebentar' });
        window.location.href = invoiceUrl;
      } else {
        // Dev Mode / Simulasi PIN
        await apiClient.post('/payments/checkout', {
          orderId: orderIdStr,
          paymentGateway: 'MANUAL_SIMULATION',
          pin: pin
        });
        
        toast.success('Pembayaran Simulasi Berhasil!', { title: 'Berhasil' });
        setSelectedTrip(null);
        navigate('/customer/tickets');
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Gagal memproses transaksi.';
      toast.error(errorMsg, { title: 'Gagal' });
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
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none">
              <option value="">Semua Pos Asal</option>
              {pickupPoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Pos Tujuan</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none">
              <option value="">Semua Pos Tujuan</option>
              {pickupPoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tanggal</label>
            <input type="date" min={TODAY_ISO} value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none" />
          </div>
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Tipe Layanan</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setServiceType('penumpang')} 
                className={`py-2 px-2 rounded-xl text-[10px] font-bold cursor-pointer transition ${serviceType === 'penumpang' ? 'text-white' : 'bg-neutral-50 border border-neutral-200 text-neutral-600'}`}
                style={serviceType === 'penumpang' ? { backgroundColor: PRIMARY_COLOR } : undefined}
              >
                Penumpang
              </button>
              <button 
                onClick={() => setServiceType('barang')} 
                className={`py-2 px-2 rounded-xl text-[10px] font-bold cursor-pointer transition ${serviceType === 'barang' ? 'text-white' : 'bg-neutral-50 border border-neutral-200 text-neutral-600'}`}
                style={serviceType === 'barang' ? { backgroundColor: PRIMARY_COLOR } : undefined}
              >
                Barang
              </button>
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
                        className="w-full md:w-auto py-2 px-4 text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)}
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
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title="Formulir Pemesanan"
        subtitle="Booking Engine"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCheckout} className="space-y-3 text-[10px]">
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
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none"
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
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none"
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
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none"
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
                  <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none">
                    <option value="Elektronik">Elektronik</option>
                    <option value="Pakaian">Pakaian</option>
                    <option value="Dokumen">Dokumen</option>
                    <option value="Makanan">Makanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">Ukuran Paket</label>
                  <select value={itemSize} onChange={(e) => handleSizeChange(e.target.value)} className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none">
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
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none"
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
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none"
                  />
                  {!isReceiverPhoneValid && receiverPhone.length > 0 && (
                    <p className="text-[9px] text-rose-500 mt-0.5">Format nomor tidak valid</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="block text-[8px] font-bold text-neutral-400 uppercase">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('xendit')}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold transition ${
                  paymentMethod === 'xendit' ? 'border-[#10367D] bg-blue-50 text-[#10367D]' : 'border-neutral-200 text-neutral-500'
                }`}
              >
                Virtual Account / E-Wallet (Xendit)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('dev_mode')}
                className={`py-2 px-3 border rounded-xl text-[10px] font-bold transition ${
                  paymentMethod === 'dev_mode' ? 'border-[#10367D] bg-blue-50 text-[#10367D]' : 'border-neutral-200 text-neutral-500'
                }`}
              >
                Bypass Pembayaran (Dev Mode)
              </button>
            </div>
          </div>

          {paymentMethod === 'dev_mode' && (
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase mb-1">PIN Transaksi (6 Digit)</label>
              <input
                type="password"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 6 digit PIN"
                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold focus:outline-none tracking-widest text-center"
              />
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-xl flex justify-between font-bold border border-emerald-100">
            <span className="text-neutral-700">Total Biaya:</span>
            <span style={{ color: PRIMARY_COLOR }}>{formatRupiah(totalPrice)}</span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isCheckingOut}
            className={`w-full py-2.5 text-white rounded-xl font-bold shadow-sm transition cursor-pointer flex items-center justify-center ${
              isFormValid && !isCheckingOut ? '' : 'bg-neutral-300 cursor-not-allowed'
            }`}
            style={(isFormValid && !isCheckingOut) ? { backgroundColor: PRIMARY_COLOR } : undefined}
          >
            {isCheckingOut ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Lanjut Pembayaran'
            )}
          </button>
        </form>
      </BaseModal>
    </div>
  );
}