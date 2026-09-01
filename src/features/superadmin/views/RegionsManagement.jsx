import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Eye,
  Activity,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function RegionsManagement() {
  const [regions, setRegions] = useState([
    { id: "JKT-001", name: "Region Jakarta", hub: "Central Hub Cengkareng", activeOrders: 150, revenue: "Rp 150.000.000", status: "Active", description: "Melayani area Jabodetabek dan logistik utama bandara." },
    { id: "YOG-001", name: "Region Yogyakarta", hub: "Hub Malioboro", activeOrders: 120, revenue: "Rp 120.000.000", status: "Active", description: "Pusat distribusi wilayah Jogja dan sekitarnya." },
    { id: "BANY-001", name: "Region Banyumas", hub: "Hub Purwokerto", activeOrders: 110, revenue: "Rp 100.000.000", status: "Active", description: "Hub utama jalur selatan Jawa Tengah." },
    { id: "SBY-001", name: "Region Surabaya", hub: "Hub Gubeng", activeOrders: 90, revenue: "Rp 80.000.000", status: "Inactive", description: "Sementara ditutup untuk evaluasi rute logistik." }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [regionToToggle, setRegionToToggle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    hub: '',
    status: 'Active',
    description: ''
  });

  const filteredRegions = regions.filter(region => 
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.hub.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoadingRegions = useSimulatedLoading([searchTerm], 700);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      id: `REG-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      hub: '',
      status: 'Active',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (region) => {
    setIsEditing(true);
    setCurrentId(region.id);
    setFormData({
      id: region.id,
      name: region.name,
      hub: region.hub,
      status: region.status,
      description: region.description || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (region) => {
    setSelectedRegion(region);
    setIsDetailModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.hub) return;

    if (isEditing) {
      setRegions(regions.map(reg => reg.id === currentId ? { ...reg, ...formData } : reg));
    } else {
      const newRegion = {
        ...formData,
        activeOrders: 0,
        revenue: "Rp 0"
      };
      setRegions([newRegion, ...regions]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!regionToToggle) return;
    setRegions(regions.map(reg => {
      if (reg.id === regionToToggle.id) {
        return { ...reg, status: reg.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return reg;
    }));
    setRegionToToggle(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN WILAYAH OPERASIONAL (CRUD)
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Kelola Wilayah & Hub</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Tambah, ubah, dan atur detail status operasional platform.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Tambah Wilayah Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama wilayah, ID, atau hub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total: <span className="font-bold text-neutral-800">{filteredRegions.length} Wilayah</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingRegions ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredRegions.length > 0 ? (
            filteredRegions.map((region) => (
              <div key={region.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#4B2172]/10 text-[#4B2172] rounded-xl shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-[#4B2172] font-mono">{region.id}</span>
                      <h3 className="font-bold text-neutral-800 text-[11px]">{region.name}</h3>
                    </div>
                  </div>
                  <StatusBadge variant={region.status === 'Active' ? 'emerald' : 'rose'}>
                    {region.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                  </StatusBadge>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-neutral-100">
                  <span className="text-neutral-500 font-medium">Hub: <strong className="text-neutral-700">{region.hub}</strong></span>
                  <span className="font-bold text-neutral-800">{region.revenue}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2">
                  <button onClick={() => handleOpenDetailModal(region)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => handleOpenEditModal(region)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setRegionToToggle(region)} className={`p-1.5 rounded-lg ${region.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {region.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={MapPin} title="Wilayah Tidak Ditemukan" description="Tidak ada wilayah yang cocok dengan pencarian Anda." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Wilayah Operasional</th>
                <th className="py-3 px-5">Pusat Hub Utama</th>
                <th className="py-3 px-5">Aktivitas & Pesanan</th>
                <th className="py-3 px-5">Status Sistem</th>
                <th className="py-3 px-5 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingRegions ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredRegions.length > 0 ? (
                filteredRegions.map((region) => (
                  <tr key={region.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-[#4B2172]/10 text-[#4B2172] rounded-xl font-bold">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-800 text-[10px]">{region.name}</div>
                          <div className="text-[8px] font-bold text-neutral-400 font-mono">{region.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{region.hub}</td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800">{region.activeOrders} Pesanan Aktif</div>
                      <div className="text-[8px] text-neutral-400">{region.revenue}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge variant={region.status === 'Active' ? 'emerald' : 'rose'}>
                        {region.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenDetailModal(region)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => handleOpenEditModal(region)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => setRegionToToggle(region)} className={`p-1.5 rounded-lg ${region.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {region.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState icon={MapPin} title="Wilayah Tidak Ditemukan" description="Tidak ada wilayah yang cocok dengan pencarian Anda." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedRegion?.name}
        subtitle={`ID: ${selectedRegion?.id}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">Pusat Hub Utama</span>
            <p className="font-bold text-neutral-800">{selectedRegion?.hub}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[8px] font-bold text-neutral-400 uppercase flex items-center gap-1"><Activity size={10}/> Pesanan Aktif</span>
              <p className="font-bold text-neutral-800">{selectedRegion?.activeOrders} Pesanan</p>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
              <span className="text-[8px] font-bold text-neutral-400 uppercase flex items-center gap-1"><DollarSign size={10}/> Pendapatan</span>
              <p className="font-bold text-neutral-800">{selectedRegion?.revenue}</p>
            </div>
          </div>
          <button onClick={() => setIsDetailModalOpen(false)} className="w-full py-2 bg-[#4B2172] text-white text-[10px] font-bold rounded-full mt-2 cursor-pointer">Tutup</button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Wilayah Operasional' : 'Tambah Wilayah Baru'}
        subtitle="Sistem Manajemen Wilayah Pusat"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-3 text-[10px]">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Wilayah</label>
            <input type="text" required placeholder="Misal: Region Yogyakarta" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Lokasi Hub Utama</label>
            <input type="text" required placeholder="Misal: Hub Malioboro" value={formData.hub} onChange={(e) => setFormData({...formData, hub: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full flex items-center gap-1 cursor-pointer shadow-sm"><Save size={13}/> Simpan</button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(regionToToggle)}
        onClose={() => setRegionToToggle(null)}
        title="Konfirmasi Status Wilayah"
        subtitle="Sistem Manajemen Operasional"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin {regionToToggle?.status === 'Active' ? 'menonaktifkan' : 'mengaktifkan'} wilayah <strong>{regionToToggle?.name}</strong>?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setRegionToToggle(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmToggleStatus} className="flex-1 py-2 bg-[#4B2172] text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Konfirmasi</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}