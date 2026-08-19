import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Car, Bike, DollarSign, Plus, ShieldAlert } from 'lucide-react';

export default function MitraTripManagement() {
  const [trips, setTrips] = useState([
    { id: 'TRIP-701', origin: 'Solo (Pos Pusat)', destination: 'Yogyakarta', date: '2026-06-25', time: '08:00', vehicle: 'Motor', seats: 1, luggage: 15, estimation: 'Rp 175.000', status: 'Aktif' },
    { id: 'TRIP-702', origin: 'Solo', destination: 'Semarang', date: '2026-06-26', time: '10:00', vehicle: 'Mobil', seats: 4, luggage: 45, estimation: 'Rp 450.000', status: 'Aktif' }
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

  // Penguncian Otomatis Kendaraan & Kalkulasi Pendapatan Berdasarkan Jenis
  useEffect(() => {
    if (formData.vehicle === 'Motor') {
      setFormData(prev => ({ ...prev, seats: 1, luggage: 15 }));
      setEstimatedEarnings(175000);
    } else {
      setFormData(prev => ({ ...prev, seats: 4, luggage: 40 }));
      setEstimatedEarnings(450000);
    }
  }, [formData.vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    alert('Trip baru berhasil dibuat dan dijadwalkan ke sistem!');
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
          <p className="text-neutral-400 text-xs mt-0.5">Buat jadwal perjalanan baru, tentukan kapasitas otomatis kendaraan, dan pantau estimasi pendapatan.</p>
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
                onChange={handleChange}
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
              className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Publikasikan Trip Jadwal
            </button>
          </form>
        </div>

        {/* List & Manajemen Trip Aktif */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-2">
          <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2 mb-6">
            <Calendar className="w-4 h-4 text-pink-600" /> Daftar Trip Terjadwal
          </h2>

          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-neutral-900">{trip.id}</span>
                    <span className="bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{trip.status}</span>
                    <span className="bg-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      {trip.vehicle === 'Motor' ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />} {trip.vehicle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                    <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>{trip.origin} &rarr; {trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {trip.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.time} WIB</span>
                    <span>Kursi: {trip.seats} | Bagasi: {trip.luggage} Kg</span>
                  </div>
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Potensi Pendapatan</span>
                  <span className="text-sm font-extrabold text-emerald-600">{trip.estimation}</span>
                  <button className="mt-2 px-3 py-1 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-xl text-[10px] font-bold transition cursor-pointer">
                    Kelola Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}