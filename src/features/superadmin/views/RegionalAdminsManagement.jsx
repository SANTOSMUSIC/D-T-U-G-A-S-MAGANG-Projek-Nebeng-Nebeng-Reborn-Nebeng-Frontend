import { useState, useEffect } from 'react';
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
import { getAllUsers, createUser, updateUser, updateUserStatus } from '../../../services/userService';
import { getAllRegions } from '../../../services/regionService';

export default function AdminWilayahManagement() {
  const [admins, setAdmins] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminToToggle, setAdminToToggle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    regionId: '',
    role: 'regional',
    status: 'active'
  });

  // Memuat data admin & wilayah secara aman tanpa warning linter
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoadingAdmins(true);
        const [usersRes, regionsRes] = await Promise.all([
          getAllUsers(),
          getAllRegions(true).catch(() => [])
        ]);

        if (isMounted) {
          const regionalAdmins = Array.isArray(usersRes) 
            ? usersRes.filter(u => u.role === 'regional') 
            : [];
          
          setAdmins(regionalAdmins);
          setAvailableRegions(Array.isArray(regionsRes) ? regionsRes : []);
          
          if (regionsRes && regionsRes.length > 0 && !formData.regionId) {
            setFormData(prev => ({ ...prev, regionId: regionsRes[0].id }));
          }
        }
      } catch (err) {
        console.error('Gagal memuat data admin wilayah:', err);
      } finally {
        if (isMounted) {
          setIsLoadingAdmins(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAdmins = admins.filter(admin => 
    (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.region && admin.region.name && admin.region.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.id && String(admin.id).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      regionId: availableRegions.length > 0 ? availableRegions[0].id : '',
      role: 'regional',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setIsEditing(true);
    setCurrentId(admin.id);
    
    // Mencari ID region secara fleksibel (dari property langsung atau objek relasi)
    const matchedRegionId = admin.regionId 
      ? String(admin.regionId) 
      : (admin.region?.id ? String(admin.region.id) : '');

    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '',
      regionId: matchedRegionId,
      role: 'regional',
      status: admin.status || 'active'
    });
    setIsModalOpen(true);
  };

  // Cari nama wilayah berdasarkan objek relasi atau pencocokan ID dengan list availableRegions
  const getRegionName = (admin) => {
    if (admin.regionId) {
      const matched = availableRegions.find(r => String(r.id) === String(admin.regionId));
      if (matched) {
        return matched.name;
      }
    }

    return 'Belum Ditugaskan';
  };

  const handleOpenDetailModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (isEditing) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          regionId: formData.regionId ? String(formData.regionId) : undefined,
          status: formData.status
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await updateUser(currentId, payload);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          password: formData.password || 'Password123!',
          regionId: formData.regionId ? String(formData.regionId) : undefined,
          role: 'regional',
          status: 'active'
        };
        await createUser(payload);
      }
      setIsModalOpen(false);

      // Refresh data tabel
      const usersRes = await getAllUsers();
      const regionalAdmins = Array.isArray(usersRes) ? usersRes.filter(u => u.role === 'regional') : [];
      setAdmins(regionalAdmins);
    } catch (err) {
      console.error('Gagal menyimpan admin wilayah:', err);
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!adminToToggle) return;
    try {
      const newStatus = adminToToggle.status === 'active' ? 'inactive' : 'active';
      await updateUserStatus(adminToToggle.id, newStatus);
      setAdminToToggle(null);

      // Refresh data tabel
      const usersRes = await getAllUsers();
      const regionalAdmins = Array.isArray(usersRes) ? usersRes.filter(u => u.role === 'regional') : [];
      setAdmins(regionalAdmins);
    } catch (err) {
      console.error('Gagal mengubah status admin:', err);
    }
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
            filteredAdmins.map((admin) => {
              const isActive = admin.status === 'active';
              const regionName = getRegionName(admin);
              return (
                <div key={admin.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {String(admin.id)}</span>
                      <h3 className="font-bold text-neutral-800 text-[11px]">{admin.name}</h3>
                    </div>
                    <StatusBadge variant={isActive ? 'emerald' : 'rose'}>
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </StatusBadge>
                  </div>

                  <div className="text-[10px] text-neutral-500 space-y-0.5">
                    <div className="flex items-center gap-1"><Mail size={11} className="text-neutral-400"/> {admin.email}</div>
                    <div className="flex items-center gap-1"><MapPin size={11} className="text-[#4B2172]"/> {regionName}</div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-100">
                    <button onClick={() => handleOpenDetailModal(admin)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => handleOpenEditModal(admin)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => setAdminToToggle(admin)} className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                    </button>
                  </div>
                </div>
              );
            })
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
                filteredAdmins.map((admin) => {
                  const isActive = admin.status === 'active';
                  const regionName = getRegionName(admin);
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 text-[10px]">{admin.name}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">ID: {String(admin.id)}</div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-neutral-700">{admin.email}</td>
                      <td className="py-3.5 px-5 font-bold text-neutral-800">{regionName}</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge variant={isActive ? 'emerald' : 'rose'}>
                          {isActive ? 'Aktif' : 'Nonaktif'}
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
                          <button onClick={() => setAdminToToggle(admin)} className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        subtitle={`ID: ${selectedAdmin ? String(selectedAdmin.id) : ''}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-2 text-[10px]">
          <div><strong>Email:</strong> {selectedAdmin?.email}</div>
          <div><strong>Telepon:</strong> {selectedAdmin?.phone || '-'}</div>
          <div><strong>Wilayah:</strong> {selectedAdmin?.region?.name || 'Belum Ditugaskan'}</div>
          <div><strong>Bergabung:</strong> {selectedAdmin?.createdAt ? new Date(selectedAdmin.createdAt).toLocaleDateString('id-ID') : '-'}</div>
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
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nomor Telepon</label>
            <input type="text" placeholder="08123456789" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Password Akun {isEditing && '(Kosongkan jika tidak diubah)'}</label>
            <input type="password" {...(!isEditing ? {required: true} : {})} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Penempatan Wilayah</label>
            <select value={formData.regionId} onChange={(e) => setFormData({...formData, regionId: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold cursor-pointer">
              <option value="">-- Pilih Wilayah --</option>
              {availableRegions.map((reg) => (
                <option key={reg.id} value={reg.id}>{reg.name} ({reg.code})</option>
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
            Apakah Anda yakin ingin {adminToToggle?.status === 'active' ? 'menonaktifkan' : 'mengaktifkan'} akun admin <strong>{adminToToggle?.name}</strong>?
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