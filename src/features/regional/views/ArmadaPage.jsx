import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Truck, Search, Plus, X, Trash2, Pencil, CheckCircle2, MapPin } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function FleetCourierPage() {
  const toast = useToast();
    const [fleetList, setFleetList] = useState([
    {
      id: 'ARM-01',
      courierName: 'Rian Hidayat',
      vehicleType: 'Mobil MPV (KAP 4 Kursi)',
      plateNumber: 'AD 1234 AB',
      assignedPos: 'Pos Mitra Solo Grand Mall',
      status: 'Aktif / Siap Tugas'
    },
    {
      id: 'ARM-02',
      courierName: 'Dewi Lestari',
      vehicleType: 'Motor Logistik',
      plateNumber: 'AD 5678 CD',
      assignedPos: 'Pos Mitra Pasar Klewer',
      status: 'Dalam Pengiriman'
    },
    {
      id: 'ARM-03',
      courierName: 'Fajar Nugroho',
      vehicleType: 'Mobil SUV',
      plateNumber: 'AD 9012 EF',
      assignedPos: 'Pos Mitra Jebres Stasiun',
      status: 'Aktif / Siap Tugas'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFleet, setCurrentFleet] = useState(null);

  const [formData, setFormData] = useState({
    courierName: '',
    vehicleType: 'Mobil MPV (KAP 4 Kursi)',
    plateNumber: '',
    assignedPos: 'Pos Mitra Solo Grand Mall',
    status: 'Aktif / Siap Tugas'
  });

  const vehicleOptions = [
    'Mobil MPV (KAP 4 Kursi)',
    'Mobil SUV',
    'Motor Logistik',
    'Mobil Van Kurir'
  ];

  const posOptions = [
    'Pos Mitra Solo Grand Mall',
    'Pos Mitra Pasar Klewer',
    'Pos Mitra Jebres Stasiun',
    'Pos Mitra Manahan'
  ];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      courierName: '',
      vehicleType: vehicleOptions[0],
      plateNumber: '',
      assignedPos: posOptions[0],
      status: 'Aktif / Siap Tugas'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentFleet(item);
    setFormData({
      courierName: item.courierName,
      vehicleType: item.vehicleType,
      plateNumber: item.plateNumber,
      assignedPos: item.assignedPos,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.courierName || !formData.plateNumber) {
      toast.warning('Nama kurir dan nomor plat kendaraan wajib diisi!', { title: 'Form Belum Lengkap' });
      return;
    }

    if (isEditing && currentFleet) {
      setFleetList(prev => prev.map(f => f.id === currentFleet.id ? { ...f, ...formData } : f));
    } else {
      const newFleet = {
        id: `ARM-0${fleetList.length + 1}`,
        ...formData
      };
      setFleetList([newFleet, ...fleetList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Hapus data armada ${id}?`)) {
      setFleetList(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFleet = fleetList.filter(f => {
    const matchesSearch = f.courierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoadingFleet = useSimulatedLoading([searchQuery, statusFilter], 700);

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Truck className="w-3.5 h-3.5" /> Manajemen Armada & Kurir
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Pengelolaan Armada & Kurir Wilayah</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Kelola daftar kendaraan, plat nomor, penugasan kurir, serta status operasional di pos wilayah Anda.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Armada / Kurir Baru
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900">Daftar Armada & Kurir Terdaftar</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cari kurir, plat nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
              />
            </div>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-purple-600 transition cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif / Siap Tugas">Aktif / Siap Tugas</option>
              <option value="Dalam Pengiriman">Dalam Pengiriman</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3 w-[22%]">ID & NAMA KURIR</th>
                <th className="py-4 px-3 w-[22%]">JENIS KENDARAAN & PLAT</th>
                <th className="py-4 px-3 w-[24%]">POS PENUGASAN</th>
                <th className="py-4 px-3 w-[16%]">STATUS OPERASIONAL</th>
                <th className="py-4 px-3 w-[16%] text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {isLoadingFleet ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Truck}
                      title="Armada Tidak Ditemukan"
                      description="Tidak ada armada yang cocok dengan pencarian atau filter status yang dipilih."
                    />
                  </td>
                </tr>
              ) : filteredFleet.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{item.courierName}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{item.id}</p>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <p className="font-bold text-neutral-800">{item.vehicleType}</p>
                    <p className="text-[10px] font-mono text-purple-700 font-extrabold">{item.plateNumber}</p>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <div className="flex items-center gap-1.5 text-neutral-700 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{item.assignedPos}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 truncate">
                    {item.status === 'Aktif / Siap Tugas' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Siap Tugas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                        <Truck className="w-3 h-3" /> Pengiriman
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-right space-x-1.5">
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Edit Armada"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Hapus Armada"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Armada */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">{isEditing ? 'Edit Data Armada & Kurir' : 'Tambah Armada & Kurir Baru'}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Lengkapi informasi kendaraan dan penugasan pos.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nama Kurir / Driver</label>
                <input 
                  type="text" 
                  value={formData.courierName} 
                  onChange={(e) => setFormData({...formData, courierName: e.target.value})}
                  placeholder="Contoh: Rian Hidayat" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Jenis Kendaraan</label>
                <select 
                  value={formData.vehicleType} 
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition cursor-pointer"
                >
                  {vehicleOptions.map((v, idx) => (
                    <option key={idx} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nomor Plat Kendaraan</label>
                <input 
                  type="text" 
                  value={formData.plateNumber} 
                  onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                  placeholder="Contoh: AD 1234 AB" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Pos Penugasan Wilayah</label>
                <select 
                  value={formData.assignedPos} 
                  onChange={(e) => setFormData({...formData, assignedPos: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition cursor-pointer"
                >
                  {posOptions.map((pos, idx) => (
                    <option key={idx} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Status Operasional</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition cursor-pointer"
                >
                  <option value="Aktif / Siap Tugas">Aktif / Siap Tugas</option>
                  <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-600/20 transition cursor-pointer">
                  Simpan Armada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}