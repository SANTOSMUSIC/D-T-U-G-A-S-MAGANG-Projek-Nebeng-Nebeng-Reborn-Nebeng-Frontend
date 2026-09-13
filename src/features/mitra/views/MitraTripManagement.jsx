import { useState, useEffect } from 'react';
import { Calendar, MapPin, Car, Bike, Plus, XCircle, Users, Package } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';
import { estimateFare } from '../../../services/mitraPricing';

const PRIMARY_COLOR = '#4FBF99';
const PRIMARY_ACCENT = '#66CDAA';

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
    serviceType: 'penumpang',
    price: 50000,
    totalSeats: 4,
    maxWeightCapacityKg: 50,
  });

  const [cancelConfirmTarget, setCancelConfirmTarget] = useState(null);
  const [isPriceManual, setIsPriceManual] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);

  // Helper untuk menghitung estimasi tarif secara instan tanpa useEffect
  const calculateSuggestedFare = (originId, destinationId, vehId, currentPoints, currentVehicles) => {
    if (!originId || !destinationId || !vehId) return null;
    const originPoint = currentPoints.find(p => String(p.id) === String(originId));
    const destinationPoint = currentPoints.find(p => String(p.id) === String(destinationId));
    const vehicle = currentVehicles.find(v => String(v.id) === String(vehId));

    if (!originPoint || !destinationPoint || !vehicle) return null;

    const vehicleLabel = vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1).toLowerCase() : 'Motor';
    return estimateFare(originPoint.name, destinationPoint.name, vehicleLabel);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resPoints = await apiClient.get('/pickup-points');
        const allPoints = resPoints.data?.data || resPoints.data || [];
        
        if (!isMounted) return;
        setPoints(allPoints);

        let initialOrigin = '';
        let initialDestination = '';
        if (allPoints.length >= 2) {
          initialOrigin = String(allPoints[0].id);
          initialDestination = String(allPoints[1].id);
        }

        const resVehicles = await apiClient.get('/vehicles/me').catch(() => ({ data: [] }));
        const myVehicles = resVehicles.data?.data || resVehicles.data || [];
        
        if (!isMounted) return;
        setVehicles(myVehicles);

        let initialVehicleId = '';
        let initialSeats = 4;
        let initialMaxWeight = 100;

        if (myVehicles.length > 0) {
          initialVehicleId = String(myVehicles[0].id);
          initialSeats = myVehicles[0].capacitySeats || 4;
          initialMaxWeight = Number(myVehicles[0].maxWeightCapacityKg) || 100;
        }

        // Hitung estimasi harga awal jika data lengkap
        let initialPrice = 50000;
        if (!isPriceManual && initialOrigin && initialDestination && initialVehicleId) {
          const suggested = calculateSuggestedFare(initialOrigin, initialDestination, initialVehicleId, allPoints, myVehicles);
          if (suggested) initialPrice = suggested;
        }

        setFormData(prev => ({
          ...prev,
          originPointId: prev.originPointId || initialOrigin,
          destinationPointId: prev.destinationPointId || initialDestination,
          vehicleId: prev.vehicleId || initialVehicleId,
          totalSeats: initialSeats,
          maxWeightCapacityKg: initialMaxWeight,
          price: initialPrice,
        }));

        const userRes = await apiClient.get('/auth/me');
        const currentUserId = String(userRes.data?.id);

        const resTrips = await apiClient.get('/trips');
        const allTrips = resTrips.data?.data || resTrips.data || [];
        const myTrips = allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId);
        
        if (!isMounted) return;
        setTrips(myTrips);
      } catch (err) {
        console.error('Gagal memuat data trip:', err);
        toast.error('Gagal menyambungkan data ke server.', { title: 'Error' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setIsPriceManual(true);
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Jika field yang diubah memengaruhi rute/kendaraan dan user belum set manual, update harga secara langsung di sini
      if (!isPriceManual && (name === 'originPointId' || name === 'destinationPointId' || name === 'vehicleId')) {
        const suggested = calculateSuggestedFare(
          name === 'originPointId' ? value : prev.originPointId,
          name === 'destinationPointId' ? value : prev.destinationPointId,
          name === 'vehicleId' ? value : prev.vehicleId,
          points,
          vehicles
        );
        if (suggested) {
          updated.price = suggested;
        }
      }
      return updated;
    });
  };

  const handleResetToSuggestedPrice = () => {
    setIsPriceManual(false);
    const suggested = calculateSuggestedFare(
      formData.originPointId,
      formData.destinationPointId,
      formData.vehicleId,
      points,
      vehicles
    );
    if (suggested) {
      setFormData(prev => ({ ...prev, price: suggested }));
    }
  };

  const handleVehicleSelect = (e) => {
    const vId = e.target.value;
    const selectedVeh = vehicles.find(v => String(v.id) === vId);
    if (selectedVeh) {
      setFormData(prev => {
        const updated = {
          ...prev,
          vehicleId: vId,
          totalSeats: selectedVeh.capacitySeats || 4,
          maxWeightCapacityKg: Number(selectedVeh.maxWeightCapacityKg) || 100,
        };
        if (!isPriceManual) {
          const suggested = calculateSuggestedFare(prev.originPointId, prev.destinationPointId, vId, points, vehicles);
          if (suggested) updated.price = suggested;
        }
        return updated;
      });
    }
  };

  const formatPointLabel = (point) => {
    const areaName = point?.city?.name || point?.area?.name || point?.region?.name;
    return areaName ? `${point.name} (${areaName})` : point.name;
  };

  const isSameOriginDestination = formData.originPointId && formData.destinationPointId && formData.originPointId === formData.destinationPointId;
  const isPastDate = Boolean(formData.date) && formData.date < todayISO;

  const isScheduleConflict = trips.some((t) =>
    (t.status === 'scheduled' || t.status === 'in_transit') &&
    String(t.vehicleId) === String(formData.vehicleId) &&
    t.departureDate?.split('T')[0] === formData.date
  );

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
      const isPenumpang = formData.serviceType === 'penumpang';
      const totalSeatsPayload = isPenumpang ? Math.max(1, Number(formData.totalSeats) || 1) : 1;
      const maxWeightCapacityKgPayload = isPenumpang ? 1 : Math.max(1, Number(formData.maxWeightCapacityKg) || 1);

      await apiClient.post('/trips', {
        vehicleId: String(formData.vehicleId),
        originPointId: String(formData.originPointId),
        destinationPointId: String(formData.destinationPointId),
        departureDate: departureDateTime,
        departureTime: departureDateTime,
        price: Number(formData.price),
        totalSeats: totalSeatsPayload,
        maxWeightCapacityKg: maxWeightCapacityKgPayload,
      });

      toast.success('Trip baru berhasil dibuat dan dipublikasikan!', { title: 'Sukses' });
      setFormData(prev => ({ ...prev, date: '' }));
      setIsPriceManual(false);
      
      const resTrips = await apiClient.get('/trips');
      const userRes = await apiClient.get('/auth/me');
      const currentUserId = String(userRes.data?.id);
      const allTrips = resTrips.data?.data || resTrips.data || [];
      setTrips(allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat trip baru.', { title: 'Gagal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelConfirmTarget) return;
    try {
      await apiClient.patch(`/trips/${cancelConfirmTarget}`, { status: 'cancelled' });
      toast.success('Trip berhasil dibatalkan.', { title: 'Sukses' });
      setCancelConfirmTarget(null);
      
      const resTrips = await apiClient.get('/trips');
      const userRes = await apiClient.get('/auth/me');
      const currentUserId = String(userRes.data?.id);
      const allTrips = resTrips.data?.data || resTrips.data || [];
      setTrips(allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId));
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
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: PRIMARY_COLOR }}></span>
            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: PRIMARY_COLOR }}>
              <Calendar className="w-3 h-3" /> MANAJEMEN JADWAL TRIP MITRA
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Create & Manage Trip
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Buat jadwal perjalanan baru, tentukan tipe layanan (Penumpang / Barang), dan kelola trip Anda dengan mudah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-1 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4" style={{ color: PRIMARY_COLOR }} /> Buat Trip Baru
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Tipe Layanan Trip</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, serviceType: 'penumpang' }))}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    formData.serviceType === 'penumpang' 
                      ? 'text-white shadow-sm' 
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                  style={formData.serviceType === 'penumpang' ? { backgroundColor: PRIMARY_COLOR } : undefined}
                >
                  <Users className="w-3 h-3" /> Penumpang
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, serviceType: 'barang' }))}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    formData.serviceType === 'barang' 
                      ? 'text-white shadow-sm' 
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                  style={formData.serviceType === 'barang' ? { backgroundColor: PRIMARY_COLOR } : undefined}
                >
                  <Package className="w-3 h-3" /> Barang
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Asal</label>
              <select 
                name="originPointId" 
                value={formData.originPointId} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
              >
                {points.length === 0 ? (
                  <option value="">Belum ada pos terdaftar di sistem</option>
                ) : (
                  points.map((p) => <option key={p.id} value={p.id}>{formatPointLabel(p)}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pos Tujuan</label>
              <select 
                name="destinationPointId" 
                value={formData.destinationPointId} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
              >
                {points.length === 0 ? (
                  <option value="">Belum ada pos terdaftar di sistem</option>
                ) : (
                  points.map((p) => <option key={p.id} value={p.id}>{formatPointLabel(p)}</option>)
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
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
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
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Pilih Kendaraan Anda</label>
              <select 
                name="vehicleId" 
                value={formData.vehicleId} 
                onChange={handleVehicleSelect}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
              >
                {vehicles.length === 0 ? (
                  <option value="">Belum ada kendaraan terdaftar</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.plateNumber}) - {v.type.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>

            {formData.serviceType === 'penumpang' ? (
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kapasitas Kursi</label>
                <input 
                  type="number" 
                  name="totalSeats" 
                  min={1}
                  required
                  value={formData.totalSeats} 
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Kapasitas Bagasi (Kg)</label>
                <input 
                  type="number" 
                  name="maxWeightCapacityKg" 
                  min={1}
                  required
                  value={formData.maxWeightCapacityKg} 
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Tarif Trip (Rp)</label>
                {isPriceManual && (
                  <button 
                    type="button" 
                    onClick={handleResetToSuggestedPrice}
                    className="text-[8px] font-bold hover:underline cursor-pointer"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    Gunakan Estimasi
                  </button>
                )}
              </div>
              <input 
                type="number" 
                name="price" 
                min={1000}
                required
                value={formData.price} 
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:border-[#4FBF99]"
              />
              <span className="text-[8px] text-neutral-400 mt-1 block">
                {isPriceManual ? 'Tarif diatur manual oleh mitra.' : 'Tarif otomatis diestimasi berdasarkan rute & jenis kendaraan.'}
              </span>
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
                  : 'text-white cursor-pointer'
              }`}
              style={!(isSameOriginDestination || isPastDate || isScheduleConflict || isSubmitting || vehicles.length === 0) ? { backgroundColor: PRIMARY_COLOR } : undefined}
            >
              {isSubmitting ? 'Memproses...' : 'Publikasikan Trip Jadwal'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" style={{ color: PRIMARY_COLOR }} /> Daftar Trip Terjadwal
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
              <div key={trip.id} className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/65 hover:bg-neutral-100/60 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[10px] text-neutral-800 font-mono">TRIP-{trip.id}</span>
                      
                      {trip.status === 'completed' ? (
                        <StatusBadge variant="emerald">Status: {trip.status}</StatusBadge>
                      ) : trip.status === 'in_transit' ? (
                        <StatusBadge variant="amber">Status: {trip.status}</StatusBadge>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: `${PRIMARY_ACCENT}18`, color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_ACCENT}35` }}>
                          Status: {trip.status}
                        </span>
                      )}

                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1">
                        {trip.vehicle?.type === 'motor' ? <Bike className="w-2.5 h-2.5" /> : <Car className="w-2.5 h-2.5" />} {trip.vehicle?.model || 'Kendaraan'}
                      </span>

                      {Number(trip.maxWeightCapacityKg) > 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1" style={{ backgroundColor: `${PRIMARY_ACCENT}18`, color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_ACCENT}35` }}>
                          <Package className="w-2.5 h-2.5" /> Barang • {trip.maxWeightCapacityKg} Kg
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1" style={{ backgroundColor: `${PRIMARY_ACCENT}18`, color: PRIMARY_COLOR, border: `1px solid ${PRIMARY_ACCENT}35` }}>
                          <Users className="w-2.5 h-2.5" /> Penumpang • {trip.seatTotal} Kursi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: PRIMARY_COLOR }} />
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