import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { 
  Users, 
  Plus, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Save, 
  X, 
  Eye,
  Mail,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function AdminWilayahManagement() {
  const [admins, setAdmins] = useState([
    { id: "ADM-001", name: "Budi Santoso", email: "budi.santoso@ne-beng.com", region: "Region Jakarta", hub: "Central Hub Cengkareng", status: "Active", joinedDate: "12 Jan 2025" },
    { id: "ADM-002", name: "Siti Rahmawati", email: "siti.rahmawati@ne-beng.com", region: "Region Yogyakarta", hub: "Hub Malioboro", status: "Active", joinedDate: "15 Feb 2025" },
    { id: "ADM-003", name: "Eko Prasetyo", email: "eko.prasetyo@ne-beng.com", region: "Region Banyumas", hub: "Hub Purwokerto", status: "Active", joinedDate: "20 Mar 2025" },
    { id: "ADM-004", name: "Dewi Lestari", email: "dewi.lestari@ne-beng.com", region: "Region Surabaya", hub: "Hub Gubeng", status: "Inactive", joinedDate: "05 Apr 2025" }
  ]);

  const availableRegions = [
    { name: "Region Jakarta", hub: "Central Hub Cengkareng" },
    { name: "Region Yogyakarta", hub: "Hub Malioboro" },
    { name: "Region Banyumas", hub: "Hub Purwokerto" },
    { name: "Region Surabaya", hub: "Hub Gubeng" }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminToToggle, setAdminToToggle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    region: 'Region Jakarta',
    hub: 'Central Hub Cengkareng',
    status: 'Active'
  });

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoadingAdmins = useSimulatedLoading([searchTerm], 700);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      region: availableRegions[0].name,
      hub: availableRegions[0].hub,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setIsEditing(true);
    setCurrentId(admin.id);
    setFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      region: admin.region,
      hub: admin.hub,
      status: admin.status
    });
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleRegionChange = (selectedRegionName) => {
    const found = availableRegions.find(r => r.name === selectedRegionName);
    setFormData({
      ...formData,
      region: selectedRegionName,
      hub: found ? found.hub : '-'
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (isEditing) {
      setAdmins(admins.map(adm => adm.id === currentId ? { ...adm, ...formData } : adm));
    } else {
      const newAdmin = { ...formData, joinedDate: "Hari Ini" };
      setAdmins([newAdmin, ...admins]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmToggleStatus = () => {
    if (!adminToToggle) return;
    setAdmins(admins.map(adm => {
      if (adm.id === adminToToggle.id) {
        return { ...adm, status: adm.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return adm;
    }));
    setAdminToToggle(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN AKUN ADMIN WILAYAH
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Kelola Admin Wilayah</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Buat akun admin operasional baru dan tentukan penugasan kerjanya.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Buat Admin Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama admin, email, atau wilayah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total: <span className="font-bold text-neutral-800">{filteredAdmins.length} Admin</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingAdmins ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <div key={admin.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-[#4B2172] font-mono">{admin.id}</span>
                    <h3 className="font-bold text-neutral-800 text-[11px]">{admin.name}</h3>
                  </div>
                  <StatusBadge variant={admin.status === 'Active' ? 'emerald' : 'rose'}>
                    {admin.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                  </StatusBadge>
                </div>

                <div className="text-[10px] text-neutral-500 space-y-0.5">
                  <div className="flex items-center gap-1"><Mail size={11} className="text-neutral-400"/> {admin.email}</div>
                  <div className="flex items-center gap-1"><MapPin size={11} className="text-[#4B2172]"/> {admin.region} ({admin.hub})</div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-100">
                  <button onClick={() => handleOpenDetailModal(admin)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => handleOpenEditModal(admin)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => setAdminToToggle(admin)} className={`p-1.5 rounded-lg ${admin.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {admin.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={Users} title="Admin Tidak Ditemukan" description="Tidak ada admin wilayah yang cocok dengan pencarian." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Admin</th>
                <th className="py-3 px-5">Email Akun</th>
                <th className="py-3 px-5">Wilayah Penempatan</th>
                <th className="py-3 px-5">Status Akun</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingAdmins ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{admin.name}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">{admin.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{admin.email}</td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">{admin.region}</td>
                    <td className="py-3.5 px-5">
                      <StatusBadge variant={admin.status === 'Active' ? 'emerald' : 'rose'}>
                        {admin.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenDetailModal(admin)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => handleOpenEditModal(admin)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => setAdminToToggle(admin)} className={`p-1.5 rounded-lg ${admin.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {admin.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState icon={Users} title="Admin Tidak Ditemukan" description="Tidak ada admin wilayah yang cocok." />
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
        title={selectedAdmin?.name}
        subtitle={`ID: ${selectedAdmin?.id}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-2 text-[10px]">
          <div><strong>Email:</strong> {selectedAdmin?.email}</div>
          <div><strong>Wilayah:</strong> {selectedAdmin?.region}</div>
          <div><strong>Hub Utama:</strong> {selectedAdmin?.hub}</div>
          <div><strong>Tanggal Bergabung:</strong> {selectedAdmin?.joinedDate}</div>
          <button onClick={() => setIsDetailModalOpen(false)} className="w-full py-2 bg-[#4B2172] text-white text-[10px] font-bold rounded-full mt-3 cursor-pointer">
            Tutup
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Akun Admin' : 'Buat Admin Baru'}
        subtitle="Sistem Manajemen Admin Wilayah"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-3 text-[10px]">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Lengkap</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Email Akses</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Penempatan Wilayah</label>
            <select value={formData.region} onChange={(e) => handleRegionChange(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold cursor-pointer">
              {availableRegions.map((reg, idx) => (
                <option key={idx} value={reg.name}>{reg.name} ({reg.hub})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full flex items-center gap-1 cursor-pointer shadow-sm"><Save size={13}/> Simpan</button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(adminToToggle)}
        onClose={() => setAdminToToggle(null)}
        title="Konfirmasi Perubahan Status"
        subtitle="Manajemen Status Akses Admin"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin {adminToToggle?.status === 'Active' ? 'menonaktifkan' : 'mengaktifkan'} akun admin <strong>{adminToToggle?.name}</strong>?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setAdminToToggle(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmToggleStatus} className="flex-1 py-2 bg-[#4B2172] text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Konfirmasi</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}