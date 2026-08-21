import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, X, Trash2, Pencil, Calendar, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

export default function OperatorPosPage() {
  const toast = useToast();
  const [isLoadingOperators, setIsLoadingOperators] = useState(true);
  const [operatorList, setOperatorList] = useState([
    { id: 'OP-01', name: 'Rian Hidayat', email: 'rian.hidayat@nebeng.id', pos: 'Pos Mitra Solo Grand Mall', schedule: 'Senin - Jumat (08:00 - 16:00)', status: 'Aktif' },
    { id: 'OP-02', name: 'Dewi Lestari', email: 'dewi.lestari@nebeng.id', pos: 'Pos Mitra Pasar Klewer', schedule: 'Senin - Sabtu (07:00 - 15:00)', status: 'Aktif' },
    { id: 'OP-03', name: 'Fajar Nugroho', email: 'fajar.nugroho@nebeng.id', pos: 'Pos Mitra Jebres Stasiun', schedule: 'Selasa - Minggu (13:00 - 21:00)', status: 'Aktif' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOp, setCurrentOp] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', pos: 'Pos Mitra Solo Grand Mall', schedule: 'Senin - Jumat (08:00 - 16:00)'
  });

  const availablePosList = [
    'Pos Mitra Solo Grand Mall',
    'Pos Mitra Pasar Klewer',
    'Pos Mitra Jebres Stasiun',
    'Pos Mitra Manahan'
  ];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', email: '', pos: availablePosList[0], schedule: 'Senin - Jumat (08:00 - 16:00)' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (op) => {
    setIsEditing(true);
    setCurrentOp(op);
    setFormData({ name: op.name, email: op.email, pos: op.pos, schedule: op.schedule });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.warning('Nama dan Email akun operator wajib diisi!', { title: 'Form Belum Lengkap' });
      return;
    }

    if (isEditing && currentOp) {
      setOperatorList(prev => prev.map(o => o.id === currentOp.id ? { ...o, ...formData } : o));
    } else {
      const newOperator = {
        id: `OP-0${operatorList.length + 1}`,
        ...formData,
        status: 'Aktif'
      };
      setOperatorList([newOperator, ...operatorList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Hapus akun operator ${id}?`)) {
      setOperatorList(prev => prev.filter(o => o.id !== id));
    }
  };

  const filteredOperators = operatorList.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.pos.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setIsLoadingOperators(true);
    const timer = setTimeout(() => setIsLoadingOperators(false), 700);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" /> Manajemen Operator Pos
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Akun & Penugasan Operator Pos</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Buat akun operator_pos, tentukan lokasi penugasan checkpoint, serta atur jadwal shift kerja.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Buat Akun Operator Baru
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900">Daftar Akun Operator Pos Wilayah</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari nama, email, atau pos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3 w-[22%]">NAMA & AKUN EMAIL</th>
                <th className="py-4 px-3 w-[25%]">LOKASI POS PENUGASAN</th>
                <th className="py-4 px-3 w-[25%]">JADWAL & SHIFT OPERASIONAL</th>
                <th className="py-4 px-3 w-[14%]">STATUS AKUN</th>
                <th className="py-4 px-3 w-[14%] text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {isLoadingOperators ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="Operator Tidak Ditemukan"
                      description="Tidak ada operator yang cocok dengan pencarian, atau belum ada operator terdaftar."
                    />
                  </td>
                </tr>
              ) : filteredOperators.map((op) => (
                <tr key={op.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{op.name}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{op.email}</p>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <div className="flex items-center gap-1.5 text-neutral-800 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{op.pos}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <div className="flex items-center gap-1.5 text-neutral-600 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{op.schedule}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {op.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right space-x-1.5">
                    <button 
                      onClick={() => handleOpenEdit(op)}
                      className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Edit Penugasan & Akun"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(op.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Hapus Akun"
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

      {/* Modal Buat / Edit Akun & Penugasan Operator */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">{isEditing ? 'Edit Akun & Penugasan Operator' : 'Buat Akun operator_pos Baru'}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Tentukan kredensial akun, lokasi pos, dan jadwal shift.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nama Lengkap Operator</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Rian Hidayat" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Email Akun (Username Login)</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="operator@nebeng.id" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Lokasi Pos / Terminal Penugasan</label>
                <select 
                  value={formData.pos} 
                  onChange={(e) => setFormData({...formData, pos: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition cursor-pointer"
                >
                  {availablePosList.map((posName, idx) => (
                    <option key={idx} value={posName}>{posName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Jadwal & Shift Operasional</label>
                <input 
                  type="text" 
                  value={formData.schedule} 
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  placeholder="Contoh: Senin - Jumat (08:00 - 16:00)" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-600/20 transition cursor-pointer">
                  Simpan Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}