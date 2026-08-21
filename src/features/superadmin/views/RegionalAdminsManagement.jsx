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
  Info,
  Eye,
  Mail,
  MapPin
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminWilayahManagement() {
    // Mock data daftar Admin Wilayah & wilayah penempatannya
  const [admins, setAdmins] = useState([
    { id: "ADM-001", name: "Budi Santoso", email: "budi.santoso@ne-beng.com", region: "Region Jakarta", hub: "Central Hub Cengkareng", status: "Active", joinedDate: "12 Jan 2025" },
    { id: "ADM-002", name: "Siti Rahmawati", email: "siti.rahmawati@ne-beng.com", region: "Region Yogyakarta", hub: "Hub Malioboro", status: "Active", joinedDate: "15 Feb 2025" },
    { id: "ADM-003", name: "Eko Prasetyo", email: "eko.prasetyo@ne-beng.com", region: "Region Banyumas", hub: "Hub Purwokerto", status: "Active", joinedDate: "20 Mar 2025" },
    { id: "ADM-004", name: "Dewi Lestari", email: "dewi.lestari@ne-beng.com", region: "Region Surabaya", hub: "Hub Gubeng", status: "Inactive", joinedDate: "05 Apr 2025" }
  ]);

  // Daftar pilihan wilayah operasional yang tersedia untuk penempatan
  const availableRegions = [
    { name: "Region Jakarta", hub: "Central Hub Cengkareng" },
    { name: "Region Yogyakarta", hub: "Hub Malioboro" },
    { name: "Region Banyumas", hub: "Hub Purwokerto" },
    { name: "Region Surabaya", hub: "Hub Gubeng" }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    region: 'Region Jakarta',
    hub: 'Central Hub Cengkareng',
    status: 'Active'
  });

  // Filter pencarian admin wilayah
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoadingAdmins = useSimulatedLoading([searchTerm], 700);

  // Buka modal tambah admin baru
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

  // Buka modal edit admin
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

  // Buka modal detail admin
  const handleOpenDetailModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  // Handle perubahan wilayah (otomatis menyesuaikan Hub utama)
  const handleRegionChange = (selectedRegionName) => {
    const found = availableRegions.find(r => r.name === selectedRegionName);
    setFormData({
      ...formData,
      region: selectedRegionName,
      hub: found ? found.hub : '-'
    });
  };

  // Simpan data (Create / Update)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (isEditing) {
      setAdmins(admins.map(adm => adm.id === currentId ? { ...adm, ...formData } : adm));
    } else {
      const newAdmin = {
        ...formData,
        joinedDate: "Hari Ini"
      };
      setAdmins([newAdmin, ...admins]);
    }
    setIsModalOpen(false);
  };

  // Toggle status aktif/nonaktif akun admin
  const handleToggleStatus = (id) => {
    setAdmins(admins.map(adm => {
      if (adm.id === id) {
        const newStatus = adm.status === 'Active' ? 'Inactive' : 'Active';
        return { ...adm, status: newStatus };
      }
      return adm;
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
              MANAJEMEN AKUN ADMIN WILAYAH
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Admin Wilayah & Penempatan</h1>
          <p className="text-xs text-gray-500 mt-0.5">Buat akun admin operasional baru dan tentukan wilayah penugasan kerjanya.</p>
        </div>
        
        <button 
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm shadow-purple-200 cursor-pointer"
        >
          <Plus size={16} />
          Buat Akun Admin Baru
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama admin, email, atau wilayah penempatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
        <div className="text-xs font-bold text-gray-400 px-4">
          Total: <span className="text-gray-900">{filteredAdmins.length} Admin Wilayah</span>
        </div>
      </div>

      {/* Tabel Data Admin Wilayah */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-4 px-6">ID & Nama Admin</th>
                <th className="py-4 px-6">Email Akun</th>
                <th className="py-4 px-6">Wilayah Penempatan Kerja</th>
                <th className="py-4 px-6">Status Akun</th>
                <th className="py-4 px-6 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoadingAdmins ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl font-bold shadow-sm">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{admin.name}</div>
                          <div className="text-[11px] font-bold text-gray-400 font-mono">{admin.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-700 flex items-center gap-1.5 pt-6">
                      <Mail size={14} className="text-gray-400" />
                      {admin.email}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <MapPin size={14} className="text-purple-600" />
                        {admin.region}
                      </div>
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">{admin.hub}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                        admin.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {admin.status === 'Active' ? 'Aktif Bertugas' : 'Akun Ditangguhkan'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Lihat Detail */}
                        <button 
                          onClick={() => handleOpenDetailModal(admin)}
                          title="Lihat Detail Admin"
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Tombol Edit */}
                        <button 
                          onClick={() => handleOpenEditModal(admin)}
                          title="Ubah Data Admin"
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Tombol Status */}
                        <button 
                          onClick={() => handleToggleStatus(admin.id)}
                          title={admin.status === 'Active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            admin.status === 'Active' 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {admin.status === 'Active' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={Users}
                      title="Admin Wilayah Tidak Ditemukan"
                      description="Tidak ada admin wilayah yang cocok dengan pencarian Anda."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Admin Wilayah */}
      {isDetailModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">{selectedAdmin.name}</h3>
                  <p className="text-[11px] font-mono font-bold text-purple-600">{selectedAdmin.id}</p>
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
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Email Akses Sistem</span>
                <p className="text-xs font-bold text-gray-800">{selectedAdmin.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Wilayah Penempatan Kerja</span>
                <p className="text-xs font-black text-purple-700">{selectedAdmin.region}</p>
                <p className="text-[11px] text-gray-500">{selectedAdmin.hub}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Status Akun</span>
                  <div className="pt-0.5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg inline-flex items-center gap-1 ${
                      selectedAdmin.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {selectedAdmin.status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tanggal Bergabung</span>
                  <p className="text-xs font-bold text-gray-800 pt-0.5">{selectedAdmin.joinedDate}</p>
                </div>
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

      {/* Modal Form Tambah/Ubah Admin & Penempatan Wilayah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {isEditing ? 'Ubah Akun & Penempatan Admin' : 'Buat Akun Admin Wilayah Baru'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Konfigurasi hak akses operasional regional</p>
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
                  <span>ID Admin (Auto-Generated)</span>
                  <span className="text-[10px] text-purple-600 lowercase font-bold">read-only</span>
                </label>
                <input 
                  type="text" 
                  disabled
                  value={formData.id}
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nama Lengkap Admin
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Ahmad Fauzi"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Akses Sistem (Login)
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="Misal: ahmad.fauzi@ne-beng.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Penempatan Wilayah Kerja
                </label>
                <select 
                  value={formData.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition cursor-pointer"
                >
                  {availableRegions.map((reg, idx) => (
                    <option key={idx} value={reg.name}>
                      {reg.name} ({reg.hub})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Info size={12} /> Admin akan memiliki hak akses pengelolaan wilayah yang dipilih.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Status Akun
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition cursor-pointer"
                >
                  <option value="Active">Active (Aktif Bertugas)</option>
                  <option value="Inactive">Inactive (Ditangguhkan)</option>
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
                  {isEditing ? 'Simpan Perubahan' : 'Simpan & Daftarkan Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}