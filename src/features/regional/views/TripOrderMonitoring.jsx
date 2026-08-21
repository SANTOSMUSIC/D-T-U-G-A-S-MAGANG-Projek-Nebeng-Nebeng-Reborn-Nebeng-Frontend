import React, { useState, useEffect } from 'react';
import { Navigation, Search, Eye, CheckCircle2, Clock, MapPin, Car, ArrowRight, X } from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function RegionalTripMonitoringPage() {
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripList, setTripList] = useState([
    {
      id: 'TRIP-9081',
      passenger: 'Siti Aminah',
      driver: 'Rian Hidayat',
      originPos: 'Pos Mitra Solo Grand Mall',
      destinationPos: 'Pos Mitra Pasar Klewer',
      status: 'Sedang Berjalan',
      fare: 'Rp 35.000',
      time: '19 Agu 2026, 09:30'
    },
    {
      id: 'TRIP-9082',
      passenger: 'Budi Santoso',
      driver: 'Fajar Nugroho',
      originPos: 'Pos Mitra Jebres Stasiun',
      destinationPos: 'Pos Mitra Solo Grand Mall',
      status: 'Selesai',
      fare: 'Rp 45.000',
      time: '19 Agu 2026, 08:15'
    },
    {
      id: 'TRIP-9083',
      passenger: 'Ahmad Fauzi',
      driver: 'Dewi Lestari',
      originPos: 'Pos Mitra Pasar Klewer',
      destinationPos: 'Pos Mitra Jebres Stasiun',
      status: 'Mencari Driver',
      fare: 'Rp 50.000',
      time: '19 Agu 2026, 09:45'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedPos, setSelectedPos] = useState('Semua Pos');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);

  const posOptions = [
    'Semua Pos',
    'Pos Mitra Solo Grand Mall',
    'Pos Mitra Pasar Klewer',
    'Pos Mitra Jebres Stasiun'
  ];

  useEffect(() => {
    setIsLoadingTrips(true);
    const timer = setTimeout(() => setIsLoadingTrips(false), 700);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, selectedPos]);

  const handleOpenDetail = (trip) => {
    setCurrentTrip(trip);
    setIsDetailOpen(true);
  };

  const filteredTrips = tripList.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.driver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || t.status === statusFilter;
    const matchesPos = selectedPos === 'Semua Pos' || t.originPos === selectedPos || t.destinationPos === selectedPos;
    return matchesSearch && matchesStatus && matchesPos;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Navigation className="w-3.5 h-3.5" /> Regional Trip & Order Monitoring
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Pemantauan Trip & Order Wilayah</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Pantau daftar perjalanan dan pesanan aktif yang berasal dari atau menuju pos-pos di wilayah operasi Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-purple-50 border border-purple-100 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Car className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold text-purple-900">
              {tripList.length} Total Trip Wilayah
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cari ID, penumpang, driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
              />
            </div>

            {/* Filter Pos Asal/Tujuan */}
            <select 
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-purple-600 transition cursor-pointer"
            >
              {posOptions.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>

            {/* Filter Status */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-purple-600 transition cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Mencari Driver">Mencari Driver</option>
              <option value="Sedang Berjalan">Sedang Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3 w-[16%]">ID & WAKTU</th>
                <th className="py-4 px-3 w-[18%]">PENUMPANG & DRIVER</th>
                <th className="py-4 px-3 w-[30%]">RUTE POS (ASAL → TUJUAN)</th>
                <th className="py-4 px-3 w-[14%]">TARIF TRIP</th>
                <th className="py-4 px-3 w-[12%]">STATUS</th>
                <th className="py-4 px-3 w-[10%] text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {isLoadingTrips ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Navigation}
                      title="Tidak Ada Trip Ditemukan"
                      description="Tidak ada trip yang cocok dengan pencarian atau filter yang dipilih."
                    />
                  </td>
                </tr>
              ) : filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{trip.id}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{trip.time}</p>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-800">{trip.passenger}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">Driver: {trip.driver}</p>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{trip.originPos}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-semibold mt-0.5 ml-5">
                      <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="truncate">{trip.destinationPos}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 truncate font-extrabold text-purple-700">{trip.fare}</td>
                  <td className="py-4 px-3 truncate">
                    {trip.status === 'Sedang Berjalan' && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Berjalan
                      </span>
                    )}
                    {trip.status === 'Selesai' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </span>
                    )}
                    {trip.status === 'Mencari Driver' && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Mencari Driver
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => handleOpenDetail(trip)}
                      className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Detail Trip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Trip */}
      {isDetailOpen && currentTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">Detail Perjalanan: {currentTrip.id}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Informasi rute, status, dan pihak terkait.</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Waktu Pemesanan:</span>
                  <span className="text-neutral-800 font-bold">{currentTrip.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Status Trip:</span>
                  <span className="text-purple-700 font-extrabold">{currentTrip.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Tarif:</span>
                  <span className="text-neutral-900 font-extrabold">{currentTrip.fare}</span>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block mb-1">Penumpang</span>
                  <span className="text-neutral-900 font-bold">{currentTrip.passenger}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block mb-1">Driver Penugasan</span>
                  <span className="text-neutral-900 font-bold">{currentTrip.driver}</span>
                </div>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">Pos Asal (Origin)</span>
                  <span className="text-neutral-900 font-bold">{currentTrip.originPos}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block mb-1">Pos Tujuan (Destination)</span>
                  <span className="text-neutral-900 font-bold">{currentTrip.destinationPos}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 mt-6 flex justify-end">
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition cursor-pointer shadow-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}