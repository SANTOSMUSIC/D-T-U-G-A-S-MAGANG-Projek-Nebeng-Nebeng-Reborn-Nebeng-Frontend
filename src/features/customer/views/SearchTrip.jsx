import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Compass, Search, MapPin, Calendar, Users, Package, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useTickets } from '../../../context/TicketsContext';

export default function SearchTrip() {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [serviceType, setServiceType] = useState('penumpang');

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingStep, setBookingStep] = useState('form');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
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

  const mockTrips = [
    {
      id: 1,
      mitraName: 'Budi Santoso',
      origin: 'Pos Solo Kota',
      destination: 'Pos Semarang Indah',
      date: '2026-08-25',
      type: 'penumpang',
      vehicle: 'Toyota Avanza (H 1234 AB)',
      vehicleCategory: 'mobil',
      price: 'Rp 75.000',
      capacity: '3 Kursi Tersedia',
      maxSeats: 3,
      rating: '4.9 (120 trip)'
    },
    {
      id: 2,
      mitraName: 'Siti Aminah',
      origin: 'Pos Solo Kota',
      destination: 'Pos Yogyakarta Pusat',
      date: '2026-08-25',
      type: 'barang',
      vehicle: 'Yamaha NMAX (AD 5678 CD - Motor)',
      vehicleCategory: 'motor',
      price: 'Rp 50.000 / paket',
      remainingCapacityKg: 20,
      rating: '4.8 (85 trip)'
    }
  ];

  const filteredTrips = mockTrips.filter(trip => {
    const matchOrigin = origin ? trip.origin.toLowerCase().includes(origin.toLowerCase()) : true;
    const matchDest = destination ? trip.destination.toLowerCase().includes(destination.toLowerCase()) : true;
    const matchDate = date ? trip.date === date : true;
    const matchType = serviceType ? trip.type === serviceType : true;
    return matchOrigin && matchDest && matchDate && matchType;
  });

  const isLoadingTrips = useSimulatedLoading([origin, destination, date, serviceType], 700);

  const totalAccumulatedWeight = itemCount * itemWeight;
  const isOverWeightCapacity = selectedTrip?.type === 'barang' && totalAccumulatedWeight > (selectedTrip?.remainingCapacityKg || 0);
  const maxAllowedSeats = selectedTrip?.vehicleCategory === 'motor' ? 1 : (selectedTrip?.maxSeats || 1);
  const isOverSeatCapacity = selectedTrip?.type === 'penumpang' && (seatCount > maxAllowedSeats || seatCount < 1);
  const isOverCapacity = isOverWeightCapacity || isOverSeatCapacity;

  const isPassengerValid = selectedTrip?.type === 'penumpang' ? (passengerName.trim() !== '' && passengerPhone.trim() !== '') : true;
  const isBarangValid = selectedTrip?.type === 'barang' ? (receiverName.trim() !== '' && receiverPhone.trim() !== '') : true;
  const isFormValid = !isOverCapacity && isPassengerValid && isBarangValid;

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

  const handlePinChange = (value, index) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      document.getElementById(`pin-input-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifyPinAndCheckout = () => {
    if (pin.some(p => p === '') || isCheckingOut) return;
    setIsCheckingOut(true);

    const isBarang = selectedTrip.type === 'barang';
    const newTicketId = `TKT-${selectedTrip.id}-${Date.now().toString().slice(-6)}`;

    addTicket({
      id: newTicketId,
      type: selectedTrip.type,
      title: isBarang ? `Nebeng Barang (Paket ${itemCategory})` : 'Nebeng Penumpang',
      from: selectedTrip.origin,
      to: selectedTrip.destination,
      mitra: selectedTrip.mitraName,
      vehicle: selectedTrip.vehicle,
      schedule: `${selectedTrip.date} • Sesuai Jadwal Trip Mitra`,
      detail: isBarang
        ? `${itemCount} Item (${totalAccumulatedWeight} Kg) • Penerima: ${receiverName || '-'} (${receiverPhone || '-'})`
        : `${seatCount} Kursi • Atas Nama ${passengerName || '-'} (${passengerPhone || '-'})`,
      status: 'Aktif',
      currentStatusText: 'Menunggu Check-in di Pos Asal',
      otp: isBarang ? String(Math.floor(100000 + Math.random() * 900000)) : null,
      trackingLogs: [
        { status: 'Booking Dikonfirmasi & Dana Diamankan (Escrow)', location: selectedTrip.origin, time: 'Baru saja', completed: true, active: true },
        { status: 'Checked-in at Pos', location: selectedTrip.origin, time: '-', completed: false, active: false },
        { status: 'In Transit', location: `Menuju ${selectedTrip.destination}`, time: '-', completed: false, active: false },
        { status: 'Arrived at Pos Destination', location: selectedTrip.destination, time: '-', completed: false, active: false }
      ]
    });

    setBookingStep('success');
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
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Asal</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Pilih atau ketik Pos Asal"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Tujuan</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Pilih atau ketik Pos Tujuan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tanggal Keberangkatan</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input 
                type="date"
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
        <h2 className="text-[14px] font-bold text-neutral-800">Hasil Trip Tersedia ({filteredTrips.length})</h2>
        
        {isLoadingTrips ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-56" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="purple">
                      {trip.type === 'penumpang' ? 'Nebeng Penumpang' : 'Nebeng Barang'}
                    </StatusBadge>
                    <span className="text-[9px] text-neutral-400 font-medium">Mitra: <strong className="text-neutral-700">{trip.mitraName}</strong> ({trip.rating})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-800">
                    <span>{trip.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4B2172]" />
                    <span>{trip.destination}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-[9px] text-neutral-400 font-medium">
                    <span>📅 Tanggal: <strong className="text-neutral-700">{trip.date}</strong></span>
                    <span>🚗 Kendaraan: <strong className="text-neutral-700">{trip.vehicle}</strong></span>
                    <span>⚡ Sisa Kapasitas: <strong className="text-[#4B2172]">{trip.type === 'penumpang' ? trip.capacity : `${trip.remainingCapacityKg} kg`}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="text-right">
                    <span className="text-[8px] text-neutral-400 block">Tarif Layanan</span>
                    <span className="text-[14px] font-bold text-emerald-600">{trip.price}</span>
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
              title="Trip Tidak Ditemukan"
              description="Tidak ada trip yang sesuai dengan filter pencarian Anda."
            />
          </div>
        )}
      </div>

      <BaseModal
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={
          bookingStep === 'form' ? (selectedTrip?.type === 'penumpang' ? 'Formulir Nebeng Penumpang' : 'Formulir Nebeng Barang') :
          bookingStep === 'pin' ? 'Keamanan Transaksi & Checkout' : 'Konfirmasi Selesai'
        }
        subtitle="Booking Engine & Checkout"
        maxWidth="max-w-md"
      >
        {bookingStep === 'form' && (
          <form onSubmit={handleProceedToPin} className="space-y-3 text-[10px]">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[9px] space-y-0.5">
              <p className="text-neutral-400">Rute: <strong className="text-neutral-800">{selectedTrip?.origin} ➔ {selectedTrip?.destination}</strong></p>
              <p className="text-neutral-400">Mitra: <strong className="text-neutral-800">{selectedTrip?.mitraName}</strong> ({selectedTrip?.vehicle})</p>
            </div>

            {selectedTrip?.type === 'penumpang' && (
              <>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jumlah Kursi</label>
                  <input 
                    type="number"
                    min="1"
                    max={maxAllowedSeats}
                    value={seatCount}
                    onChange={(e) => setSeatCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), maxAllowedSeats))}
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
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedTrip?.type === 'barang' && (
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
                      onChange={(e) => setItemCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Berat Per Item (Kg)</label>
                    <input 
                      type="number"
                      min="1"
                      value={itemWeight}
                      onChange={(e) => setItemWeight(parseInt(e.target.value) || 1)}
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
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                    />
                  </div>
                </div>

                {isOverWeightCapacity && (
                  <p className="text-[8px] text-rose-600 font-bold">⚠️ Total berat ({totalAccumulatedWeight} Kg) melebihi batas sisa bagasi ({selectedTrip?.remainingCapacityKg} Kg).</p>
                )}
              </>
            )}

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
                Lanjut ke PIN
              </button>
            </div>
          </form>
        )}

        {bookingStep === 'pin' && (
          <div className="space-y-4 text-center py-2 text-[10px]">
            <div className="w-9 h-9 bg-purple-50 text-[#4B2172] rounded-xl flex items-center justify-center mx-auto border border-purple-100">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-[9px] text-neutral-400">Masukkan PIN transaksi rahasia Anda 6-digit.</p>

            <div className="flex justify-center gap-1.5">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-input-${index}`}
                  type="password"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''), index)}
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
                {isCheckingOut ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        )}

        {bookingStep === 'success' && (
          <div className="text-center py-2 space-y-3 text-[10px]">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[14px] font-bold text-neutral-800">Booking Berhasil!</h4>
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
                Lihat Tiket
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}