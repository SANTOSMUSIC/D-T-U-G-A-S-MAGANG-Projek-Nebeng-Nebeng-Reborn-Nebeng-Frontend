import React, { useState } from 'react';
import { DollarSign, Printer, Calendar, Search, ArrowUpRight, FileText, CheckCircle2, Info, X } from 'lucide-react';

export default function FinancialReportPage() {
  const [reportList, setReportList] = useState([
    {
      id: 'TRX-8801',
      tripId: 'TRIP-9081',
      posName: 'Pos Mitra Solo Grand Mall',
      serviceType: 'Ride / Transportasi',
      amount: 'Rp 35.000',
      commission: 'Rp 5.250',
      status: 'Lunas / Selesai',
      statusDetail: 'Pembayaran tunai diverifikasi oleh Operator Pos Solo Grand Mall. Dana masuk ke Rekening Escrow Regional.',
      date: '19 Agu 2026, 09:30',
      paymentMethod: 'Tunai di Pos'
    },
    {
      id: 'TRX-8802',
      tripId: 'TRIP-9082',
      posName: 'Pos Mitra Jebres Stasiun',
      serviceType: 'Kurir / Food',
      amount: 'Rp 45.000',
      commission: 'Rp 6.750',
      status: 'Lunas / Selesai',
      statusDetail: 'Pembayaran QRIS otomatis tervalidasi gateway. Komisi regional langsung terpotong sistem.',
      date: '19 Agu 2026, 08:15',
      paymentMethod: 'QRIS / Non-Tunai'
    },
    {
      id: 'TRX-8803',
      tripId: 'TRIP-9083',
      posName: 'Pos Mitra Pasar Klewer',
      serviceType: 'Ride / Transportasi',
      amount: 'Rp 50.000',
      commission: 'Rp 7.500',
      status: 'Lunas / Selesai',
      statusDetail: 'Pembayaran tunai diverifikasi oleh Operator Pos Pasar Klewer. Settlement harian sukses.',
      date: '19 Agu 2026, 07:45',
      paymentMethod: 'Tunai di Pos'
    },
    {
      id: 'TRX-8804',
      tripId: 'TRIP-9084',
      posName: 'Pos Mitra Solo Grand Mall',
      serviceType: 'Kurir / Logistik',
      amount: 'Rp 25.000',
      commission: 'Rp 3.750',
      status: 'Lunas / Selesai',
      statusDetail: 'Pembayaran transfer bank diverifikasi otomatis oleh sistem verifikasi pusat.',
      date: '18 Agu 2026, 16:20',
      paymentMethod: 'Transfer Bank'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState('Semua Pos');
  const [selectedStatusDetail, setSelectedStatusDetail] = useState(null);

  const posOptions = [
    'Semua Pos',
    'Pos Mitra Solo Grand Mall',
    'Pos Mitra Pasar Klewer',
    'Pos Mitra Jebres Stasiun'
  ];

  const handlePrintPDF = () => {
    window.print();
  };

  const filteredReports = reportList.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = selectedPos === 'Semua Pos' || item.posName === selectedPos;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8 print:p-0 print:bg-white">
      {/* CSS Khusus Print untuk Mengatur Posisi dan Lebar Kertas PDF secara Sempurna */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body, html, #root {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: white !important;
          }
          /* Sembunyikan elemen navigasi, sidebar, dan tombol aksi */
          aside, nav, header, button, .print\\:hidden {
            display: none !important;
          }
          /* Pastikan kontainer utama mengambil lebar penuh tanpa offset margin kiri */
          div[class*="min-h-screen"] {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            background: white !important;
          }
          /* Perataan grid ringkasan saat dicetak */
          .grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
          }
          /* Styling kartu ringkasan dan tabel untuk cetak */
          .bg-white {
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            padding: 12px !important;
          }
          table {
            width: 100% !important;
            table-layout: auto !important;
          }
          th, td {
            white-space: normal !important;
            word-break: break-word !important;
            padding: 8px 6px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Header Banner (Disembunyikan saat cetak) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5" /> Laporan Finansial & Pendapatan
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Manajemen Laporan Keuangan Wilayah</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Pantau arus kas, pendapatan total trip, komisi regional, dan cetak laporan keuangan operasional ke PDF.</p>
        </div>

        <button 
          onClick={handlePrintPDF}
          className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan ke PDF
        </button>
      </div>

      {/* Judul Khusus Dokumen Cetak */}
      <div className="hidden print:block mb-4 border-b border-neutral-300 pb-3">
        <h1 className="text-base font-extrabold text-neutral-900">Laporan Finansial & Pendapatan Wilayah</h1>
        <p className="text-[11px] text-neutral-600 mt-0.5">Wilayah: Solo Raya | Filter Pos: {selectedPos} | Dicetak: 19 Agu 2026</p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-3">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between print:border print:border-neutral-300 print:shadow-none print:p-3 print:rounded-xl">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Total Pendapatan Wilayah</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 print:text-sm">Rp 155.000</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 print:hidden">
              <ArrowUpRight className="w-3 h-3" /> +12.4% minggu ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center print:hidden">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between print:border print:border-neutral-300 print:shadow-none print:p-3 print:rounded-xl">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Total Komisi Regional (15%)</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 print:text-sm">Rp 23.250</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 print:hidden">
              <ArrowUpRight className="w-3 h-3" /> +8.1% minggu ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center print:hidden">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between print:border print:border-neutral-300 print:shadow-none print:p-3 print:rounded-xl">
          <div>
            <p className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">Total Transaksi Selesai</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 print:text-sm">4 Pos Aktif</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 print:hidden">
              <CheckCircle2 className="w-3 h-3" /> 100% Valid
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center print:hidden">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 print:border print:border-neutral-300 print:shadow-none print:p-3 print:rounded-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 print:hidden">
          <h2 className="text-base font-extrabold text-neutral-900">Riwayat Transaksi & Finansial Pos</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cari ID transaksi, layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 transition"
              />
            </div>

            {/* Filter Pos */}
            <select 
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-700 focus:outline-none focus:border-purple-600 transition cursor-pointer"
            >
              {posOptions.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed print:table-auto">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 font-extrabold uppercase tracking-wider print:border-neutral-300">
                <th className="py-4 px-3 w-[16%] print:w-[16%]">ID TRX & WAKTU</th>
                <th className="py-4 px-3 w-[22%] print:w-[22%]">POS ASAL TRANSAKSI</th>
                <th className="py-4 px-3 w-[16%] print:w-[16%]">LAYANAN</th>
                <th className="py-4 px-3 w-[13%] print:w-[13%]">TOTAL TARIF</th>
                <th className="py-4 px-3 w-[13%] print:w-[13%]">KOMISI</th>
                <th className="py-4 px-3 w-[20%] text-right print:text-left print:w-[20%]">STATUS & DETAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-neutral-700 font-medium print:divide-neutral-200">
              {filteredReports.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedStatusDetail(item)}
                  className="hover:bg-neutral-50/60 transition group cursor-pointer">
                  <td className="py-4 px-3 truncate print:whitespace-normal">
                    <p className="font-extrabold text-neutral-900 group-hover:text-purple-700 transition">{item.id}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">{item.date}</p>
                  </td>
                  <td className="py-4 px-3 truncate print:whitespace-normal font-bold text-neutral-800">{item.posName}</td>
                  <td className="py-4 px-3 truncate print:whitespace-normal font-semibold text-neutral-600">{item.serviceType}</td>
                  <td className="py-4 px-3 truncate print:whitespace-normal font-extrabold text-neutral-900">{item.amount}</td>
                  <td className="py-4 px-3 truncate print:whitespace-normal font-extrabold text-purple-700">{item.commission}</td>
                  <td className="py-4 px-3 text-right truncate print:whitespace-normal print:text-left">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-3 py-1.5 rounded-full print:bg-transparent print:p-0 print:text-emerald-800 group-hover:bg-emerald-100 transition">
                      <CheckCircle2 className="w-3 h-3 shrink-0 print:hidden" /> Lunas & Tervalidasi
                    </span>
                    <span className="block text-[9px] text-purple-600 font-bold mt-1 print:hidden opacity-0 group-hover:opacity-100 transition">
                      Klik untuk detail
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Status Transaksi */}
      {selectedStatusDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">Detail Status Transaksi: {selectedStatusDetail.id}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Informasi lengkap verifikasi & metode pembayaran.</p>
              </div>
              <button onClick={() => setSelectedStatusDetail(null)} className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">ID Trip Terkait:</span>
                  <span className="text-neutral-800 font-bold">{selectedStatusDetail.tripId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Metode Pembayaran:</span>
                  <span className="text-purple-700 font-extrabold">{selectedStatusDetail.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Waktu Transaksi:</span>
                  <span className="text-neutral-800 font-bold">{selectedStatusDetail.date}</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Catatan Verifikasi & Settlement</span>
                <p className="text-neutral-700 font-medium leading-relaxed">{selectedStatusDetail.statusDetail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedStatusDetail(null)}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition cursor-pointer shadow-md"
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