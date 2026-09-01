import { useRef, useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { MapPin, Search, Plus, QrCode, Trash2, Pencil, Printer, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function PosMitraManagement() {
  const toast = useToast();
  const [posList, setPosList] = useState([
    { id: 'POS-01', name: 'Pos Mitra Solo Grand Mall', address: 'Jl. Slamet Riyadi No.273, Surakarta', lat: '-7.5561', long: '110.8173', operator: 'Rian Hidayat', status: 'Aktif' },
    { id: 'POS-02', name: 'Pos Mitra Pasar Klewer', address: 'Jl. Dr. Radjiman, Gajahan, Surakarta', lat: '-7.5753', long: '110.8241', operator: 'Dewi Lestari', status: 'Aktif' },
    { id: 'POS-03', name: 'Pos Mitra Jebres Stasiun', address: 'Jl. Perintis Kemerdekaan, Jebres, Surakarta', lat: '-7.5582', long: '110.8435', operator: 'Fajar Nugroho', status: 'Aktif' },
  ]);

  const nextPosIdRef = useRef(posList.length + 1);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [posToDelete, setPosToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '', address: '', lat: '', long: '', operator: 'Rian Hidayat'
  });

  const operatorsList = ['Rian Hidayat', 'Dewi Lestari', 'Fajar Nugroho', 'Budi Santoso'];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', address: '', lat: '', long: '', operator: operatorsList[0] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos) => {
    setIsEditing(true);
    setCurrentPos(pos);
    setFormData({ name: pos.name, address: pos.address, lat: pos.lat, long: pos.long, operator: pos.operator });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.warning('Nama Pos dan Alamat wajib diisi!', { title: 'Form Belum Lengkap' });
      return;
    }

    if (isEditing && currentPos) {
      setPosList(prev => prev.map(p => p.id === currentPos.id ? { ...p, ...formData } : p));
    } else {
      const newPos = {
        id: `POS-${String(nextPosIdRef.current).padStart(2, '0')}`,
        ...formData,
        status: 'Aktif'
      };
      nextPosIdRef.current += 1;
      setPosList([newPos, ...posList]);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!posToDelete) return;
    setPosList(prev => prev.filter(p => p.id !== posToDelete.id));
    toast.success(`Pos ${posToDelete.id} berhasil dihapus.`, { title: 'Hapus Berhasil' });
    setPosToDelete(null);
  };

  const handleShowQr = (pos) => {
    setCurrentPos(pos);
    setIsQrModalOpen(true);
  };

  const handlePrintQr = () => {
    window.print();
  };

  const filteredPos = posList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoadingPos = useSimulatedLoading([searchQuery], 700);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] print:p-0 print:bg-white">
      <style>{`
        @media print {
          body, html, #root { margin: 0 !important; padding: 0 !important; background: white !important; }
          aside, nav, header, button, .print-hidden { display: none !important; }
          #printable-qr-area {
            display: block !important;
            box-shadow: none !important;
            border: 2px solid #e5e7eb !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              MANAJEMEN POS CHECKPOINT & TERMINAL
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Manajemen Pos Mitra & Terminal</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Kelola lokasi pos, koordinat lat/long, penugasan operator, serta cetak QR Code.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0 print-hidden"
        >
          <Plus size={14} />
          <span>Tambah Pos Baru</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between gap-3 print-hidden">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari pos, alamat, operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>
        <div className="text-[10px] font-semibold text-neutral-400 px-2">
          Total: <span className="font-bold text-neutral-800">{filteredPos.length} Pos</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden print-hidden">
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingPos ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredPos.length > 0 ? (
            filteredPos.map((pos) => (
              <div key={pos.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-[#4B2172] font-mono">{pos.id}</span>
                    <h3 className="font-bold text-neutral-800 text-[11px]">{pos.name}</h3>
                  </div>
                  <StatusBadge variant="emerald">{pos.status}</StatusBadge>
                </div>
                <p className="text-[9px] text-neutral-500">{pos.address}</p>
                <div className="flex items-center justify-between text-[9px] pt-1">
                  <span className="font-mono text-[#4B2172] font-bold">{pos.lat}, {pos.long}</span>
                  <span className="font-semibold text-neutral-700">Op: {pos.operator}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-100">
                  <button onClick={() => handleShowQr(pos)} className="p-1.5 bg-[#4B2172]/10 text-[#4B2172] rounded-lg cursor-pointer">
                    <QrCode size={13} />
                  </button>
                  <button onClick={() => handleOpenEdit(pos)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg cursor-pointer">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setPosToDelete(pos)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={MapPin} title="Pos Tidak Ditemukan" description="Tidak ada pos yang cocok dengan pencarian Anda." />
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Nama & Kode Pos</th>
                <th className="py-3 px-5">Alamat Lokasi</th>
                <th className="py-3 px-5">Koordinat Lat/Long</th>
                <th className="py-3 px-5">Operator Pos</th>
                <th className="py-3 px-5 text-center">Aksi & QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingPos ? (
                <SkeletonTableRows rows={4} columns={5} />
              ) : filteredPos.length > 0 ? (
                filteredPos.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 text-[10px]">{pos.name}</div>
                      <div className="text-[8px] font-bold text-[#4B2172] font-mono">{pos.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-neutral-600">{pos.address}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#4B2172]">{pos.lat}, {pos.long}</td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{pos.operator}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleShowQr(pos)} className="p-1.5 bg-[#4B2172]/10 hover:bg-[#4B2172]/20 text-[#4B2172] rounded-lg transition cursor-pointer">
                          <QrCode size={13} />
                        </button>
                        <button onClick={() => handleOpenEdit(pos)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setPosToDelete(pos)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState icon={MapPin} title="Pos Tidak Ditemukan" description="Tidak ada pos yang cocok dengan pencarian." />
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
        title={isEditing ? 'Ubah Data Pos Checkpoint' : 'Tambah Pos Checkpoint Baru'}
        subtitle="Sistem Manajemen Wilayah & Terminal"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Nama Pos / Terminal</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Alamat Lengkap</label>
            <textarea rows="2" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Latitude</label>
              <input type="text" required value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value.replace(/[^0-9.-]/g, '')})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-neutral-500 uppercase">Longitude</label>
              <input type="text" required value={formData.long} onChange={(e) => setFormData({...formData, long: e.target.value.replace(/[^0-9.-]/g, '')})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-mono font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-500 uppercase">Penetapan Operator</label>
            <select value={formData.operator} onChange={(e) => setFormData({...formData, operator: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer">
              {operatorsList.map((op, idx) => (
                <option key={idx} value={op}>{op}</option>
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
        isOpen={Boolean(isQrModalOpen && currentPos)}
        onClose={() => setIsQrModalOpen(false)}
        title={`QR Code ${currentPos?.id}`}
        subtitle={currentPos?.name}
        maxWidth="max-w-xs"
      >
        {currentPos && (
          <div className="text-center space-y-4">
            <div id="printable-qr-area" className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentPos.id + '-' + currentPos.name)}`} 
                alt={`QR Code ${currentPos.id}`}
                className="w-32 h-32 mx-auto object-contain"
              />
              <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full inline-block">
                {currentPos.id}
              </span>
              <div>
                <h4 className="text-[11px] font-bold text-neutral-800">{currentPos.name}</h4>
                <p className="text-[9px] text-neutral-500">{currentPos.address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 print-hidden">
              <button onClick={() => setIsQrModalOpen(false)} className="py-2 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-full cursor-pointer">Tutup</button>
              <button onClick={handlePrintQr} className="py-2 bg-[#4B2172] text-white text-[10px] font-bold rounded-full flex items-center justify-center gap-1 cursor-pointer shadow-sm"><Printer size={13}/> Cetak</button>
            </div>
          </div>
        )}
      </BaseModal>

      <BaseModal
        isOpen={Boolean(posToDelete)}
        onClose={() => setPosToDelete(null)}
        title="Konfirmasi Hapus Pos"
        subtitle="Manajemen Pos & Terminal"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px] text-center">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <p className="text-neutral-600">
            Apakah Anda yakin ingin menghapus <strong>{posToDelete?.name}</strong> ({posToDelete?.id})?
          </p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setPosToDelete(null)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-full font-bold cursor-pointer">Batal</button>
            <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-rose-600 text-white rounded-full font-bold cursor-pointer shadow-sm">Ya, Hapus</button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}