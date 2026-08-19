import React, { useState } from 'react';
import { PackageCheck, Camera, QrCode, CheckCircle2 } from 'lucide-react';

export default function OperatorInspection() {
  const [formData, setFormData] = useState({
    senderName: '',
    itemType: '',
    qrCode: ''
  });
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [inspections, setInspections] = useState([
    { id: 'INS-001', sender: 'Budi Santoso', item: 'Elektronik (Laptop)', qr: 'QR-SGL-88910', status: 'Segel Terpasang', date: '19 Agu 2026, 10:00' },
    { id: 'INS-002', sender: 'Siti Aminah', item: 'Makanan Khas Solo', qr: 'QR-SGL-88911', status: 'Segel Terpasang', date: '19 Agu 2026, 09:15' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `INS-00${inspections.length + 1}`,
      sender: formData.senderName || 'Pengirim Umum',
      item: formData.itemType || 'Barang Umum',
      qr: formData.qrCode || 'QR-SGL-99999',
      status: 'Segel Terpasang',
      date: 'Baru saja'
    };
    setInspections([newEntry, ...inspections]);
    setFormData({ senderName: '', itemType: '', qrCode: '' });
    setPhotoUploaded(false);
    alert('Inspeksi fisik berhasil disimpan dan stiker segel QR tercatat!');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#c91882] font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <PackageCheck className="w-3.5 h-3.5" /> Standar Keamanan & Validasi Pos
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Inspeksi & Sealing (Pemeriksaan Paket)</h1>
          <p className="text-neutral-400 text-xs mt-0.5">Pemeriksaan fisik isi paket bersama pengirim, unggah foto kondisi, dan penempelan segel QR unik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-base font-extrabold text-neutral-900 mb-4">Form Pemeriksaan & Sealing</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">NAMA PENGIRIM</label>
              <input 
                type="text" 
                required
                placeholder="cth: Budi Santoso"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">JENIS & DESKRIPSI BARANG</label>
              <input 
                type="text" 
                required
                placeholder="cth: Dokumen / Elektronik / Makanan"
                value={formData.itemType}
                onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">UPLOAD FOTO KONDISI BARANG</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:bg-neutral-50 transition cursor-pointer">
                <Camera className="w-6 h-6 text-[#c91882] mx-auto mb-1" />
                <p className="font-bold text-neutral-700">{photoUploaded ? 'Foto Berhasil Diunggah (1 File)' : 'Klik untuk Unggah Foto Fisik'}</p>
                <p className="text-[10px] text-neutral-400">PNG, JPG (Maks. 5MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={() => setPhotoUploaded(true)} 
                  id="upload-foto-barang"
                />
                <label htmlFor="upload-foto-barang" className="mt-2 inline-block px-3 py-1 bg-pink-50 text-[#c91882] font-extrabold rounded-lg text-[10px] cursor-pointer">
                  Pilih Berkas Foto
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1">NOMOR STIKER SEGEL QR UNIK</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  required
                  placeholder="Scan atau Ketik Kode QR"
                  value={formData.qrCode}
                  onChange={(e) => setFormData({...formData, qrCode: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#c91882] font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, qrCode: `QR-SGL-${Math.floor(10000 + Math.random() * 90000)}`})}
                  className="px-4 bg-pink-50 text-[#c91882] font-extrabold rounded-xl hover:bg-pink-100 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> Scan
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#c91882] hover:bg-[#b51474] text-white font-bold rounded-xl shadow-lg shadow-[#c91882]/25 transition cursor-pointer mt-2"
            >
              Simpan & Kunci Paket
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-base font-extrabold text-neutral-900 mb-6">Riwayat Pemeriksaan & Segel Hari Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-3">ID & WAKTU</th>
                  <th className="py-4 px-3">PENGIRIM</th>
                  <th className="py-4 px-3">JENIS BARANG</th>
                  <th className="py-4 px-3">KODE QR SEGEL</th>
                  <th className="py-4 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
                {inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-4 px-3">
                      <p className="font-extrabold text-neutral-900">{item.id}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold">{item.date}</p>
                    </td>
                    <td className="py-4 px-3 font-bold text-neutral-800">{item.sender}</td>
                    <td className="py-4 px-3 font-semibold text-neutral-600">{item.item}</td>
                    <td className="py-4 px-3 font-mono font-extrabold text-[#c91882]">{item.qr}</td>
                    <td className="py-4 px-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
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