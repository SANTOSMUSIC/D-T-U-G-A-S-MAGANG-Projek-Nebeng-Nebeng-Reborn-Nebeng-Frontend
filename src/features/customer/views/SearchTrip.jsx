import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Compass, Search, MapPin, Calendar, Users, Package, ArrowRight, X, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function SearchTrip() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [serviceType, setServiceType] = useState('penumpang'); // 'penumpang' atau 'barang'

  // Simulasi loading data trip dari API setiap kali kriteria pencarian berubah
  
  // State untuk Modal Booking & Alur Checkout Keamanan PIN
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [bookingStep, setBookingStep] = useState('form'); // 'form' | 'pin' | 'success'
  
  // State PIN 6-digit
  const [pin, setPin] = useState(['', '', '', '', '', '']);

  // Form State - Nebeng Penumpang
  const [seatCount, setSeatCount] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  // Form State - Nebeng Barang (Termasuk Kategori Ukuran XXS - XL & Berat KG)
  const [itemCategory, setItemCategory] = useState('Elektronik');
  const [itemCount, setItemCount] = useState(1);
  const [itemWeight, setItemWeight] = useState(5); // kg per item
  const [itemSize, setItemSize] = useState('M'); // Pilihan ukuran XXS - XL
  const [, setItemPhoto] = useState(null); // preview foto belum ditampilkan di UI; disiapkan untuk saat upload disambungkan ke backend
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Pilihan kategori ukuran bagasi XXS hingga XL
  const sizeOptions = [
    { code: 'XXS', label: 'XXS', desc: 'Pouch / Dompet (< 1 kg)' },
    { code: 'XS', label: 'XS', desc: 'Tas Kecil / Buku (1-2 kg)' },
    { code: 'S', label: 'S', desc: 'Kotak Sepatu (2-5 kg)' },
    { code: 'M', label: 'M', desc: 'Ransel Standar (5-10 kg)' },
    { code: 'L', label: 'L', desc: 'Kardus Sedang (10-20 kg)' },
    { code: 'XL', label: 'XL', desc: 'Kardus Besar (> 20 kg)' },
  ];

  // Data mock trip
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
    },
    {
      id: 3,
      mitraName: 'Joko Widodo',
      origin: 'Pos Jakarta Pusat',
      destination: 'Pos Bandung Utara',
      date: '2026-08-26',
      type: 'penumpang',
      vehicle: 'Honda Mobilio (B 9999 XYZ)',
      vehicleCategory: 'mobil',
      price: 'Rp 120.000',
      capacity: '4 Kursi Tersedia',
      maxSeats: 4,
      rating: '5.0 (210 trip)'
    }
  ];

  // Ekstraksi pilihan unik untuk Pos Asal dan Pos Tujuan dari data tersedia
  const availableOrigins = [...new Set(mockTrips.map(trip => trip.origin))];
  const availableDestinations = [...new Set(mockTrips.map(trip => trip.destination))];

  // Logika Filter Berbasis Kriteria
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

  // Validasi kursi: motor maksimal 1, mobil maksimal sesuai maxSeats trip
  const maxAllowedSeats = selectedTrip?.vehicleCategory === 'motor' ? 1 : (selectedTrip?.maxSeats || 1);
  const isOverSeatCapacity = selectedTrip?.type === 'penumpang' && (seatCount > maxAllowedSeats || seatCount < 1);

  const isOverCapacity = isOverWeightCapacity || isOverSeatCapacity;

  const handleOpenBooking = (trip) => {
    setSelectedTrip(trip);
    setBookingStep('form');
    setPin(['', '', '', '', '', '']);
    setSeatCount(1);
    setItemCount(1);
    setItemWeight(5);
    setItemSize('M');
  };

  const handleProceedToPin = (e) => {
    e.preventDefault();
    if (isOverCapacity) return;
    setBookingStep('pin');
  };

  const handlePinChange = (value, index) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyPinAndCheckout = () => {
    if (pin.some(p => p === '')) return;
    setBookingStep('success');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5" /> Eksplorasi Layanan
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Cari & Booking Trip</h1>
        <p className="text-neutral-500 text-xs mt-0.5">Temukan perjalanan antar kota atau pengiriman barang dengan sistem keamanan Escrow terintegrasi.</p>
      </div>

      {/* Form Search & Filter */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Pos Asal</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                <MapPin className="w-4 h-4" />
              </span>
              <input 
                type="text"
                list="origin-options"
                placeholder="Pilih atau ketik Pos Asal"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
              />
              <datalist id="origin-options">
                {availableOrigins.map((item, index) => (
                  <option key={index} value={item} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Pos Tujuan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                <MapPin className="w-4 h-4" />
              </span>
              <input 
                type="text"
                list="destination-options"
                placeholder="Pilih atau ketik Pos Tujuan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
              />
              <datalist id="destination-options">
                {availableDestinations.map((item, index) => (
                  <option key={index} value={item} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Tanggal Keberangkatan</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                <Calendar className="w-4 h-4" />
              </span>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Tipe Layanan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('penumpang')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  serviceType === 'penumpang' 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Penumpang
              </button>
              <button
                type="button"
                onClick={() => setServiceType('barang')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  serviceType === 'barang' 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Barang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Hasil Trip */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-neutral-900 px-1">Hasil Trip Tersedia ({filteredTrips.length})</h2>
        
        {isLoadingTrips ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 w-full md:w-2/3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-3 w-full max-w-xs" />
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-32 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${trip.type === 'penumpang' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-pink-50 text-pink-700 border border-pink-100'}`}>
                      {trip.type === 'penumpang' ? 'Nebeng Penumpang' : 'Nebeng Barang'}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">Mitra: <strong className="text-neutral-700">{trip.mitraName}</strong> ({trip.rating})</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm font-extrabold text-neutral-900">
                    <span>{trip.origin}</span>
                    <ArrowRight className="w-4 h-4 text-pink-600" />
                    <span>{trip.destination}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500 font-medium">
                    <span>📅 Tanggal: <strong className="text-neutral-700">{trip.date}</strong></span>
                    <span>🚗 Kendaraan: <strong className="text-neutral-700">{trip.vehicle}</strong></span>
                    <span>⚡ Sisa Kapasitas: <strong className="text-pink-600">{trip.type === 'penumpang' ? trip.capacity : `${trip.remainingCapacityKg} kg`}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block">Tarif Layanan</span>
                    <span className="text-base font-extrabold text-pink-600">{trip.price}</span>
                  </div>
                  <button 
                    onClick={() => handleOpenBooking(trip)}
                    className="w-full md:w-auto py-3 px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-pink-900/20 cursor-pointer"
                  >
                    Booking Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <EmptyState
              icon={Search}
              title="Trip Tidak Ditemukan"
              description="Tidak ada trip yang sesuai dengan filter pencarian Anda. Coba ubah pos asal, tujuan, atau tanggal."
            />
          </div>
        )}
      </div>

      {/* MODAL BOOKING ENGINE & PIN SECURITY CHECKOUT */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-neutral-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-widest block">Booking Engine & Checkout</span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  {bookingStep === 'form' && (selectedTrip.type === 'penumpang' ? 'Formulir Nebeng Penumpang' : 'Formulir Nebeng Barang')}
                  {bookingStep === 'pin' && 'Keamanan Transaksi & Checkout'}
                  {bookingStep === 'success' && 'Konfirmasi Selesai'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORMULIR PEMESANAN */}
            {bookingStep === 'form' && (
              <form onSubmit={handleProceedToPin} className="space-y-4">
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs space-y-1">
                  <p className="text-neutral-500 font-medium">Rute: <strong className="text-neutral-800">{selectedTrip.origin} ➔ {selectedTrip.destination}</strong></p>
                  <p className="text-neutral-500 font-medium">Mitra: <strong className="text-neutral-800">{selectedTrip.mitraName}</strong> ({selectedTrip.vehicle})</p>
                </div>

                {selectedTrip.type === 'penumpang' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Jumlah Kursi {selectedTrip.vehicleCategory === 'motor' ? '(Maks 1 untuk Motor)' : ''}
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max={maxAllowedSeats}
                        value={seatCount}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value) || 1;
                          const clamped = Math.min(Math.max(raw, 1), maxAllowedSeats);
                          setSeatCount(clamped);
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                      />
                      {selectedTrip.vehicleCategory === 'motor' && (
                        <p className="text-[10px] text-amber-600 mt-1 font-medium">⚠️ Kendaraan berupa Sepeda Motor dibatasi maksimal 1 kursi penumpang.</p>
                      )}
                      {isOverSeatCapacity && (
                        <p className="text-[10px] text-red-600 mt-1 font-bold">⚠️ Gagal: Jumlah kursi melebihi sisa kapasitas tersedia ({maxAllowedSeats} kursi).</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Lengkap Penumpang</label>
                      <input 
                        type="text"
                        required
                        placeholder="Sesuai kartu identitas (KTP)"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Nomor WhatsApp / HP Penumpang</label>
                      <input 
                        type="tel"
                        inputMode="numeric"
                        required
                        placeholder="08xxxxxxxxxx"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                      />
                    </div>
                  </>
                )}

                {selectedTrip.type === 'barang' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Kategori Barang</label>
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                        >
                          <option value="Elektronik">Elektronik</option>
                          <option value="Pakaian">Pakaian / Tekstil</option>
                          <option value="Dokumen">Dokumen Penting</option>
                          <option value="Makanan">Makanan / Kue</option>
                          <option value="Lainnya">Barang Umum Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Item</label>
                        <input 
                          type="number"
                          min="1"
                          value={itemCount}
                          onChange={(e) => setItemCount(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Estimasi Berat per Item (Kg)</label>
                        <input 
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={itemWeight}
                          onChange={(e) => setItemWeight(parseFloat(e.target.value) || 0.1)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Foto Paket</label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setItemPhoto(e.target.files[0])}
                          className="w-full text-[10px] text-neutral-500 file:mr-2 file:py-2.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* PILIHAN KATEGORI UKURAN FISIK (XXS hingga XL) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">Kategori Ukuran Fisik Bagasi (XXS - XL)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {sizeOptions.map((size) => (
                          <button
                            type="button"
                            key={size.code}
                            onClick={() => setItemSize(size.code)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              itemSize === size.code 
                                ? 'bg-pink-50 border-pink-600 text-pink-900 shadow-sm' 
                                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-0.5">
                              <span className="font-black text-xs">{size.label}</span>
                              {itemSize === size.code && <span className="text-[10px] text-pink-600 font-bold">✓</span>}
                            </div>
                            <span className="text-[9px] text-neutral-500 leading-tight">{size.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Penerima</label>
                        <input 
                          type="text"
                          required
                          placeholder="Nama lengkap penerima"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">No HP Penerima</label>
                        <input 
                          type="tel"
                          inputMode="numeric"
                          required
                          placeholder="08xxxxxxxxxx"
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
                        />
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${isOverCapacity ? 'bg-red-50 border-red-200 text-red-700' : 'bg-pink-50/50 border-pink-100 text-neutral-700'}`}>
                      {isOverCapacity ? <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" /> : <ShieldCheck className="w-4 h-4 shrink-0 text-pink-600 mt-0.5" />}
                      <div>
                        <p className="font-bold">Akumulasi: {totalAccumulatedWeight} Kg • Ukuran: {itemSize}</p>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          {isOverCapacity 
                            ? `⚠️ Gagal: Total berat (${totalAccumulatedWeight} kg) melebihi sisa kapasitas bagasi Mitra (${selectedTrip.remainingCapacityKg} kg).`
                            : `Sisa kapasitas bagasi Mitra mencukupi (${selectedTrip.remainingCapacityKg} kg max).`}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTrip(null)}
                    className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isOverCapacity}
                    className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-lg ${
                      isOverCapacity 
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none' 
                        : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 cursor-pointer'
                    }`}
                  >
                    Lanjut ke Otentikasi PIN
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PIN TRANSACTION SECURITY & CHECKOUT */}
            {bookingStep === 'pin' && (
              <div className="space-y-6 text-center py-2">
                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto border border-pink-100 shadow-sm">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-neutral-900">Masukkan PIN Keamanan 6-Digit</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Masukkan PIN transaksi rahasia Anda untuk mengonfirmasi pembayaran Escrow pada trip ini.
                  </p>
                </div>

                {/* Input Kotak 6-Digit PIN */}
                <div className="flex justify-center gap-2">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-input-${index}`}
                      type="password"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''), index)}
                      className="w-11 h-12 text-center text-lg font-extrabold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-pink-600 focus:bg-white text-neutral-900 shadow-sm"
                    />
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep('form')}
                    className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={pin.some(p => p === '')}
                    onClick={handleVerifyPinAndCheckout}
                    className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition shadow-lg ${
                      pin.some(p => p === '')
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                        : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 cursor-pointer'
                    }`}
                  >
                    Konfirmasi Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {bookingStep === 'success' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-neutral-900">Booking & Pembayaran Berhasil!</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  PIN terotentikasi. Dana Anda telah diamankan melalui sistem Escrow terintegrasi. Silakan lakukan verifikasi dan serah terima di pos.
                </p>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="py-3 px-6 bg-pink-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-pink-700 transition cursor-pointer"
                >
                  Tutup & Kembali
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}