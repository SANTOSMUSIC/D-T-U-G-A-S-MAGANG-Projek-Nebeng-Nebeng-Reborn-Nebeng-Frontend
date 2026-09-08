import { useState, useMemo } from 'react';
import { Calendar, MapPin, Car, Bike, DollarSign, Plus, ShieldAlert, AlertTriangle, PhoneCall, XCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useMitraData, estimateFare } from '../../../context/MitraDataContext';

// CATATAN KESESUAIAN SCHEMA (belum bisa diperbaiki penuh di sini): ini
// masih daftar nama kota statis, bukan data asli dari model PickupPoint/
// City di schema.prisma (yang punya id, koordinat, operator pos, dst).
// Trip.originPointId/destinationPointId di backend butuh ID PickupPoint
// yang valid, bukan sekadar nama string seperti ini. Ganti dengan hasil
// fetch nyata (mis. GET /api/pickup-points) begitu endpointnya tersedia.
const ROUTE_OPTIONS = ['Solo (Pos Pusat)', 'Yogyakarta', 'Semarang', 'Surabaya'];

export default function MitraTripManagement() {
  const toast = useToast();
  const { trips, addTrip, cancelTrip, updateTripStatus } = useMitraData();

  const [formData, setFormData] = useState({
    origin: 'Solo (Pos Pusat)',
    destination: 'Yogyakarta',
    date: '',
    time: '',
    vehicle: 'Motor',
    seats: 1,
    luggage: 15,
  });

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedEmergencyTrip, setSelectedEmergencyTrip] = useState(null);
  const [emergencyCategory, setEmergencyCategory] = useState('Kendaraan Mogok');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  // Tarif dihitung ulang secara live berdasarkan rute & kendaraan yang dipilih,
  // bukan angka tetap per jenis kendaraan seperti sebelumnya.
  const estimatedEarnings = useMemo(
    () => estimateFare(formData.origin, formData.destination, formData.vehicle),
    [formData.origin, formData.destination, formData.vehicle]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (e) => {
    const vehicle = e.target.value;
    if (vehicle === 'Motor') {
      setFormData(prev => ({ ...prev, vehicle, seats: 1, luggage: 15 }));
    } else {
      setFormData(prev => ({ ...prev, vehicle, seats: 4, luggage: 40 }));
    }
  };

  const isSameOriginDestination = formData.origin === formData.destination;

  // Cek bentrok jadwal: kendaraan yang sama tidak boleh punya trip aktif lain
  // di tanggal & jam yang persis sama.
  const isScheduleConflict = useMemo(() => {
    if (!formData.date || !formData.time) return false;
    return trips.some((t) =>
      (t.status === 'Aktif' || t.status === 'In Transit') &&
      t.date === formData.date &&
      t.time === formData.time &&
      t.vehicle === formData.vehicle
    );
  }, [trips, formData.date, formData.time, formData.vehicle]);

  const isPastDate = Boolean(formData.date) && formData.date < todayISO;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSameOriginDestination) {
      toast.warning('Pos Asal dan Pos Tujuan tidak boleh sama. Silakan pilih rute yang berbeda.', { title: 'Rute Tidak Valid' });
      return;
    }
    if (isPastDate) {
      toast.warning('Tanggal trip tidak boleh di masa lalu.', { title: 'Tanggal Tidak Valid' });
      return;
    }
    if (isScheduleConflict) {
      toast.warning('Sudah ada trip terjadwal untuk kendaraan ini pada tanggal & jam yang sama.', { title: 'Jadwal Bentrok' });
      return;
    }

    addTrip({ ...formData });

    setFormData({
      origin: 'Solo (Pos Pusat)',
      destination: 'Yogyakarta',
      date: '',
      time: '',
      vehicle: 'Motor',
      seats: 1,
      luggage: 15,
    });

    toast.success('Trip baru berhasil dibuat dan dijadwalkan ke sistem!', { title: 'Trip Dibuat' });
  };

  const handleRequestStatusChange = (trip) => {
    if (trip.status === 'Selesai' || trip.status === 'Dibatalkan') return;
    const nextStatus = trip.status === 'Aktif' ? 'In Transit' : 'Selesai';
    setStatusConfirmTarget({ tripId: trip.id, nextStatus });
  };

  const handleConfirmStatusChange = () => {
    if (!statusConfirmTarget) return;
    const { tripId, nextStatus } = statusConfirmTarget;
    updateTripStatus(tripId, nextStatus);
    toast.success(
      nextStatus === 'Selesai'
        ? `Trip ${tripId} selesai. Dana escrow otomatis cair ke Available Balance.`
        : `Status trip ${tripId} berhasil diubah menjadi "${nextStatus}".`,
      { title: 'Status Diperbarui' }
    );
    setStatusConfirmTarget(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelConfirmTarget) return;
    cancelTrip(cancelConfirmTarget);
    toast.success(`Trip ${cancelConfirmTarget} berhasil dibatalkan.`, { title: 'Trip Dibatalkan' });
    setCancelConfirmTarget(null);
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

  const visibleTrips = trips.filter((t) => t.status !== 'Dibatalkan');
  const cancelledTrips = trips.filter((t) => t.status === 'Dibatalkan');

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
                {ROUTE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
                {ROUTE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tanggal</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  min={todayISO}
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
                    min={1}
                    max={formData.vehicle === 'Motor' ? 1 : 8}
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
                    min={1}
                    max={formData.vehicle === 'Motor' ? 15 : 500}
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
            {isPastDate && (
              <p className="text-[8px] text-rose-600 font-bold -mt-1">⚠️ Tanggal trip tidak boleh di masa lalu.</p>
            )}
            {isScheduleConflict && (
              <p className="text-[8px] text-rose-600 font-bold -mt-1">⚠️ Jadwal bentrok dengan trip lain di kendaraan yang sama.</p>
            )}

            <button 
              type="submit"
              disabled={isSameOriginDestination || isPastDate || isScheduleConflict}
              className={`w-full py-3 rounded-xl text-[10px] font-bold transition shadow-sm ${
                isSameOriginDestination || isPastDate || isScheduleConflict
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
            {visibleTrips.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Belum Ada Trip Terjadwal"
                description="Publikasikan trip pertama Anda lewat form di sebelah kiri."
              />
            ) : visibleTrips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/60 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[10px] text-neutral-800 font-mono">{trip.id}</span>
                      
                      <button 
                        onClick={() => handleRequestStatusChange(trip)}
                        disabled={trip.status === 'Selesai'}
                        className="cursor-pointer"
                        title="Klik untuk ubah status"
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

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200">
                    <div className="text-right">
                      <span className="text-[8px] uppercase font-bold text-neutral-400 block">Potensi Pendapatan</span>
                      <span className="text-[12px] font-bold text-emerald-600">Rp {trip.estimation.toLocaleString('id-ID')}</span>
                    </div>
                    {trip.status === 'Aktif' && (
                      <button
                        onClick={() => setCancelConfirmTarget(trip.id)}
                        className="text-[8px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" /> Batalkan Trip
                      </button>
                    )}
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

            {cancelledTrips.length > 0 && (
              <details className="pt-2">
                <summary className="text-[9px] font-bold text-neutral-400 cursor-pointer select-none">
                  Trip Dibatalkan ({cancelledTrips.length})
                </summary>
                <div className="space-y-2 mt-2">
                  {cancelledTrips.map((trip) => (
                    <div key={trip.id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/40 opacity-60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[10px] text-neutral-600 font-mono">{trip.id}</span>
                        <p className="text-[9px] text-neutral-500">{trip.origin} &rarr; {trip.destination} • {trip.date}</p>
                      </div>
                      <span className="text-[8px] font-bold text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full">Dibatalkan</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
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
              ? `Tandai trip ${statusConfirmTarget?.tripId} sebagai SELESAI? Dana escrow akan otomatis cair ke Available Balance. Status ini bersifat final.`
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

      <BaseModal
        isOpen={Boolean(cancelConfirmTarget)}
        onClose={() => setCancelConfirmTarget(null)}
        title="Batalkan Trip?"
        subtitle={`Trip ID: ${cancelConfirmTarget}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">
            Trip yang dibatalkan tidak akan lagi tampil di Dashboard, QR Trip, atau daftar aktif. Tindakan ini tidak dapat diurungkan.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setCancelConfirmTarget(null)}
              className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer"
            >
              Tidak
            </button>
            <button
              onClick={handleConfirmCancel}
              className="flex-1 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer shadow-sm"
            >
              Ya, Batalkan
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}