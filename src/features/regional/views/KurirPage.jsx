import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Users, Search, Eye } from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import BaseModal from '../../../components/ui/BaseModal';

export default function KurirPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  const [kurirList] = useState([
    { id: 'KUR-01', name: 'Joko Widodo', role: 'Driver Armada Mobil', pos: 'Pos Mitra Solo Grand Mall', activeShipments: 14, status: 'Bertugas', phone: '081233445566', rating: '4.9' },
    { id: 'KUR-02', name: 'Slamet Riyadi', role: 'Kurir Motor Wilayah', pos: 'Pos Mitra Pasar Klewer', activeShipments: 8, status: 'Standby', phone: '082155667788', rating: '4.8' },
    { id: 'KUR-03', name: 'Ahmad Dahlan', role: 'Driver Armada Pick Up', pos: 'Pos Mitra Jebres Stasiun', activeShipments: 12, status: 'Bertugas', phone: '085788990011', rating: '5.0' },
    { id: 'KUR-04', name: 'Budi Utomo', role: 'Kurir Motor Wilayah', pos: 'Pos Mitra Manahan', activeShipments: 0, status: 'Istirahat', phone: '087811223344', rating: '4.7' },
  ]);

  const filteredKurir = kurirList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.pos.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoadingKurir = useSimulatedLoading([searchQuery], 700);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN SDM & KURIR WILAYAH
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Data Kurir & Driver</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Kelola personel kurir, penugasan pos mitra, serta performa pengiriman.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full shrink-0 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold text-emerald-700">Personel Terverifikasi</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama kurir, peran, pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingKurir ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredKurir.length > 0 ? (
            filteredKurir.map((item) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id}</span>
                    <h3 className="font-bold text-neutral-800 text-[11px]">{item.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                    item.status === 'Bertugas' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-[9px] text-neutral-500">
                  <div>Peran: <strong>{item.role}</strong></div>
                  <div>Pos: <strong>{item.pos}</strong></div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                  <span className="font-bold text-blue-600">{item.activeShipments} Paket Aktif</span>
                  <button onClick={() => setSelectedDetail(item)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg cursor-pointer">
                    <Eye size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={Users} title="Kurir Tidak Ditemukan" description="Tidak ada kurir yang cocok." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Kurir</th>
                <th className="py-3 px-5">Peran / Posisi</th>
                <th className="py-3 px-5">Pos Mitra</th>
                <th className="py-3 px-5">Paket Aktif</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingKurir ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredKurir.length > 0 ? (
                filteredKurir.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{item.name}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id} • {item.phone}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{item.role}</td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">{item.pos}</td>
                    <td className="py-3.5 px-5 font-bold text-blue-600">{item.activeShipments} Pkt</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                        item.status === 'Bertugas' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button onClick={() => setSelectedDetail(item)} className="p-1.5 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] rounded-lg transition cursor-pointer">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState icon={Users} title="Kurir Tidak Ditemukan" description="Tidak ada kurir yang cocok." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail?.name}
        subtitle={`ID: ${selectedDetail?.id} • Rating: ★ ${selectedDetail?.rating}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">Pos Penugasan</span>
            <p className="font-bold text-neutral-800">{selectedDetail?.pos}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[8px] font-bold text-neutral-400 uppercase">Peran</span>
              <p className="font-bold text-neutral-800">{selectedDetail?.role}</p>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[8px] font-bold text-neutral-400 uppercase">Paket Aktif</span>
              <p className="font-bold text-blue-600">{selectedDetail?.activeShipments} Paket</p>
            </div>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">Kontak</span>
            <p className="font-mono font-bold text-neutral-800">{selectedDetail?.phone}</p>
          </div>
          <button onClick={() => setSelectedDetail(null)} className="w-full py-2 bg-[#4B2172] text-white text-[10px] font-bold rounded-full mt-2 cursor-pointer">Tutup</button>
        </div>
      </BaseModal>
    </div>
  );
}