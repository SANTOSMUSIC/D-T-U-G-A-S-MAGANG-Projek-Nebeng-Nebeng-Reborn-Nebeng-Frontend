import React, { useState } from 'react';
import { Users, Search, Eye, UserCheck, X, ShieldCheck } from 'lucide-react';

export default function KurirPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [kurirList] = useState([
    { id: 'KUR-01', name: 'Joko Widodo', role: 'Driver Armada Mobil', pos: 'Pos Mitra Solo Grand Mall', activeShipments: 14, status: 'Bertugas', phone: '081233445566', rating: '4.9' },
    { id: 'KUR-02', name: 'Slamet Riyadi', role: 'Kurir Motor Wilayah', pos: 'Pos Mitra Pasar Klewer', activeShipments: 8, status: 'Standby', phone: '082155667788', rating: '4.8' },
    { id: 'KUR-03', name: 'Ahmad Dahlan', role: 'Driver Armada Pick Up', pos: 'Pos Mitra Jebres Stasiun', activeShipments: 12, status: 'Bertugas', phone: '085788990011', rating: '5.0' },
    { id: 'KUR-04', name: 'Budi Utomo', role: 'Kurir Motor Wilayah', pos: 'Pos Mitra Manahan', activeShipments: 0, status: 'Istirahat', phone: '087811223344', rating: '4.7' },
  ]);

  const filteredKurir = kurirList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.pos.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" /> Manajemen SDM Wilayah
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Data Kurir & Driver</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Kelola personel kurir, penugasan pos mitra, serta performa dan rating pengiriman.</p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">STATUS PERSONEL</p>
            <p className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Terverifikasi Aktif
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">TOTAL KURIR & DRIVER</p>
            <p className="text-3xl font-extrabold text-neutral-900">{kurirList.length} <span className="text-sm font-bold text-neutral-500">Orang</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">SEDANG BERTUGAS</p>
            <p className="text-3xl font-extrabold text-indigo-600">{kurirList.filter(k => k.status === 'Bertugas').length} <span className="text-sm font-bold text-neutral-500">Personel</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-[10px] font-extrabold uppercase tracking-wider mb-1">SIAP SIAGA (STANDBY)</p>
            <p className="text-3xl font-extrabold text-emerald-600">{kurirList.filter(k => k.status === 'Standby').length} <span className="text-sm font-bold text-neutral-500">Personel</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900">Daftar Personel Kurir Wilayah</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari nama kurir, peran, pos..."
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
                <th className="py-4 px-3 w-[18%]">NAMA KURIR</th>
                <th className="py-4 px-3 w-[20%]">PERAN / POSISI</th>
                <th className="py-4 px-3 w-[22%]">POS MITRA</th>
                <th className="py-4 px-3 w-[15%]">PAKET AKTIF</th>
                <th className="py-4 px-3 w-[15%]">STATUS</th>
                <th className="py-4 px-3 w-[10%] text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium">
              {filteredKurir.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition group">
                  <td className="py-4 px-3 truncate">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{item.name}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{item.phone}</p>
                  </td>
                  <td className="py-4 px-3 truncate font-extrabold text-neutral-800">{item.role}</td>
                  <td className="py-4 px-3 truncate font-semibold text-neutral-700">{item.pos}</td>
                  <td className="py-4 px-3 truncate">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-extrabold inline-block">
                      {item.activeShipments} Pkt
                    </span>
                  </td>
                  <td className="py-4 px-3 truncate">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === 'Bertugas' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      item.status === 'Standby' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => setSelectedDetail(item)}
                      className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 inline-flex items-center justify-center transition shadow-sm cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">{selectedDetail.name}</h2>
                  <p className="text-[11px] text-purple-700 font-extrabold tracking-wider">{selectedDetail.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Status Personel</span>
                  <span className="font-extrabold text-neutral-900">{selectedDetail.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Pos Mitra Penugasan</span>
                  <span className="font-extrabold text-neutral-900">{selectedDetail.pos}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Peran Kurir</span>
                  <span className="font-extrabold text-neutral-900">{selectedDetail.role}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Paket Aktif Ditangani</span>
                  <span className="font-extrabold text-blue-600">{selectedDetail.activeShipments} Paket</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Rating Kinerja</span>
                  <span className="font-extrabold text-emerald-600">★ {selectedDetail.rating}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-bold">Nomor Kontak HP</span>
                  <span className="font-extrabold text-neutral-900">{selectedDetail.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-neutral-100 mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedDetail(null)}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition shadow-md shadow-purple-700/20 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}