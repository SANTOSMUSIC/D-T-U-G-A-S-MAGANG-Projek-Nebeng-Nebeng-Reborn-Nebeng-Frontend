import { useRef, useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Users, Search, Plus, Trash2, Pencil, Calendar, MapPin, AlertTriangle, Eye, EyeOff, History } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import BaseModal from '../../../components/ui/BaseModal';

export default function OperatorPosPage() {
  const toast = useToast();
  const [operatorList, setOperatorList] = useState([
    { id: 'OP-01', name: 'Rian Hidayat', email: 'rian.hidayat@nebeng.id', pos: 'Pos Mitra Solo Grand Mall', schedule: 'Senin - Jumat (08:00 - 16:00)', status: 'Aktif' },
    { id: 'OP-02', name: 'Dewi Lestari', email: 'dewi.lestari@nebeng.id', pos: 'Pos Mitra Pasar Klewer', schedule: 'Senin - Sabtu (07:00 - 15:00)', status: 'Aktif' },
    { id: 'OP-03', name: 'Fajar Nugroho', email: 'fajar.nugroho@nebeng.id', pos: 'Pos Mitra Jebres Stasiun', schedule: 'Selasa - Minggu (13:00 - 21:00)', status: 'Aktif' },
  ]);

  const nextOperatorIdRef = useRef(operatorList.length + 1);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOp, setCurrentOp] = useState(null);
  const [operatorToDelete, setOperatorToDelete] = useState(null);

  // Security PII & Audit Log State
  const [unmaskedEmails, setUnmaskedEmails] = useState({});
  const [operatorLogs, setOperatorLogs] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', pos: 'Pos Mitra Solo Grand Mall', schedule: 'Senin - Jumat (08:00 - 16:00)'
  });

  const availablePosList = [
    'Pos Mitra Solo Grand Mall',
    'Pos Mitra Pasar Klewer',
    'Pos Mitra Jebres Stasiun',
    'Pos Mitra Manahan'
  ];

  const maskEmail = (email) => {
    if (!email) return email;
    const parts = email.split('@');
    if (parts.length < 2) return email;
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const toggleMaskEmail = (id) => {
    setUnmaskedEmails(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      
      const newLog = {
        id: `LOG-OP-${Date.now().toString().slice(-4)}`,
        opId: currentOp.id,
        action: 'UPDATE OPERATOR',
        pos: formData.pos,
        timestamp: new Date().toLocaleTimeString('id-ID')
      };
      setOperatorLogs([newLog, ...operatorLogs]);

      toast.success(`Akun operator ${currentOp.id} berhasil diperbarui.`, { title: 'Perbaruan Berhasil' });
    } else {
      const generatedId = `OP-${String(nextOperatorIdRef.current).padStart(2, '0')}`;
      const newOperator = {
        id: generatedId,
        ...formData,
        status: 'Aktif'
      };
      nextOperatorIdRef.current += 1;
      setOperatorList([newOperator, ...operatorList]);

      const newLog = {
        id: `LOG-OP-${Date.now().toString().slice(-4)}`,
        opId: generatedId,
        action: 'CREATE OPERATOR',
        pos: formData.pos,
        timestamp: new Date().toLocaleTimeString('id-ID')
      };
      setOperatorLogs([newLog, ...operatorLogs]);

      toast.success(`Akun operator baru berhasil dibuat.`, { title: 'Operator Dibuat' });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!operatorToDelete) return;

    setOperatorList(prev => prev.filter(o => o.id !== operatorToDelete.id));

    const newLog = {
      id: `LOG-OP-${Date.now().toString().slice(-4)}`,
      opId: operatorToDelete.id,
      action: 'DELETE OPERATOR',
      pos: operatorToDelete.pos,
      timestamp: new Date().toLocaleTimeString('id-ID')
    };
    setOperatorLogs([newLog, ...operatorLogs]);

    toast.success(`Akun operator ${operatorToDelete.id} berhasil dihapus.`, { title: 'Hapus Berhasil' });
    setOperatorToDelete(null);
  };

  const filteredOperators = operatorList.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.pos.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoadingOperators = useSimulatedLoading([searchQuery], 700);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN AKUN OPERATOR POS REGIONAL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Akun & Penugasan Operator Pos</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Buat akun operator, tentukan pos penugasan, dan atur shift operasional dengan proteksi data PII.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Buat Operator Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total: <span className="font-bold text-neutral-800">{filteredOperators.length} Operator</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID & Nama Operator</th>
                <th className="py-3 px-5">Email Akun (PII Protected)</th>
                <th className="py-3 px-5">Pos Penugasan</th>
                <th className="py-3 px-5">Shift Operasional</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingOperators ? (
                <SkeletonTableRows rows={4} columns={6} />
              ) : filteredOperators.length > 0 ? (
                filteredOperators.map((op) => {
                  const isUnmasked = unmaskedEmails[op.id];
                  return (
                    <tr key={op.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 text-[10px]">{op.name}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono">{op.id}</div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <span>{isUnmasked ? op.email : maskEmail(op.email)}</span>
                          <button
                            onClick={() => toggleMaskEmail(op.id)}
                            className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                            title={isUnmasked ? "Sembunyikan Email" : "Tampilkan Email"}
                          >
                            {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-neutral-800">{op.pos}</td>
                      <td className="py-3.5 px-5 font-medium text-neutral-600">{op.schedule}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleOpenEdit(op)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setOperatorToDelete(op)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState icon={Users} title="Operator Tidak Ditemukan" description="Tidak ada operator pos yang cocok." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {operatorLogs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#4B2172]" />
            <h3 className="text-[12px] font-bold text-neutral-800">Catatan Audit Log Manajemen Operator</h3>
          </div>
          <div className="space-y-2">
            {operatorLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-800 font-mono">{log.id}</span>
                  <span className="px-2 py-0.5 font-bold rounded-full bg-purple-100 text-[#4B2172]">{log.action}</span>
                  <span className="text-neutral-600">ID Operator: <strong>{log.opId}</strong> ({log.pos})</span>
                </div>
                <span className="text-[8px] text-neutral-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Operator Pos' : 'Buat Operator Pos Baru'}
        subtitle="Sistem Akun Operasional Regional"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Lengkap</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Email Akun</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Pos Penugasan</label>
            <select value={formData.pos} onChange={(e) => setFormData({...formData, pos: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer">
              {availablePosList.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Shift Kerja</label>
            <input type="text" required value={formData.schedule} onChange={(e) => setFormData({...formData, schedule: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 text-[10px] font-bold text-white bg-[#4B2172] rounded-full cursor-pointer shadow-sm">Simpan</button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={Boolean(operatorToDelete)}
        onClose={() => setOperatorToDelete(null)}
        title="Konfirmasi Hapus Akun"
        subtitle="Manajemen Akses Operator Pos"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin menghapus akun operator <strong>{operatorToDelete?.name}</strong> ({operatorToDelete?.id})?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setOperatorToDelete(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Hapus</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}