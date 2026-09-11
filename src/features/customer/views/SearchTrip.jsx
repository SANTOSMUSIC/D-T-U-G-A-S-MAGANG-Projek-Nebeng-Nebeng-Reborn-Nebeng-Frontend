import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, MapPin, Calendar, Users, Package, ArrowRight, ShieldCheck, Lock, Wallet } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useTickets } from '../../../context/TicketsContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../services/apiClient';

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const TODAY_ISO = new Date().toISOString().split('T')[0];

const formatRupiah = (value) =>
  `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;

// Menentukan tipe layanan ASLI sebuah trip berdasarkan data trip itu sendiri,
// bukan berdasarkan filter yang sedang dipilih customer.
//
// WORKAROUND: backend tidak punya kolom "serviceType" di tabel trip, jadi tipe
// layanan disandikan lewat kapasitas saat trip dibuat (lihat MitraTripManagement.jsx):
//   - Trip Barang    -> maxWeightCapacityKg = kapasitas bagasi asli (>1)
//   - Trip Penumpang -> maxWeightCapacityKg dipaksa ke 1 (sentinel/minimum)
// SENGAJA tidak memakai totalSeats sebagai sinyal, karena motor pada trip
// penumpang biasa juga cuma punya 1 kursi asli -> akan bentrok dengan sentinel
// "totalSeats = 1" milik trip barang dan menyebabkan salah klasifikasi (bug awal).
const inferServiceType = (trip) => (Number(trip?.maxWeightCapacityKg) > 1 ? 'barang' : 'penumpang');

export default function SearchTrip() {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const toast = useToast();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [serviceType, setServiceType] = useState('penumpang');

  const [pickupPoints, setPickupPoints] = useState([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingStep, setBookingStep] = useState('form');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [paymentGateway, setPaymentGateway] = useState('QRIS');
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
    let isMounted = true;
    const fetchPickupPoints = async () => {
      setIsLoadingPoints(true);
      try {
        const res = await apiClient.get('/pickup-points', { params: { onlyActive: true } });
        if (isMounted) setPickupPoints(res.data || []);
      } catch (err) {
        console.error('Gagal memuat daftar pos:', err);
        if (isMounted) toast.error('Gagal memuat daftar pos resmi.', { title: 'Error' });
      } finally {
        if (isMounted) setIsLoadingPoints(false);
      }
    };
    fetchPickupPoints();
    return () => { isMounted = false; };
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const fetchTrips = async () => {
      setIsLoadingTrips(true);
      try {
        const params = {};
        if (origin) params.originPointId = origin;
        if (destination) params.destinationPointId = destination;
        
        params.date = date || TODAY_ISO;
        // Catatan: parameter serviceType TIDAK dikirim ke backend karena
        // endpoint /trips belum tentu mendukungnya (bisa memicu error di server).
        // Filter tipe layanan dilakukan sepenuhnya di client lewat inferServiceType().

        const res = await apiClient.get('/trips', { params });
        if (isMounted) {
          const list = res.data?.data || res.data || [];
          const activeList = list.filter(t => {
            const tripDateStr = t.departureDate?.split('T')[0];
            const isUpcoming = tripDateStr >= TODAY_ISO;
            const matchesServiceType = inferServiceType(t) === serviceType;
            return isUpcoming && matchesServiceType;
          });
          setTrips(activeList);
        }
      } catch (err) {
        console.error('Gagal memuat daftar trip:', err);
        if (isMounted) toast.error('Gagal mengambil data trip dari server.', { title: 'Error' });
      } finally {
        if (isMounted) setIsLoadingTrips(false);
      }
    };
    fetchTrips();
    return () => { isMounted = false; };
  }, [origin, destination, date, serviceType, toast]);

  const safeSeatCount = Math.max(1, seatCount || 1);
  const safeItemCount = Math.max(1, itemCount || 1);
  const safeItemWeight = Math.max(1, itemWeight || 1);

  const totalAccumulatedWeight = safeItemCount * safeItemWeight;
  const isOverWeightCapacity = serviceType === 'barang' && totalAccumulatedWeight > (selectedTrip?.remainingWeightCapacityKg || 0);
  const maxAllowedSeats = selectedTrip?.vehicle?.type === 'motor' ? 1 : (selectedTrip?.seatAvailable || 1);
  const isOverSeatCapacity = serviceType === 'penumpang' && (safeSeatCount > maxAllowedSeats);
  const isOverCapacity = isOverWeightCapacity || isOverSeatCapacity;

  const isPassengerPhoneValid = serviceType === 'penumpang' ? PHONE_REGEX.test(passengerPhone.trim()) : true;
  const isReceiverPhoneValid = serviceType === 'barang' ? PHONE_REGEX.test(receiverPhone.trim()) : true;
  const isPassengerValid = serviceType === 'penumpang' ? (passengerName.trim() !== '' && isPassengerPhoneValid) : true;
  const isBarangValid = serviceType === 'barang' ? (receiverName.trim() !== '' && isReceiverPhoneValid) : true;
  const isFormValid = !isOverCapacity && isPassengerValid && isBarangValid;

  const quantity = serviceType === 'barang' ? safeItemCount : safeSeatCount;
  const basePrice = selectedTrip?.price || 0;
  const totalPrice = basePrice * quantity;

  const handleSizeChange = (sizeCode) => {
    setItemSize(sizeCode);
    const selectedOpt = sizeOptions.find(opt => opt.code === sizeCode);
    if (selectedOpt) {
      setItemWeight(selectedOpt.weight);
    }
  };

  const handleOpenBooking = (trip) => {
    setSelectedTrip(trip);
    setBookingStep('form');
    setPin(['', '', '', '', '', '']);
    setPaymentGateway('QRIS');
    setIsCheckingOut(false);
    setSeatCount(1);
    setPassengerName('');
    setPassengerPhone('');
    setItemCategory('Elektronik');
    setItemCount(1);
    setItemWeight(7);
    setItemSize('M');
    setReceiverName('');
    setReceiverPhone('');
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setBookingStep('pin');
  };

  const handlePinChange = (val, index) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;

    if (cleaned.length > 1) {
      const newPin = [...pin];
      for (let i = 0; i < 6; i++) {
        newPin[i] = cleaned[i] || '';
      }
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
    if (pin.some(p => p === '') || isCheckingOut || !selectedTrip) return;
    setIsCheckingOut(true);

    try {
      const orderPayload = {
        tripId: String(selectedTrip.id),
        type: serviceType === 'penumpang' ? 'passenger' : 'parcel',
        ...(serviceType === 'penumpang' ? {
          seatsBooked: safeSeatCount
        } : {
          items: [{
            itemName: itemCategory,
            itemCategory: itemCategory,
            quantity: safeItemCount,
            weightPerItemKg: itemWeight,
            sizeEnum: itemSize.toLowerCase(),
            recipientName: receiverName,
            recipientPhone: receiverPhone
          }]
        })
      };

      const resOrder = await apiClient.post('/orders', orderPayload);
      const createdOrder = resOrder.data;
      const orderIdStr = String(createdOrder.id);

      const pinString = pin.join('');
      await apiClient.post('/payments/checkout', {
        orderId: orderIdStr,
        paymentGateway: paymentGateway,
        pin: pinString
      });

      addTicket({
        id: orderIdStr,
        type: serviceType,
        title: serviceType === 'barang' ? `Nebeng Barang (${itemCategory})` : 'Nebeng Penumpang',
        from: selectedTrip.originPoint?.name || 'Pos Asal',
        to: selectedTrip.destinationPoint?.name || 'Pos Tujuan',
        mitra: selectedTrip.mitra?.name || 'Mitra',
        vehicle: selectedTrip.vehicle ? `${selectedTrip.vehicle.model} (${selectedTrip.vehicle.plateNumber})` : '-',
        schedule: `${selectedTrip.departureDate?.split('T')[0]} • Sesuai Jadwal`,
        totalPrice: formatRupiah(totalPrice),
        detail: serviceType === 'barang'
          ? `${safeItemCount} Item (${totalAccumulatedWeight} Kg) • Penerima: ${receiverName} (${receiverPhone})`
          : `${safeSeatCount} Kursi • Atas Nama ${passengerName} (${passengerPhone})`,
        status: 'Aktif',
        currentStatusText: 'Menunggu Check-in di Pos Asal',
        otp: createdOrder.otpClaim || null,
        trackingLogs: [
          { status: 'Booking Dikonfirmasi & Dana Diamankan (Escrow)', location: selectedTrip.originPoint?.name, time: 'Baru saja', completed: true, active: true },
          { status: 'Checked-in at Pos', location: selectedTrip.originPoint?.name, time: '-', completed: false, active: false },
          { status: 'In Transit', location: 'Dalam Perjalanan', time: '-', completed: false, active: false },
          { status: 'Arrived at Pos Destination', location: selectedTrip.destinationPoint?.name, time: '-', completed: false, active: false }
        ]
      });

      setBookingStep('success');
      toast.success('Pembayaran sukses dan dana telah diamankan di Escrow.', { title: 'Sukses' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'PIN salah atau gagal memproses pembayaran.', { title: 'Gagal' });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Compass className="w-3 h-3" /> EKSPLORASI LAYANAN
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Cari & Booking Trip
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Temukan perjalanan antar kota atau pengiriman barang dengan sistem keamanan Escrow terintegrasi.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Asal (Opsional)</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5 z-10" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                disabled={isLoadingPoints}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172] cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">Semua Pos Asal</option>
                {pickupPoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name} {point.city?.name ? `(${point.city.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Tujuan (Opsional)</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3.5 z-10" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isLoadingPoints}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172] cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">Semua Pos Tujuan</option>
                {pickupPoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name} {point.city?.name ? `(${point.city.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tanggal Keberangkatan</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input 
                type="date"
                min={TODAY_ISO}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tipe Layanan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('penumpang')}
                className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  serviceType === 'penumpang' 
                    ? 'bg-[#4B2172] text-white shadow-sm' 
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Users className="w-3 h-3" /> Penumpang
              </button>
              <button
                type="button"
                onClick={() => setServiceType('barang')}
                className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  serviceType === 'barang' 
                    ? 'bg-[#4B2172] text-white shadow-sm' 
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Package className="w-3 h-3" /> Barang
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[14px] font-bold text-neutral-800">Hasil Trip Tersedia ({trips.length})</h2>
        
        {isLoadingTrips ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-56" />
              </div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="purple">
                      {inferServiceType(trip) === 'penumpang' ? 'Nebeng Penumpang' : 'Nebeng Barang'}
                    </StatusBadge>
                    <span className="text-[9px] text-neutral-400 font-medium">Mitra: <strong className="text-neutral-700">{trip.mitra?.name || 'Mitra'}</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-800">
                    <span>{trip.originPoint?.name || 'Pos Asal'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4B2172]" />
                    <span>{trip.destinationPoint?.name || 'Pos Tujuan'}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-[9px] text-neutral-400 font-medium">
                    <span>📅 Tanggal: <strong className="text-neutral-700">{trip.departureDate?.split('T')[0]}</strong></span>
                    <span>🚗 Kendaraan: <strong className="text-neutral-700">{trip.vehicle ? `${trip.vehicle.model} (${trip.vehicle.plateNumber})` : '-'}</strong></span>
                    <span>⚡ Sisa Kapasitas: <strong className="text-[#4B2172]">{inferServiceType(trip) === 'penumpang' ? `${trip.seatAvailable} Kursi` : `${trip.remainingWeightCapacityKg} kg`}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="text-right">
                    <span className="text-[8px] text-neutral-400 block">Tarif Layanan</span>
                    <span className="text-[14px] font-bold text-emerald-600">{formatRupiah(trip.price)}</span>
                  </div>
                  <button 
                    onClick={() => handleOpenBooking(trip)}
                    className="w-full md:w-auto py-2.5 px-4 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                  >
                    Booking Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <EmptyState
              icon={Search}
              title="Trip Aktif Tidak Ditemukan"
              description="Tidak ada trip aktif atau mendatang yang sesuai dengan filter pencarian Anda."
            />
          </div>
        )}
      </div>

      <BaseModal
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={
          bookingStep === 'form' ? (serviceType === 'penumpang' ? 'Formulir Nebeng Penumpang' : 'Formulir Nebeng Barang') :
          bookingStep === 'pin' ? 'Checkout & Escrow Payment' : 'Konfirmasi Selesai'
        }
        subtitle="Booking Engine & Payment"
        maxWidth="max-w-md"
      >
        {bookingStep === 'form' && (
          <form onSubmit={handleProceedToPin} className="space-y-3 text-[10px]">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[9px] space-y-0.5">
              <p className="text-neutral-400">Rute: <strong className="text-neutral-800">{selectedTrip?.originPoint?.name} ➔ {selectedTrip?.destinationPoint?.name}</strong></p>
              <p className="text-neutral-400">Mitra: <strong className="text-neutral-800">{selectedTrip?.mitra?.name}</strong></p>
            </div>

            {serviceType === 'penumpang' && (
              <>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jumlah Kursi</label>
                  <input 
                    type="number"
                    min="1"
                    max={maxAllowedSeats}
                    value={seatCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSeatCount(isNaN(val) ? '' : Math.min(Math.max(val, 1), maxAllowedSeats));
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Penumpang</label>
                    <input 
                      type="text"
                      required
                      placeholder="Sesuai KTP"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                    <input 
                      type="text"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value.replace(/[^\d+]/g, ''))}
                      className={`w-full px-3 py-2 bg-neutral-50 border rounded-xl font-bold text-neutral-800 focus:outline-none ${
                        passengerPhone.trim() && !isPassengerPhoneValid ? 'border-rose-300 focus:border-rose-400' : 'border-neutral-200 focus:border-[#4B2172]'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {serviceType === 'barang' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kategori Barang</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    >
                      <option value="Elektronik">Elektronik</option>
                      <option value="Pakaian">Pakaian</option>
                      <option value="Dokumen">Dokumen</option>
                      <option value="Makanan">Makanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Ukuran Paket</label>
                    <select
                      value={itemSize}
                      onChange={(e) => handleSizeChange(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    >
                      {sizeOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jumlah Item</label>
                    <input 
                      type="number"
                      min="1"
                      value={itemCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setItemCount(isNaN(val) ? '' : Math.max(val, 1));
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Berat Per Item (Kg)</label>
                    <input 
                      type="number"
                      min="1"
                      value={itemWeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setItemWeight(isNaN(val) ? '' : Math.max(val, 1));
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Penerima</label>
                    <input 
                      type="text"
                      required
                      placeholder="Nama Penerima"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">No. HP Penerima</label>
                    <input 
                      type="text"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value.replace(/[^\d+]/g, ''))}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none"
                    />
                  </div>
                </div>

                {isOverWeightCapacity && (
                  <p className="text-[8px] text-rose-600 font-bold">⚠️ Total berat ({totalAccumulatedWeight} Kg) melebihi kapasitas sisa bagasi ({selectedTrip?.remainingWeightCapacityKg} Kg).</p>
                )}
              </>
            )}

            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
              <span className="text-[9px] font-bold text-neutral-600">
                Total ({quantity} unit × {formatRupiah(basePrice)})
              </span>
              <span className="text-[14px] font-bold text-[#4B2172]">{formatRupiah(totalPrice)}</span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition shadow-sm ${
                  !isFormValid 
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
                    : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
                }`}
              >
                Lanjut ke Pembayaran & PIN
              </button>
            </div>
          </form>
        )}

        {bookingStep === 'pin' && (
          <div className="space-y-4 text-center py-2 text-[10px]">
            <div className="w-9 h-9 bg-purple-50 text-[#4B2172] rounded-xl flex items-center justify-center mx-auto border border-purple-100">
              <Lock className="w-4 h-4" />
            </div>

            <div className="text-left space-y-1">
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Metode Pembayaran (Gateway)</label>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                <option value="QRIS">QRIS (Instant)</option>
                <option value="BANK_TRANSFER">Transfer Bank (Virtual Account)</option>
                <option value="MANUAL_SIMULATION">Simulasi Pembayaran Manual</option>
              </select>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-[#4B2172]" />
              <span className="text-neutral-500">Total Pembayaran (Escrow):</span>
              <span className="font-bold text-[#4B2172] text-[12px]">{formatRupiah(totalPrice)}</span>
            </div>
            <p className="text-[9px] text-neutral-400">Masukkan PIN transaksi rahasia Anda 6-digit untuk konfirmasi Escrow.</p>

            <div className="flex justify-center gap-1.5">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-input-${index}`}
                  type="password"
                  inputMode="numeric"
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value, index)}
                  onKeyDown={(e) => handlePinKeyDown(e, index)}
                  className="w-8 h-9 text-center text-[12px] font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#4B2172] font-mono"
                />
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setBookingStep('form')}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={pin.some(p => p === '') || isCheckingOut}
                onClick={handleVerifyPinAndCheckout}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition shadow-sm ${
                  pin.some(p => p === '') || isCheckingOut
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
                }`}
              >
                {isCheckingOut ? 'Memproses Escrow...' : 'Konfirmasi & Bayar'}
              </button>
            </div>
          </div>
        )}

        {bookingStep === 'success' && (
          <div className="text-center py-2 space-y-3 text-[10px]">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[14px] font-bold text-neutral-800">Pembayaran & Booking Berhasil!</h4>
            <p className="text-neutral-500">Dana Anda telah berhasil ditahan oleh sistem Escrow sampai paket/penumpang tiba di Pos Tujuan.</p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSelectedTrip(null)}
                className="py-2.5 px-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedTrip(null);
                  navigate('/customer/tickets');
                }}
                className="py-2.5 px-3.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl font-bold shadow-sm cursor-pointer"
              >
                Lihat Tiket Saya
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}