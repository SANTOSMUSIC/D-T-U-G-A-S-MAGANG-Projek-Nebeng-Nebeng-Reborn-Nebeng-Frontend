import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, MapPin, Car, Bike, Plus, XCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

export default function MitraTripManagement() {
  const toast = useToast();
  
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    originPointId: '',
    destinationPointId: '',
    date: '',
    time: '08:00',
    vehicleId: '',
    price: 50000,
    totalSeats: 1,
    maxWeightCapacityKg: 15,
  });

  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  // Memuat data dari backend secara bersih tanpa dependensi state form yang memicu cascading render
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Ambil daftar Pos Resmi dari GET /api/pickup-points
      const resPoints = await apiClient.get('/pickup-points');
      const allPoints = resPoints.data?.data || resPoints.data || [];
      setPoints(allPoints);

      setFormData(prev => {
        if (allPoints.length >= 2 && !prev.originPointId) {
          return {
            ...prev,
            originPointId: String(allPoints[0].id),
            destinationPointId: String(allPoints[1].id),
          };
        }
        return prev;
      });

      // 2. Ambil daftar kendaraan mitra dari GET /api/vehicles/me
      const resVehicles = await apiClient.get('/vehicles/me').catch(() => ({ data: [] }));
      const myVehicles = resVehicles.data?.data || resVehicles.data || [];
      setVehicles(myVehicles);

      setFormData(prev => {
        if (myVehicles.length > 0 && !prev.vehicleId) {
          return { ...prev, vehicleId: String(myVehicles[0].id) };
        }
        return prev;
      });

      // 3. Ambil daftar trip publik/milik sendiri dari GET /api/trips
      const userRes = await apiClient.get('/auth/me');
      const currentUserId = String(userRes.data?.id);

      const resTrips = await apiClient.get('/trips');
      const allTrips = resTrips.data?.data || resTrips.data || [];
      const myTrips = allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId);
      setTrips(myTrips);
    } catch (err) {
      console.error('Gagal memuat data dari server:', err);
      toast.error('Gagal menyambungkan data backend.', { title: 'Error' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Memuat data dari backend saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resPoints = await apiClient.get('/pickup-points');
        const allPoints = resPoints.data?.data || resPoints.data || [];
        setPoints(allPoints);

        setFormData(prev => {
          if (allPoints.length >= 2 && !prev.originPointId) {
            return {
              ...prev,
              originPointId: String(allPoints[0].id),
              destinationPointId: String(allPoints[1].id),
            };
          }
          return prev;
        });

        const resVehicles = await apiClient.get('/vehicles/me').catch(() => ({ data: [] }));
        const myVehicles = resVehicles.data?.data || resVehicles.data || [];
        setVehicles(myVehicles);

        setFormData(prev => {
          if (myVehicles.length > 0 && !prev.vehicleId) {
            return { ...prev, vehicleId: String(myVehicles[0].id) };
          }
          return prev;
        });

        const userRes = await apiClient.get('/auth/me');
        const currentUserId = String(userRes.data?.id);

        const resTrips = await apiClient.get('/trips');
        const allTrips = resTrips.data?.data || resTrips.data || [];
        const myTrips = allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId);
        setTrips(myTrips);
      } catch (err) {
        console.error('Gagal memuat data dari server:', err);
        toast.error('Gagal menyambungkan data backend.', { title: 'Error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleSelect = (e) => {
    const vId = e.target.value;
    const selectedVeh = vehicles.find(v => String(v.id) === vId);
    if (selectedVeh) {
      setFormData(prev => ({
        ...prev,
        vehicleId: vId,
        totalSeats: selectedVeh.type === 'motor' ? 1 : (selectedVeh.capacitySeats || 4),
        maxWeightCapacityKg: selectedVeh.type === 'motor' ? 15 : (Number(selectedVeh.maxWeightCapacityKg) || 100),
      }));
    }
  };

  const isSameOriginDestination = formData.originPointId && formData.destinationPointId && formData.originPointId === formData.destinationPointId;
  const isPastDate = Boolean(formData.date) && formData.date < todayISO;

  const isScheduleConflict = useMemo(() => {
    if (!formData.date || !formData.vehicleId) return false;
    return trips.some((t) =>
      (t.status === 'scheduled' || t.status === 'in_transit') &&
      String(t.vehicleId) === String(formData.vehicleId) &&
      t.departureDate?.split('T')[0] === formData.date
    );
  }, [trips, formData.date, formData.vehicleId]);

  // Submit buat trip baru ke POST /api/trips
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSameOriginDestination) {
      toast.warning('Pos Asal dan Pos Tujuan tidak boleh sama.', { title: 'Rute Tidak Valid' });
      return;
    }
    if (isPastDate) {
      toast.warning('Tanggal trip tidak boleh di masa lalu.', { title: 'Tanggal Tidak Valid' });
      return;
    }
    if (!formData.vehicleId) {
      toast.warning('Pilih kendaraan terlebih dahulu.', { title: 'Kendaraan Belum Dipilih' });
      return;
    }
    if (isScheduleConflict) {
      toast.warning('Kendaraan ini sudah dijadwalkan pada tanggal yang sama.', { title: 'Jadwal Bentrok' });
      return;
    }

    setIsSubmitting(true);
    try {
      const departureDateTime = new Date(`${formData.date}T${formData.time}:00Z`).toISOString();

      await apiClient.post('/trips', {
        vehicleId: String(formData.vehicleId),
        originPointId: String(formData.originPointId),
        destinationPointId: String(formData.destinationPointId),
        departureDate: departureDateTime,
        departureTime: departureDateTime,
        price: Number(formData.price),
        totalSeats: Number(formData.totalSeats),
        maxWeightCapacityKg: Number(formData.maxWeightCapacityKg),
      });

      toast.success('Trip baru berhasil dibuat dan dipublikasikan!', { title: 'Sukses' });
      setFormData(prev => ({ ...prev, date: '', price: 50000 }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat trip baru.', { title: 'Gagal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestStatusChange = (trip) => {
    if (trip.status === 'completed' || trip.status === 'cancelled') return;
    const nextStatus = trip.status === 'scheduled' ? 'in_transit' : 'completed';
    setStatusConfirmTarget({ tripId: trip.id, nextStatus });
  };

  // Update status trip ke PATCH /api/trips/{id}
  const handleConfirmStatusChange = async () => {
    if (!statusConfirmTarget) return;
    const { tripId, nextStatus } = statusConfirmTarget;
    try {
      await apiClient.patch(`/trips/${tripId}`, { status: nextStatus });
      toast.success(`Status trip berhasil diperbarui menjadi "${nextStatus}".`, { title: 'Sukses' });
      setStatusConfirmTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status trip.', { title: 'Gagal' });
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelConfirmTarget) return;
    try {
      await apiClient.patch(`/trips/${cancelConfirmTarget}`, { status: 'cancelled' });
      toast.success('Trip berhasil dibatalkan.', { title: 'Sukses' });
      setCancelConfirmTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan trip.', { title: 'Gagal' });
    }
  };

  const visibleTrips = trips.filter((t) => t.status !== 'cancelled');

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
            Buat jadwal perjalanan baru menggunakan data Pos Resmi (/pickup-points) dan Kendaraan Anda (/vehicles/me).
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
                name="originPointId" 
                value={formData.originPointId} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                {points.length === 0 ? (
                  <option value="">Belum ada pos terdaftar di sistem</option>
                ) : (
                  points.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Tujuan</label>
              <select 
                name="destinationPointId" 
                value={formData.destinationPointId} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                {points.length === 0 ? (
                  <option value="">Belum ada pos terdaftar di sistem</option>
                ) : (
                  points.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
                )}
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
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pilih Kendaraan Anda</label>
              <select 
                name="vehicleId" 
                value={formData.vehicleId} 
                onChange={handleVehicleSelect}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              >
                {vehicles.length === 0 ? (
                  <option value="">Belum ada kendaraan terdaftar (/vehicles/me)</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.plateNumber}) - {v.type.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tarif Trip (Rp)</label>
              <input 
                type="number" 
                name="price" 
                min={1000}
                required
                value={formData.price} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
            </div>

            {isSameOriginDestination && (
              <p className="text-[8px] text-rose-600 font-bold">⚠️ Pos Asal dan Pos Tujuan tidak boleh sama.</p>
            )}
            {isPastDate && (
              <p className="text-[8px] text-rose-600 font-bold">⚠️ Tanggal trip tidak boleh di masa lalu.</p>
            )}
            {isScheduleConflict && (
              <p className="text-[8px] text-rose-600 font-bold">⚠️ Jadwal bentrok dengan trip lain di kendaraan yang sama.</p>
            )}

            <button 
              type="submit"
              disabled={isSameOriginDestination || isPastDate || isScheduleConflict || isSubmitting || vehicles.length === 0}
              className={`w-full py-3 rounded-xl text-[10px] font-bold transition shadow-sm ${
                isSameOriginDestination || isPastDate || isScheduleConflict || isSubmitting || vehicles.length === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#4B2172] hover:bg-[#3a1a59] text-white cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Memproses...' : 'Publikasikan Trip Jadwal'}
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
            {isLoading ? (
              <div className="text-[10px] text-neutral-400 p-4">Memuat data trip...</div>
            ) : visibleTrips.length === 0 ? (
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
                      <span className="font-bold text-[10px] text-neutral-800 font-mono">TRIP-{trip.id}</span>
                      
                      <button 
                        onClick={() => handleRequestStatusChange(trip)}
                        disabled={trip.status === 'completed'}
                        className="cursor-pointer"
                        title="Klik untuk ubah status"
                      >
                        <StatusBadge variant={trip.status === 'completed' ? 'emerald' : trip.status === 'in_transit' ? 'amber' : 'purple'}>
                          Status: {trip.status}
                        </StatusBadge>
                      </button>

                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1">
                        {trip.vehicle?.type === 'motor' ? <Bike className="w-2.5 h-2.5" /> : <Car className="w-2.5 h-2.5" />} {trip.vehicle?.model || 'Kendaraan'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                      <MapPin className="w-3 h-3 text-[#4B2172] shrink-0" />
                      <span>{trip.originPoint?.name || 'Asal'} &rarr; {trip.destinationPoint?.name || 'Tujuan'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[9px] text-neutral-400 font-medium">
                      <span>{trip.departureDate?.split('T')[0]} • {trip.departureTime ? trip.departureTime.split('T')[1]?.substring(0,5) : '-'} WIB</span>
                      <span>Kursi: {trip.seatAvailable}/{trip.seatTotal} | Bagasi: {trip.remainingWeightCapacityKg} Kg</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200">
                    <div className="text-right">
                      <span className="text-[8px] uppercase font-bold text-neutral-400 block">Tarif Trip</span>
                      <span className="text-[12px] font-bold text-emerald-600">Rp {Number(trip.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    {trip.status === 'scheduled' && (
                      <button
                        onClick={() => setCancelConfirmTarget(trip.id)}
                        className="text-[8px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" /> Batalkan Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(statusConfirmTarget)}
        onClose={() => setStatusConfirmTarget(null)}
        title="Konfirmasi Perubahan Status"
        subtitle={`Trip ID: ${statusConfirmTarget?.tripId}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <p className="text-neutral-600">
            {statusConfirmTarget?.nextStatus === 'completed'
              ? `Tandai trip ${statusConfirmTarget?.tripId} sebagai SELESAI?`
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
            Trip yang dibatalkan tidak akan lagi tampil di daftar aktif. Tindakan ini tidak dapat diurungkan.
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