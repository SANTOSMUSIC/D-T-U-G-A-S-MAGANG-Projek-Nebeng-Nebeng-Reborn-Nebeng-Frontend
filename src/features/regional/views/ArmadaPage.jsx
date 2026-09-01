import { useRef, useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Truck, Search, Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

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

  const nextFleetIdRef = useRef(fleetList.length + 1);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFleet, setCurrentFleet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
        id: `ARM-${String(nextFleetIdRef.current).padStart(2, '0')}`,
        ...formData
      };
      nextFleetIdRef.current += 1;
      setFleetList([newFleet, ...fleetList]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setFleetList(prev => prev.filter(f => f.id !== deleteTarget.id));
    toast.success(`Armada ${deleteTarget.id} berhasil dihapus.`, { title: 'Hapus Berhasil' });
    setDeleteTarget(null);
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN ARMADA & KENDARAAN
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Pengelolaan Armada Kendaraan</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Kelola daftar kendaraan, plat nomor, penugasan pos, serta status operasional.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Tambah Armada Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari kurir, plat nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif / Siap Tugas">Aktif / Siap Tugas</option>
          <option value="Dalam Pengiriman">Dalam Pengiriman</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingFleet ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredFleet.length > 0 ? (
            filteredFleet.map((item) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id}</span>
                    <h3 className="font-bold text-neutral-800 text-[11px]">{item.courierName}</h3>
                  </div>
                  <StatusBadge variant={item.status === 'Aktif / Siap Tugas' ? 'emerald' : 'blue'}>
                    {item.status}
                  </StatusBadge>
                </div>
                <div className="text-[9px] text-neutral-500">
                  <div>Kendaraan: <strong>{item.vehicleType}</strong> ({item.plateNumber})</div>
                  <div>Pos: <strong>{item.assignedPos}</strong></div>
                </div>
                <div className="flex justify-end gap-1.5 pt-2 border-t border-neutral-100">
                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg cursor-pointer">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={Truck} title="Armada Tidak Ditemukan" description="Tidak ada armada yang cocok." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Kurir</th>
                <th className="py-3 px-5">Jenis & Plat Nomor</th>
                <th className="py-3 px-5">Pos Penugasan</th>
                <th className="py-3 px-5">Status Operasional</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingFleet ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredFleet.length > 0 ? (
                filteredFleet.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{item.courierName}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">
                      <div>{item.vehicleType}</div>
                      <div className="font-mono text-[8px] text-[#4B2172] font-bold">{item.plateNumber}</div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">{item.assignedPos}</td>
                    <td className="py-3.5 px-5">
                      <StatusBadge variant={item.status === 'Aktif / Siap Tugas' ? 'emerald' : 'blue'}>
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState icon={Truck} title="Armada Tidak Ditemukan" description="Tidak ada armada yang cocok." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Data Armada' : 'Tambah Armada Baru'}
        subtitle="Sistem Manajemen Kendaraan Operasional"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Kurir / Driver</label>
            <input type="text" required value={formData.courierName} onChange={(e) => setFormData({...formData, courierName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Jenis Kendaraan</label>
            <select value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer">
              {vehicleOptions.map((v, idx) => (
                <option key={idx} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nomor Plat</label>
            <input type="text" required value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-bold uppercase text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Pos Penugasan</label>
            <select value={formData.assignedPos} onChange={(e) => setFormData({...formData, assignedPos: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer">
              {posOptions.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full cursor-pointer shadow-sm">Simpan</button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus Armada"
        subtitle="Pencabutan Akses Kendaraan"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin menghapus data armada <strong>{deleteTarget?.id}</strong> ({deleteTarget?.plateNumber}) atas nama <strong>{deleteTarget?.courierName}</strong>?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Hapus</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}