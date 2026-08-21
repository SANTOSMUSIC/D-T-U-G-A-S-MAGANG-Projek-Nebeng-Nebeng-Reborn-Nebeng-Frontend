import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Car, Bike, DollarSign, Plus, ShieldAlert, AlertTriangle, PhoneCall, X } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function MitraTripManagement() {
  const toast = useToast();
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [trips, setTrips] = useState([
    { id: 'TRIP-701', origin: 'Solo (Pos Pusat)', destination: 'Yogyakarta', date: '2026-08-25', time: '08:00', vehicle: 'Motor', seats: 1, luggage: 15, estimation: 'Rp 175.000', status: 'In Transit' },
    { id: 'TRIP-702', origin: 'Solo', destination: 'Semarang', date: '2026-08-26', time: '10:00', vehicle: 'Mobil', seats: 4, luggage: 45, estimation: 'Rp 450.000', status: 'Aktif' }
  ]);

  const [formData, setFormData] = useState({
    origin: 'Solo (Pos Pusat)',
    destination: 'Yogyakarta',
    date: '',
    time: '',
    vehicle: 'Motor',
    seats: 1,
    luggage: 15,
  });

  const [estimatedEarnings, setEstimatedEarnings] = useState(175000);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTrips(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // State untuk Modal Emergency / Breakdown Report
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedEmergencyTrip, setSelectedEmergencyTrip] = useState(null);
  const [emergencyCategory, setEmergencyCategory] = useState('Kendaraan Mogok');
  const [emergencyDescription, setEmergencyDescription] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Penguncian Otomatis Kapasitas & Kalkulasi Pendapatan Berdasarkan Jenis Kendaraan.
  // Dijalankan langsung di handler perubahan (bukan lewat useEffect terpisah)
  // supaya default kapasitas & estimasi pendapatan langsung sinkron saat kendaraan diganti.
  const handleVehicleChange = (e) => {
    const vehicle = e.target.value;
    if (vehicle === 'Motor') {
      setFormData(prev => ({ ...prev, vehicle, seats: 1, luggage: 15 }));
      setEstimatedEarnings(175000);
    } else {
      setFormData(prev => ({ ...prev, vehicle, seats: 4, luggage: 40 }));
      setEstimatedEarnings(450000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrip = {
      id: `TRIP-70${trips.length + 1}`,
      origin: formData.origin,
      destination: formData.destination,
      date: formData.date,
      time: formData.time,
      vehicle: formData.vehicle,
      seats: formData.seats,
      luggage: formData.luggage,
      estimation: `Rp ${estimatedEarnings.toLocaleString('id-ID')}`,
      status: 'Aktif'
    };
    setTrips([newTrip, ...trips]);
    toast.success('Trip baru berhasil dibuat dan dijadwalkan ke sistem!', { title: 'Trip Dibuat' });
  };

  // Fungsi untuk mengubah status perjalanan (Aktif -> In Transit -> Selesai)
  const handleCycleStatus = (tripId) => {
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        let nextStatus;
        if (trip.status === 'Aktif') nextStatus = 'In Transit';
        else if (trip.status === 'In Transit') nextStatus = 'Selesai';
        else nextStatus = 'Aktif';
        return { ...trip, status: nextStatus };
      }
      return trip;
    }));
  };

  // Handler Buka Modal Emergency
  const handleOpenEmergencyModal = (trip) => {
    setSelectedEmergencyTrip(trip);
    setEmergencyCategory('Kendaraan Mogok');
    setEmergencyDescription('');
    setIsEmergencyModalOpen(true);
  };

  // Handler Kirim Laporan Darurat
  const handleSubmitEmergency = (e) => {
    e.preventDefault();
    toast.error(
      `Trip ID: ${selectedEmergencyTrip.id}\nKendala: ${emergencyCategory}\nDetail: ${emergencyDescription || '-'}\nTim Pos & Bantuan Darurat Mitra telah diberi tahu.`,
      { title: '🚨 Darurat Dilaporkan', duration: 7000 }
    );
    setIsEmergencyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" /> Manajemen Jadwal Trip Mitra
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Create & Manage Trip</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Buat jadwal perjalanan baru, tentukan kapasitas otomatis kendaraan, dan pantau status serta laporan darurat perjalanan[cite: 6].</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Buat Trip Baru */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-1">
          <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2 mb-6">
            <Plus className="w-4 h-4 text-pink-600" /> Buat Trip Baru
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Pos Asal</label>
              <select 
                name="origin" 
                value={formData.origin} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Solo (Pos Pusat)">Solo (Pos Pusat)</option>
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Semarang">Semarang</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Pos Tujuan</label>
              <select 
                name="destination" 
                value={formData.destination} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Solo (Pos Pusat)">Solo (Pos Pusat)</option>
                <option value="Semarang">Semarang</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Tanggal</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Jam Berangkat</label>
                <input 
                  type="time" 
                  name="time" 
                  required
                  value={formData.time} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Pilih Kendaraan</label>
              <select 
                name="vehicle" 
                value={formData.vehicle} 
                onChange={handleVehicleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Motor">Sepeda Motor</option>
                <option value="Mobil">Mobil</option>
              </select>
            </div>

            {/* Penguncian / Input Kapasitas Otomatis */}
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-3">
              <p className="text-[10px] font-extrabold text-pink-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Konfigurasi Kapasitas
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Kapasitas Kursi</label>
                  <input 
                    type="number" 
                    name="seats" 
                    disabled={formData.vehicle === 'Motor'}
                    value={formData.seats} 
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${formData.vehicle === 'Motor' ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed' : 'bg-white border border-neutral-200 text-neutral-800'}`}
                  />
                  {formData.vehicle === 'Motor' && <span className="text-[9px] text-pink-600 mt-0.5 block">Dikunci: 1 Penumpang</span>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Max Bagasi (Kg)</label>
                  <input 
                    type="number" 
                    name="luggage" 
                    disabled={formData.vehicle === 'Motor'}
                    value={formData.luggage} 
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${formData.vehicle === 'Motor' ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed' : 'bg-white border border-neutral-200 text-neutral-800'}`}
                  />
                  {formData.vehicle === 'Motor' && <span className="text-[9px] text-pink-600 mt-0.5 block">Dikunci: Max 15 Kg</span>}
                </div>
              </div>
            </div>

            {/* Kalkulasi Estimasi Pendapatan Otomatis */}
            <div className="p-4 bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl text-white flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-pink-100">Estimasi Pendapatan Sistem</p>
                <h3 className="text-lg font-extrabold">Rp {estimatedEarnings.toLocaleString('id-ID')}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-pink-200 opacity-80" />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-900/20 cursor-pointer"
            >
              Publikasikan Trip Jadwal
            </button>
          </form>
        </div>

        {/* List & Manajemen Trip Aktif */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-600" /> Daftar Trip Terjadwal
            </h2>
            <span className="text-[11px] text-neutral-500 font-medium">Klik status trip untuk simulasi perubahan status (*Aktif $\leftrightarrow$ In Transit*)</span>
          </div>

          <div className="space-y-4">
            {isLoadingTrips ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))
            ) : trips.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Ada Trip Terjadwal"
                description="Publikasikan trip pertama Anda lewat form di sebelah kiri."
              />
            ) : trips.map((trip) => (
              <div key={trip.id} className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-neutral-900">{trip.id}</span>
                      
                      {/* Status Badge clickable untuk simulasi */}
                      <button 
                        onClick={() => handleCycleStatus(trip.id)}
                        title="Klik untuk ubah status trip"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                          trip.status === 'In Transit' 
                            ? 'bg-amber-500 text-white animate-pulse' 
                            : trip.status === 'Selesai' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        Status: {trip.status} 🔄
                      </button>

                      <span className="bg-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        {trip.vehicle === 'Motor' ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />} {trip.vehicle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                      <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
                      <span>{trip.origin} &rarr; {trip.destination}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {trip.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.time} WIB</span>
                      <span>Kursi: {trip.seats} | Bagasi: {trip.luggage} Kg</span>
                    </div>
                  </div>

                  <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Potensi Pendapatan</span>
                      <span className="text-sm font-extrabold text-emerald-600">{trip.estimation}</span>
                    </div>
                    <button className="mt-2 px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer">
                      Kelola Trip
                    </button>
                  </div>
                </div>

                {/* TOMBOL AKSI DARURAT: HANYA MUNCUL KETIKA STATUS BERADA DI POSISI "In Transit" */}
                {trip.status === 'In Transit' && (
                  <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between bg-amber-50/80 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                      <span>Perjalanan Sedang Berlangsung (In Transit) di Rute</span>
                    </div>
                    <button
                      onClick={() => handleOpenEmergencyModal(trip)}
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Emergency / Breakdown Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL EMERGENCY / BREAKDOWN REPORT */}
      {isEmergencyModalOpen && selectedEmergencyTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-extrabold text-neutral-900">Laporan Darurat / Kendala (Breakdown)</h3>
              </div>
              <button 
                onClick={() => setIsEmergencyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmergency} className="space-y-4">
              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 text-xs space-y-1">
                <p className="text-neutral-500">Trip ID: <strong className="text-neutral-800">{selectedEmergencyTrip.id}</strong></p>
                <p className="text-neutral-500">Rute: <strong className="text-neutral-800">{selectedEmergencyTrip.origin} ➔ {selectedEmergencyTrip.destination}</strong></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Jenis Kendala Darurat</label>
                <select
                  value={emergencyCategory}
                  onChange={(e) => setEmergencyCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-red-600"
                >
                  <option value="Kendaraan Mogok">Kendaraan Mogok / Mesin Rusak</option>
                  <option value="Ban Bocor / Kempes">Ban Bocor / Kempes</option>
                  <option value="Kecelakaan Lalu Lintas">Kecelakaan Lalu Lintas</option>
                  <option value="Darurat Medis Pengemudi/Penumpang">Darurat Medis (Pengemudi/Penumpang)</option>
                  <option value="Kendala Keamanan / Lainnya">Kendala Keamanan / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Catatan Lokasi / Detail Kendala</label>
                <textarea
                  rows="3"
                  placeholder="Sebutkan posisi landmark terdekat atau kondisi darurat secara ringkas..."
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-red-600 resize-none"
                ></textarea>
              </div>

              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-[11px] text-red-700 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 shrink-0 text-red-600" />
                <span>Tombol ini akan mengirimkan sinyal darurat langsung ke Pos Pemantau & Tim Bantuan Lapangan.</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Kirim Laporan Darurat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}