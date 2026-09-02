import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Eye,
  AlertTriangle
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { getAllRegions, createRegion, updateRegion } from '../../../services/regionService';

export default function RegionsManagement() {
  const [regions, setRegions] = useState([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [regionToToggle, setRegionToToggle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  // Ambil data region riil dari backend NestJS
  useEffect(() => {
    let isMounted = true;

    async function loadRegions() {
      try {
        setIsLoadingRegions(true);
        const res = await getAllRegions();
        if (isMounted) {
          setRegions(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error('Gagal memuat data wilayah:', err);
      } finally {
        if (isMounted) {
          setIsLoadingRegions(false);
        }
      }
    }

    loadRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRegions = regions.filter(region => 
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      code: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (region) => {
    setIsEditing(true);
    setCurrentId(region.id);
    setFormData({
      name: region.name,
      code: region.code,
      isActive: region.isActive
    });
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (region) => {
    setSelectedRegion(region);
    setIsDetailModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
      };

      if (isEditing) {
        await updateRegion(currentId, formData);
      } else {
        await createRegion(payload);
      }
      setIsModalOpen(false);
      const res = await getAllRegions();
      setRegions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Gagal menyimpan wilayah:', err);
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan wilayah.');
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!regionToToggle) return;
    try {
      await updateRegion(regionToToggle.id, { isActive: !regionToToggle.isActive });
      setRegionToToggle(null);
      const ress = await getAllRegions();
      setRegions(Array.isArray(ress) ? ress : []);
    } catch (err) {
      console.error('Gagal mengubah status wilayah:', err);
    }
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
            placeholder="Cari nama wilayah, kode, atau ID..."
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
                      <span className="text-[8px] font-bold text-[#4B2172] font-mono">{region.code}</span>
                      <h3 className="font-bold text-neutral-800 text-[11px]">{region.name}</h3>
                    </div>
                  </div>
                  <StatusBadge variant={region.isActive ? 'emerald' : 'rose'}>
                    {region.isActive ? 'Aktif' : 'Nonaktif'}
                  </StatusBadge>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2">
                  <button onClick={() => handleOpenDetailModal(region)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => handleOpenEditModal(region)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setRegionToToggle(region)} className={`p-1.5 rounded-lg ${region.isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {region.isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
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
                <th className="py-3 px-5">Kode & Wilayah Operasional</th>
                <th className="py-3 px-5">Tanggal Dibuat</th>
                <th className="py-3 px-5">Status Sistem</th>
                <th className="py-3 px-5 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingRegions ? (
                <SkeletonTableRows rows={4} columns={4} />
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
                          <div className="text-[8px] font-bold text-neutral-400 font-mono">{region.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">
                      {new Date(region.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge variant={region.isActive ? 'emerald' : 'rose'}>
                        {region.isActive ? 'Aktif' : 'Nonaktif'}
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
                        <button onClick={() => setRegionToToggle(region)} className={`p-1.5 rounded-lg ${region.isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {region.isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
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
        subtitle={`Kode: ${selectedRegion?.code}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span className="text-[8px] font-bold text-neutral-400 uppercase">ID Sistem</span>
            <p className="font-bold text-neutral-800 font-mono">{selectedRegion?.id}</p>
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
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Kode Unik Wilayah</label>
            <input type="text" required placeholder="Misal: REG-DIY" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium font-mono" />
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
            Apakah Anda yakin ingin {regionToToggle?.isActive ? 'menonaktifkan' : 'mengaktifkan'} wilayah <strong>{regionToToggle?.name}</strong>?
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