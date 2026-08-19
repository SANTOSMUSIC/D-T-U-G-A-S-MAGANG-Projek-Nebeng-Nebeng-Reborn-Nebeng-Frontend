import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  MapPin, 
  Package,
  Users,
  CheckCircle2,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats] = useState({
    totalTransactions: "Rp 450.000.000",
    growthRate: "+12.5%",
    activeTrips: {
      package: 342,
      passenger: 128,
      total: 470
    },
    commissionRevenue: "Rp 45.500.000",
    commissionGrowth: "+8.2%"
  });

  const [regionalActivities] = useState([
    { id: "JKT-001", name: "Region Jakarta", activeOrders: 150, revenue: "Rp 150.000.000", status: "Active" },
    { id: "YOG-001", name: "Region Yogyakarta", activeOrders: 120, revenue: "Rp 120.000.000", status: "Active" },
    { id: "BANY-001", name: "Region Banyumas", activeOrders: 110, revenue: "Rp 100.000.000", status: "Active" },
    { id: "SBY-001", name: "Region Surabaya", activeOrders: 90, revenue: "Rp 80.000.000", status: "Active" }
  ]);

  // State untuk interaksi cek/uncheck grafik tahun
  const [showCurrentYear, setShowCurrentYear] = useState(true);
  const [showLastYear, setShowLastYear] = useState(true);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-8 pt-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      {/* Header Utama */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700">
              PORTAL SUPER ADMIN GLOBAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard Analytics Global</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pantauan menyeluruh terhadap transaksi, trip aktif, komisi, dan aktivitas wilayah.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 px-4 py-3 rounded-2xl w-full lg:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">STATUS SISTEM PLATFORM</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Optimal & Terhubung
            </p>
          </div>
        </div>
      </div>

      {/* Grid Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">TOTAL TRANSAKSI</span>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">{stats.totalTransactions}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              {stats.growthRate} bln ini
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">TRIP PAKET AKTIF</span>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl">
              <Package size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">{stats.activeTrips.package} Paket</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-bold text-gray-500">
            Pengiriman Logistik Lintas Wilayah
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">TRIP PENUMPANG</span>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">{stats.activeTrips.passenger} Orang</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-bold text-gray-500">
            Aktivitas nebeng penumpang aktif
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">PENDAPATAN KOMISI</span>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">{stats.commissionRevenue}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              {stats.commissionGrowth} bln ini
            </span>
          </div>
        </div>
      </div>

      {/* Bagian Grafik Garis & Komposisi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Grafik Sesuai Referensi (Skala 0 - 3500) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">Data Transaksi & Volume</h2>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                    Live Data
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Fluktuasi volume pesanan bulanan lintas wilayah operasional.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200/60 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 flex items-center gap-1.5">
                <Activity size={14} />
                Skala (0 - 3500)
              </div>
            </div>

            {/* Area Visual Chart Garis dengan Sumbu Y 0 - 3500 */}
            <div className="relative h-72 w-full bg-gradient-to-b from-purple-50/10 to-gray-50/30 rounded-2xl border border-gray-100 p-4 pl-14 flex flex-col justify-between mt-2">
              <div className="absolute left-2 inset-y-4 flex flex-col justify-between text-[10px] font-bold text-gray-400 text-right pointer-events-none">
                <span>3500</span>
                <span>3000</span>
                <span>2500</span>
                <span>2000</span>
                <span>1500</span>
                <span>1000</span>
                <span>500</span>
                <span>0</span>
              </div>

              <div className="absolute inset-x-4 left-14 inset-y-4 flex flex-col justify-between pointer-events-none opacity-50">
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
                <div className="border-b border-dashed border-gray-200 w-full"></div>
              </div>

              {/* SVG Line Chart dengan Kondisi Render Berdasarkan Check/Uncheck */}
              <svg className="absolute left-14 top-4 w-[calc(100%-4.5rem)] h-[calc(100%-2rem)] overflow-visible">
                {showLastYear && (
                  <path
                    d="M 10 170 L 60 165 L 110 110 L 160 190 L 210 100 L 260 130 L 310 150 L 360 125 L 410 210 L 460 100 L 510 50"
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="2.5"
                  />
                )}
                {showCurrentYear && (
                  <path
                    d="M 10 190 L 60 165 L 110 120 L 160 210 L 210 75 L 260 145 L 310 130 L 360 105 L 410 225 L 460 70 L 510 30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                  />
                )}
              </svg>

              <div className="mt-auto z-10 flex justify-between text-[11px] font-bold text-gray-500 pt-4 border-t border-gray-200/60 pl-2">
                {months.map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6">
              {/* Checkbox / Toggle Tahun Ini */}
              <button 
                onClick={() => setShowCurrentYear(!showCurrentYear)}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${showCurrentYear ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showCurrentYear ? 'bg-blue-600' : 'bg-gray-300'} shadow-sm`}></span>
                <span className="text-xs font-bold text-gray-700">Tahun Ini (2026)</span>
              </button>

              {/* Checkbox / Toggle Tahun Lalu */}
              <button 
                onClick={() => setShowLastYear(!showLastYear)}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${showLastYear ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className={`w-3 h-3 rounded-full ${showLastYear ? 'bg-blue-300' : 'bg-gray-300'}`}></span>
                <span className="text-xs font-bold text-gray-500">Tahun Lalu (2025)</span>
              </button>
            </div>

            {/* Tombol Interaktif Cek / Uncheck Tahun Lalu */}
            <button 
              onClick={() => setShowLastYear(!showLastYear)}
              className={`text-xs font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 border cursor-pointer ${
                showLastYear 
                  ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' 
                  : 'bg-purple-50 text-purple-700 border-purple-200/60'
              }`}
            >
              <Calendar size={14} />
              {showLastYear ? 'Sembunyikan Tahun Lalu' : 'Cek Tahun Lalu'}
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Komposisi Layanan */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-black text-gray-900">Komposisi Transaksi</h2>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1">
                <CheckCircle2 size={12} /> Terverifikasi
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Proporsi pendapatan global berdasarkan jenis layanan platform.</p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-black">
                <span className="text-indigo-600">Paket Logistik (70%)</span>
                <span className="text-purple-600">Penumpang (30%)</span>
              </div>
              <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-indigo-600 h-full rounded-l-full" style={{ width: '70%' }}></div>
                <div className="bg-purple-600 h-full rounded-r-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Nebeng Paket</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Nebeng Penumpang</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Total Pemasukan Paket</p>
                    <p className="text-[10px] text-gray-400">Volume Aktif: 342 Paket</p>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900">Rp 315 Juta</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Total Pemasukan Penumpang</p>
                    <p className="text-[10px] text-gray-400">Volume Aktif: 128 Orang</p>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900">Rp 135 Juta</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-[11px] font-bold text-gray-400">
            <span>Akumulasi seluruh pos wilayah</span>
            <span className="text-emerald-600">Sinkronisasi Real-time</span>
          </div>
        </div>

      </div>

      {/* Ringkasan Aktivitas per Wilayah */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-gray-900">Ringkasan Aktivitas per Wilayah</h2>
            <p className="text-xs text-gray-500">Monitor volume pesanan dan pendapatan hub regional secara real-time.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-4 px-6">ID & Wilayah Operasional</th>
                <th className="py-4 px-6">Pesanan Aktif</th>
                <th className="py-4 px-6">Pendapatan Wilayah</th>
                <th className="py-4 px-6">Status Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {regionalActivities.map((region, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl font-bold">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{region.name}</div>
                        <div className="text-xs text-gray-400">{region.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-semibold">
                    {region.activeOrders} Pesanan
                  </td>
                  <td className="py-4 px-6 font-black text-gray-900">
                    {region.revenue}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3.5 py-1 text-xs font-bold rounded-xl ${
                      region.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      {region.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}