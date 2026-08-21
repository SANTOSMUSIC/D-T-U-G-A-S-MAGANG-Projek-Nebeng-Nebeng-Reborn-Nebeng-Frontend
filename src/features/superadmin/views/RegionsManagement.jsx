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
  X,
  Info,
  Eye,
  Activity,
  DollarSign
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

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

  const handleToggleStatus = (id) => {
    setRegions(regions.map(reg => {
      if (reg.id === id) {
        const newStatus = reg.status === 'Active' ? 'Inactive' : 'Active';
        return { ...reg, status: newStatus };
      }
      return reg;
    }));
  };

  return (
    <div className="p-8 pt-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      {/* Header Halaman */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700">
              MANAJEMEN WILAYAH OPERASIONAL (CRUD)
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Wilayah & Hub</h1>
          <p className="text-xs text-gray-500 mt-0.5">Tambah, ubah, dan atur detail status operasional platform.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm shadow-purple-200 cursor-pointer"
        >
          <Plus size={16} />
          Tambah Wilayah Baru
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama wilayah, ID, atau hub..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
        <div className="text-xs font-bold text-gray-400 px-4">
          Total: <span className="text-gray-900">{filteredRegions.length} Wilayah</span>
        </div>
      </div>

      {/* Tabel Data Wilayah */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-4 px-6">ID & Wilayah Operasional</th>
                <th className="py-4 px-6">Pusat Hub Utama</th>
                <th className="py-4 px-6">Aktivitas & Pesanan</th>
                <th className="py-4 px-6">Status Sistem</th>
                <th className="py-4 px-6 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoadingRegions ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredRegions.length > 0 ? (
                filteredRegions.map((region) => (
                  <tr key={region.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl font-bold shadow-sm">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{region.name}</div>
                          <div className="text-[11px] font-bold text-gray-400 font-mono">{region.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-700">
                      {region.hub}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-800">{region.activeOrders} Pesanan Aktif</div>
                      <div className="text-[11px] font-bold text-gray-400">{region.revenue}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                        region.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${region.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {region.status === 'Active' ? 'Aktif Beroperasi' : 'Nonaktif / Ditangguhkan'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Lihat Detail (Logo Mata) */}
                        <button 
                          onClick={() => handleOpenDetailModal(region)}
                          title="Lihat Detail Wilayah"
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Tombol Edit */}
                        <button 
                          onClick={() => handleOpenEditModal(region)}
                          title="Ubah Data Wilayah"
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Tombol Status */}
                        <button 
                          onClick={() => handleToggleStatus(region.id)}
                          title={region.status === 'Active' ? 'Nonaktifkan Region' : 'Aktifkan Region'}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            region.status === 'Active' 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {region.status === 'Active' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={MapPin}
                      title="Wilayah Tidak Ditemukan"
                      description="Tidak ada wilayah yang cocok dengan pencarian Anda."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Wilayah (Logo Mata) */}
      {isDetailModalOpen && selectedRegion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">{selectedRegion.name}</h3>
                  <p className="text-[11px] font-mono font-bold text-purple-600">{selectedRegion.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Pusat Hub Utama</span>
                <p className="text-xs font-black text-gray-800">{selectedRegion.hub}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity size={12} /> Pesanan Aktif
                  </span>
                  <p className="text-sm font-black text-gray-900">{selectedRegion.activeOrders} Pesanan</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} /> Pendapatan
                  </span>
                  <p className="text-sm font-black text-gray-900">{selectedRegion.revenue}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Status Sistem</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={`px-3 py-0.5 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                    selectedRegion.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedRegion.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {selectedRegion.status === 'Active' ? 'Aktif Beroperasi' : 'Nonaktif / Ditangguhkan'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Keterangan / Detail</span>
                <p className="text-xs text-gray-600 leading-relaxed">{selectedRegion.description || 'Tidak ada keterangan tambahan.'}</p>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition shadow-sm shadow-purple-200 cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form CRUD (Create & Update) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {isEditing ? 'Ubah Wilayah Operasional' : 'Tambah Wilayah Baru'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Database sistem pusat operasional</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>ID Wilayah (Auto-Generated)</span>
                  <span className="text-[10px] text-purple-600 lowercase font-bold">read-only</span>
                </label>
                <input 
                  type="text" 
                  disabled
                  value={formData.id}
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-500 cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Info size={12} /> ID digenerate otomatis untuk menjaga integritas database.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Wilayah Operasional
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Region Yogyakarta"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama / Lokasi Hub Utama
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Hub Malioboro"
                  value={formData.hub}
                  onChange={(e) => setFormData({...formData, hub: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Keterangan / Detail Wilayah
                </label>
                <input 
                  type="text" 
                  placeholder="Misal: Pusat distribusi wilayah Jogja"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Status Operasional
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition cursor-pointer"
                >
                  <option value="Active">Active (Aktif Beroperasi)</option>
                  <option value="Inactive">Inactive (Nonaktif / Ditangguhkan)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm shadow-purple-200 cursor-pointer"
                >
                  <Save size={15} />
                  {isEditing ? 'Simpan Perubahan' : 'Databasekan Wilayah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}