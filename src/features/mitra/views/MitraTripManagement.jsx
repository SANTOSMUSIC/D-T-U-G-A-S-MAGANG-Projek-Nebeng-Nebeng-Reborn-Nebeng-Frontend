import { useState, useEffect } from 'react';
import { Calendar, MapPin, Car, Bike, DollarSign, Plus, ShieldAlert, AlertTriangle, PhoneCall } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

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
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedEmergencyTrip, setSelectedEmergencyTrip] = useState(null);
  const [emergencyCategory, setEmergencyCategory] = useState('Kendaraan Mogok');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTrips(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const isSameOriginDestination = formData.origin === formData.destination;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSameOriginDestination) {
      toast.warning('Pos Asal dan Pos Tujuan tidak boleh sama. Silakan pilih rute yang berbeda.', { title: 'Rute Tidak Valid' });
      return;
    }
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

    // Reset form ke kondisi awal
    setFormData({
      origin: 'Solo (Pos Pusat)',
      destination: 'Yogyakarta',
      date: '',
      time: '',
      vehicle: 'Motor',
      seats: 1,
      luggage: 15,
    });
    setEstimatedEarnings(175000);

    toast.success('Trip baru berhasil dibuat dan dijadwalkan ke sistem!', { title: 'Trip Dibuat' });
  };

  const handleRequestStatusChange = (trip) => {
    if (trip.status === 'Selesai') return;
    const nextStatus = trip.status === 'Aktif' ? 'In Transit' : 'Selesai';
    setStatusConfirmTarget({ tripId: trip.id, nextStatus });
  };

  const handleConfirmStatusChange = () => {
    if (!statusConfirmTarget) return;
    const { tripId, nextStatus } = statusConfirmTarget;
    setTrips(trips.map(t => (t.id === tripId ? { ...t, status: nextStatus } : t)));
    toast.success(`Status trip ${tripId} berhasil diubah menjadi "${nextStatus}".`, { title: 'Status Diperbarui' });
    setStatusConfirmTarget(null);
  };

  const handleOpenEmergencyModal = (trip) => {
    setSelectedEmergencyTrip(trip);
    setEmergencyCategory('Kendaraan Mogok');
    setEmergencyDescription('');
    setIsEmergencyModalOpen(true);
  };

  const handleSubmitEmergency = (e) => {
    e.preventDefault();
    toast.error(
      `Trip ID: ${selectedEmergencyTrip.id}\nKendala: ${emergencyCategory}\nDetail: ${emergencyDescription || '-'}\nTim Pos & Bantuan Darurat Mitra telah diberi tahu.`,
      { title: '🚨 Darurat Dilaporkan', duration: 7000 }
    );
    setIsEmergencyModalOpen(false);
  };

  const getTripBadgeVariant = (status) => {
    if (status === 'Selesai') return 'emerald';
    if (status === 'In Transit') return 'amber';
    return 'purple';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Calendar className="w-3 h-3" /> MANAJEMEN JADWAL TRIP MITRA
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Create & Manage Trip
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Buat jadwal perjalanan baru, tentukan kapasitas otomatis kendaraan, dan pantau status laporan darurat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-1 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#4B2172]" /> Buat Trip Baru
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Asal</label>
              <select 
                name="origin" 
                value={formData.origin} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                <option value="Solo (Pos Pusat)">Solo (Pos Pusat)</option>
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Semarang">Semarang</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Tujuan</label>
              <select 
                name="destination" 
                value={formData.destination} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Solo (Pos Pusat)">Solo (Pos Pusat)</option>
                <option value="Semarang">Semarang</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tanggal</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jam Berangkat</label>
                <input 
                  type="time" 
                  name="time" 
                  required
                  value={formData.time} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pilih Kendaraan</label>
              <select 
                name="vehicle" 
                value={formData.vehicle} 
                onChange={handleVehicleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                <option value="Motor">Sepeda Motor</option>
                <option value="Mobil">Mobil</option>
              </select>
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
              <p className="text-[8px] font-bold text-[#4B2172] uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Konfigurasi Kapasitas
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 mb-0.5">Kursi</label>
                  <input 
                    type="number" 
                    name="seats" 
                    disabled={formData.vehicle === 'Motor'}
                    value={formData.seats} 
                    onChange={handleChange}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-[9px] font-bold ${formData.vehicle === 'Motor' ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed' : 'bg-white border border-neutral-200 text-neutral-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-neutral-400 mb-0.5">Bagasi (Kg)</label>
                  <input 
                    type="number" 
                    name="luggage" 
                    disabled={formData.vehicle === 'Motor'}
                    value={formData.luggage} 
                    onChange={handleChange}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-[9px] font-bold ${formData.vehicle === 'Motor' ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed' : 'bg-white border border-neutral-200 text-neutral-800'}`}
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#4B2172] rounded-xl text-white flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-purple-200">Estimasi Pendapatan</p>
                <h3 className="text-[14px] font-bold">Rp {estimatedEarnings.toLocaleString('id-ID')}</h3>
              </div>
              <DollarSign className="w-6 h-6 text-purple-200" />
            </div>

            {isSameOriginDestination && (
              <p className="text-[8px] text-rose-600 font-bold -mt-1">⚠️ Pos Asal dan Pos Tujuan tidak boleh sama.</p>
            )}

            <button 
              type="submit"
              disabled={isSameOriginDestination}
              className={`w-full py-3 rounded-xl text-[10px] font-bold transition shadow-sm ${
                isSameOriginDestination
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
              }`}
            >
              Publikasikan Trip Jadwal
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#4B2172]" /> Daftar Trip Terjadwal
            </h2>
          </div>

          <div className="space-y-3">
            {isLoadingTrips ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))
            ) : trips.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Ada Trip Terjadwal"
                description="Publikasikan trip pertama Anda lewat form di sebelah kiri."
              />
            ) : trips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                      
                      <button 
                        onClick={() => handleRequestStatusChange(trip)}
                        disabled={trip.status === 'Selesai'}
                        className="cursor-pointer"
                      >
                        <StatusBadge variant={getTripBadgeVariant(trip.status)}>
                          Status: {trip.status}
                        </StatusBadge>
                      </button>

                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1">
                        {trip.vehicle === 'Motor' ? <Bike className="w-2.5 h-2.5" /> : <Car className="w-2.5 h-2.5" />} {trip.vehicle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                      <MapPin className="w-3 h-3 text-[#4B2172] shrink-0" />
                      <span>{trip.origin} &rarr; {trip.destination}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[9px] text-neutral-400 font-medium">
                      <span>{trip.date} • {trip.time} WIB</span>
                      <span>Kursi: {trip.seats} | Bagasi: {trip.luggage} Kg</span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200">
                    <div>
                      <span className="text-[8px] uppercase font-bold text-neutral-400 block">Potensi Pendapatan</span>
                      <span className="text-[12px] font-bold text-emerald-600">{trip.estimation}</span>
                    </div>
                  </div>
                </div>

                {trip.status === 'In Transit' && (
                  <div className="pt-2.5 border-t border-amber-200/60 flex items-center justify-between bg-amber-50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5 text-amber-800 text-[9px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>In Transit di Rute</span>
                    </div>
                    <button
                      onClick={() => handleOpenEmergencyModal(trip)}
                      className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[8px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" /> Emergency Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(isEmergencyModalOpen && selectedEmergencyTrip)}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Laporan Darurat / Kendala"
        subtitle={`Trip ID: ${selectedEmergencyTrip?.id} (${selectedEmergencyTrip?.origin} ➔ ${selectedEmergencyTrip?.destination})`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSubmitEmergency} className="space-y-3 text-[10px]">
          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pilih Kendala Darurat</label>
            <select
              value={emergencyCategory}
              onChange={(e) => setEmergencyCategory(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-medium text-neutral-800 focus:outline-none focus:border-rose-600"
            >
              <option value="Kendaraan Mogok">Kendaraan Mogok / Mesin Rusak</option>
              <option value="Ban Bocor / Kempes">Ban Bocor / Kempes</option>
              <option value="Kecelakaan Lalu Lintas">Kecelakaan Lalu Lintas</option>
              <option value="Darurat Medis">Darurat Medis</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Catatan Detail Kendala</label>
            <textarea
              rows="2"
              placeholder="Sebutkan posisi landmark terdekat..."
              value={emergencyDescription}
              onChange={(e) => setEmergencyDescription(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-medium text-neutral-800 focus:outline-none focus:border-rose-600 resize-none"
            ></textarea>
          </div>

          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[8px] text-rose-700 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>Sinyal darurat dikirimkan langsung ke Pos Pemantau.</span>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
            >
              Kirim Laporan
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(statusConfirmTarget)}
        onClose={() => setStatusConfirmTarget(null)}
        title="Konfirmasi Perubahan Status"
        subtitle={`Trip ID: ${statusConfirmTarget?.tripId}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">
            {statusConfirmTarget?.nextStatus === 'Selesai'
              ? `Tandai trip ${statusConfirmTarget?.tripId} sebagai SELESAI? Setelah selesai, status ini bersifat final.`
              : `Ubah status trip ${statusConfirmTarget?.tripId} menjadi "In Transit"?`}
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStatusConfirmTarget(null)}
              className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmStatusChange}
              className="flex-1 py-2 bg-[#4B2172] text-white rounded-full font-bold cursor-pointer shadow-sm"
            >
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}