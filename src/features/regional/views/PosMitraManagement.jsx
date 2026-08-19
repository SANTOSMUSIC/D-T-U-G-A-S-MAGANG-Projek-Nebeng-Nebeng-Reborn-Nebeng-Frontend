import React, { useState } from 'react';
import { MapPin, Search, Plus, X, QrCode, Trash2, Pencil, Printer } from 'lucide-react';

export default function PosMitraManagement() {
  const [posList, setPosList] = useState([
    { id: 'POS-01', name: 'Pos Mitra Solo Grand Mall', address: 'Jl. Slamet Riyadi No.273, Surakarta', lat: '-7.5561', long: '110.8173', operator: 'Rian Hidayat', status: 'Aktif' },
    { id: 'POS-02', name: 'Pos Mitra Pasar Klewer', address: 'Jl. Dr. Radjiman, Gajahan, Surakarta', lat: '-7.5753', long: '110.8241', operator: 'Dewi Lestari', status: 'Aktif' },
    { id: 'POS-03', name: 'Pos Mitra Jebres Stasiun', address: 'Jl. Perintis Kemerdekaan, Jebres, Surakarta', lat: '-7.5582', long: '110.8435', operator: 'Fajar Nugroho', status: 'Aktif' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
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
      alert('Nama Pos dan Alamat wajib diisi!');
      return;
    }

    if (isEditing && currentPos) {
      setPosList(prev => prev.map(p => p.id === currentPos.id ? { ...p, ...formData } : p));
    } else {
      const newPos = {
        id: `POS-0${posList.length + 1}`,
        ...formData,
        status: 'Aktif'
      };
      setPosList([newPos, ...posList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Hapus Pos ${id}?`)) {
      setPosList(prev => prev.filter(p => p.id !== id));
    }
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* CSS Khusus untuk Cetak (Hanya Area QR Card yang Tercetak Bersih) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-area, #printable-qr-area * {
            visibility: visible;
          }
          #printable-qr-area {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 340px;
            box-shadow: none !important;
            border: 2px solid #e5e7eb !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" /> Manajemen Pos Checkpoint
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Manajemen Pos Mitra & Terminal</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Kelola lokasi pos, koordinat lat/long, penugasan operator, serta cetak QR Code Identitas Pos.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Pos / Terminal Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900">Daftar Pos Checkpoint Wilayah</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari pos, alamat, operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-3 w-[22%]">NAMA & KODE POS</th>
                <th className="py-4 px-3 w-[26%]">ALAMAT LOKASI</th>
                <th className="py-4 px-3 w-[16%]">KOORDINAT LAT/LONG</th>
                <th className="py-4 px-3 w-[16%]">OPERATOR POS</th>
                <th className="py-4 px-3 w-[20%] text-right">AKSI & QR CODE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {filteredPos.map((pos) => (
                <tr key={pos.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{pos.name}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold">{pos.id}</p>
                  </td>
                  <td className="py-4 px-3 truncate font-semibold text-neutral-600">{pos.address}</td>
                  <td className="py-4 px-3 truncate font-mono text-[11px] text-purple-700 font-bold">
                    {pos.lat}, {pos.long}
                  </td>
                  <td className="py-4 px-3 truncate font-bold text-neutral-800">{pos.operator}</td>
                  <td className="py-4 px-3 text-right space-x-1.5">
                    <button 
                      onClick={() => handleShowQr(pos)}
                      className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Cetak QR Code Pos"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(pos)}
                      className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Edit Pos"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(pos.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="Hapus Pos"
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">{isEditing ? 'Edit Pos Checkpoint' : 'Tambah Pos Checkpoint Baru'}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Lengkapi informasi lokasi dan penugasan operator.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Nama Pos / Terminal</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Pos Mitra Manahan" 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
                <textarea 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Masukkan alamat lengkap pos..."
                  rows="2"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Koordinat Latitude</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={formData.lat} 
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9.-]/g, '');
                      setFormData({...formData, lat: sanitized});
                    }}
                    placeholder="-7.5500" 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-mono font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Koordinat Longitude</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={formData.long} 
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9.-]/g, '');
                      setFormData({...formData, long: sanitized});
                    }}
                    placeholder="110.8200" 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-mono font-medium text-neutral-800 focus:outline-none focus:border-purple-600 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">Penetapan Operator Pos</label>
                <select 
                  value={formData.operator} 
                  onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-600 transition cursor-pointer"
                >
                  {operatorsList.map((op, idx) => (
                    <option key={idx} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-2xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 shadow-lg shadow-purple-600/20 transition cursor-pointer">
                  Simpan Pos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code Identitas Pos Asli & Siap Cetak */}
      {isQrModalOpen && currentPos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="flex justify-end mb-2 no-print">
              <button onClick={() => setIsQrModalOpen(false)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-qr-area" className="bg-white p-6 rounded-3xl border border-neutral-200 mb-4 inline-block w-full max-w-[300px] mx-auto shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentPos.id + '-' + currentPos.name)}`} 
                    alt={`QR Code ${currentPos.id}`}
                    className="w-36 h-36 mx-auto object-contain"
                  />
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-mono font-extrabold bg-neutral-100 text-neutral-800 py-1 px-3 rounded-full border border-neutral-200">
                    {currentPos.id}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <h3 className="text-xs font-extrabold text-neutral-900">{currentPos.name}</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5 px-1">{currentPos.address}</p>
                <div className="mt-2 inline-block bg-purple-50 border border-purple-100 py-0.5 px-2.5 rounded-full">
                  <span className="text-[9px] font-extrabold text-purple-700">Operator: {currentPos.operator}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100 no-print">
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition cursor-pointer"
              >
                Tutup
              </button>
              <button 
                onClick={handlePrintQr}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}