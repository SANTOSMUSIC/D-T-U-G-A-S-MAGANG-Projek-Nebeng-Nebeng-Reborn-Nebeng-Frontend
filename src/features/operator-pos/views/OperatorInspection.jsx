import { useState, useEffect } from 'react';
import { PackageCheck, Camera, QrCode, X as XIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function OperatorInspection() {
  const toast = useToast();
  const [isLoadingInspections, setIsLoadingInspections] = useState(true);
  const [formData, setFormData] = useState({
    senderName: '',
    itemType: '',
    qrCode: ''
  });

  const [itemPhoto, setItemPhoto] = useState(null);
  const [itemPhotoPreviewUrl, setItemPhotoPreviewUrl] = useState(null);

  const [inspections, setInspections] = useState([
    { id: 'INS-001', sender: 'Budi Santoso', item: 'Elektronik (Laptop)', qr: 'QR-SGL-88910', status: 'Segel Terpasang', date: '19 Agu 2026, 10:00' },
    { id: 'INS-002', sender: 'Siti Aminah', item: 'Makanan Khas Solo', qr: 'QR-SGL-88911', status: 'Segel Terpasang', date: '19 Agu 2026, 09:15' }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingInspections(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handlePhotoFileChange = (file) => {
    setItemPhoto(file || null);
    setItemPhotoPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  // FIX: bersihkan object URL preview foto barang saat operator pindah
  // halaman sebelum menghapus/mengganti fotonya (mencegah memory leak).
  useEffect(() => {
    return () => {
      if (itemPhotoPreviewUrl) URL.revokeObjectURL(itemPhotoPreviewUrl);
    };
  }, [itemPhotoPreviewUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemPhoto) {
      toast.warning('Wajib mengunggah foto fisik barang sebelum menyegel!', { title: 'Foto Barang Diperlukan' });
      return;
    }

    const newEntry = {
      id: `INS-${String(inspections.length + 1).padStart(3, '0')}`,
      sender: formData.senderName || 'Pengirim Umum',
      item: formData.itemType || 'Barang Umum',
      qr: formData.qrCode || `QR-SGL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Segel Terpasang',
      date: 'Baru saja'
    };

    setInspections([newEntry, ...inspections]);
    setFormData({ senderName: '', itemType: '', qrCode: '' });
    handlePhotoFileChange(null);
    toast.success('Inspeksi fisik berhasil disimpan dan stiker segel QR tercatat!', { title: 'Inspeksi Tersimpan' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <PackageCheck className="w-3 h-3" /> STANDAR KEAMANAN & VALIDASI POS
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Inspeksi & Sealing (Pemeriksaan Paket)
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pemeriksaan fisik isi paket bersama pengirim, unggah foto kondisi, dan penempelan segel QR unik.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Form Pemeriksaan & Sealing</h2>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                NAMA PENGIRIM
              </label>
              <input 
                type="text" 
                required
                placeholder="cth: Budi Santoso"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                JENIS & DESKRIPSI BARANG
              </label>
              <input 
                type="text" 
                required
                placeholder="cth: Dokumen / Elektronik / Makanan"
                value={formData.itemType}
                onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                UPLOAD FOTO KONDISI BARANG
              </label>
              {itemPhotoPreviewUrl ? (
                <div className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                  <img src={itemPhotoPreviewUrl} alt="Pratinjau Barang" className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-emerald-600">Foto Ter-upload</p>
                    <p className="text-[8px] text-neutral-400 truncate">{itemPhoto?.name}</p>
                  </div>
                  <button type="button" onClick={() => handlePhotoFileChange(null)} className="w-6 h-6 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 cursor-pointer">
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-200 rounded-xl p-3.5 text-center hover:bg-neutral-50 transition cursor-pointer flex flex-col items-center justify-center">
                  <Camera className="w-5 h-5 text-[#4B2172] mb-1" />
                  <p className="font-bold text-neutral-700 text-[10px]">Klik untuk Unggah Foto</p>
                  <p className="text-[8px] text-neutral-400">PNG, JPG (Maks. 5MB)</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => handlePhotoFileChange(e.target.files[0])} 
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                NOMOR STIKER SEGEL QR UNIK
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  required
                  placeholder="Scan / Ketik Kode QR"
                  value={formData.qrCode}
                  onChange={(e) => setFormData({...formData, qrCode: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#4B2172] font-medium text-[10px]"
                />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, qrCode: `QR-SGL-${Math.floor(10000 + Math.random() * 90000)}`})}
                  className="px-3 bg-purple-50 text-[#4B2172] font-bold text-[9px] rounded-xl hover:bg-purple-100 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> Auto
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white text-[10px] font-bold rounded-xl transition shadow-sm cursor-pointer mt-1"
            >
              Simpan & Kunci Paket
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-[14px] font-bold text-neutral-800">Riwayat Pemeriksaan & Segel Hari Ini</h2>
          
          <div className="block sm:hidden divide-y divide-neutral-100">
            {isLoadingInspections ? (
              <div className="p-4 space-y-3">
                <SkeletonTableRows rows={3} columns={1} />
              </div>
            ) : inspections.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="Belum Ada Pemeriksaan"
                description="Belum ada riwayat pemeriksaan dan segel paket hari ini."
              />
            ) : inspections.map((item) => (
              <div key={item.id} className="py-3 space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 font-mono">{item.id}</span>
                    <span className="text-[8px] text-neutral-400 block">{item.date}</span>
                  </div>
                  <StatusBadge variant="emerald">{item.status}</StatusBadge>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Pengirim: <strong>{item.sender}</strong></span>
                  <span className="font-mono font-bold text-[#4B2172]">{item.qr}</span>
                </div>
                <p className="text-[9px] text-neutral-500">Barang: {item.item}</p>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">ID & WAKTU</th>
                  <th className="py-3 px-4">PENGIRIM</th>
                  <th className="py-3 px-4">JENIS BARANG</th>
                  <th className="py-3 px-4">KODE QR SEGEL</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[9px]">
                {isLoadingInspections ? (
                  <SkeletonTableRows rows={3} columns={5} />
                ) : inspections.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={PackageCheck}
                        title="Belum Ada Pemeriksaan"
                        description="Belum ada riwayat pemeriksaan dan segel paket hari ini."
                      />
                    </td>
                  </tr>
                ) : inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-800 font-mono text-[10px]">{item.id}</p>
                      <p className="text-[8px] text-neutral-400 font-semibold">{item.date}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-800">{item.sender}</td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-700">{item.item}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4B2172]">{item.qr}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge variant="emerald">{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}