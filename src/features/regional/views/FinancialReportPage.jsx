import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { Printer, Search, FileText } from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function FinancialReportPage() {
  const [reportList] = useState([
    {
      id: 'TRX-8801',
      tripId: 'TRIP-9081',
      posName: 'Pos Mitra Solo Grand Mall',
      serviceType: 'Ride / Transportasi',
      amount: 'Rp 35.000',
      commission: 'Rp 5.250',
      status: 'Lunas / Selesai',
      statusDetail: 'Pembayaran tunai diverifikasi oleh Operator Pos. Dana masuk ke Escrow Regional.',
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
      statusDetail: 'Pembayaran QRIS tervalidasi gateway. Komisi regional langsung terpotong sistem.',
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
      statusDetail: 'Pembayaran tunai diverifikasi oleh Operator Pos Pasar Klewer.',
      date: '19 Agu 2026, 07:45',
      paymentMethod: 'Tunai di Pos'
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

  const filteredReports = reportList.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = selectedPos === 'Semua Pos' || item.posName === selectedPos;
    return matchesSearch && matchesPos;
  });

  const isLoadingReports = useSimulatedLoading([searchQuery, selectedPos], 700);

  const parseCurrency = (str) => parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  
  const totalRevenue = filteredReports.reduce((sum, item) => sum + parseCurrency(item.amount), 0);
  const totalCommission = filteredReports.reduce((sum, item) => sum + parseCurrency(item.commission), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] print:p-0 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body, html, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
          aside, nav, header, button, .print-hidden { display: none !important; }
          .bg-white { border: 1px solid #d1d5db !important; shadow: none !important; padding: 12px !important; }
        }
      `}</style>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              LAPORAN FINANSIAL & PENDAPATAN
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Laporan Keuangan Wilayah</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Pantau arus kas, total trip, komisi regional, dan cetak ke PDF.</p>
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0 print-hidden"
        >
          <Printer size={14} />
          <span>Cetak PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:grid-cols-3">
        <StatCard
          title="TOTAL PENDAPATAN WILAYAH"
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          subtitle={`${filteredReports.length} transaksi terfilter`}
        />
        <StatCard
          title="KOMISI REGIONAL (15%)"
          value={`Rp ${totalCommission.toLocaleString('id-ID')}`}
          subtitle="Potongan komisi otomatis"
        />
        <StatCard
          title="TRANSAKSI TERFILTER"
          value={`${filteredReports.length} Transaksi`}
          subtitle="Status 100% Valid"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 print-hidden">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari ID transaksi, layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-8 py-2 text-[10px] sm:text-[11px] font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] transition"
          />
        </div>

        <select 
          value={selectedPos}
          onChange={(e) => setSelectedPos(e.target.value)}
          className="bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
        >
          {posOptions.map((pos, idx) => (
            <option key={idx} value={pos}>{pos}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {isLoadingReports ? (
            <div className="p-4 space-y-3">
              <SkeletonTableRows rows={3} columns={1} />
            </div>
          ) : filteredReports.length > 0 ? (
            filteredReports.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedStatusDetail(item)}
                className="p-4 space-y-2 text-[10px] cursor-pointer hover:bg-neutral-50/80 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 font-mono">{item.id}</span>
                    <span className="text-[8px] text-neutral-400 block">{item.date}</span>
                  </div>
                  <StatusBadge variant="emerald">{item.status}</StatusBadge>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{item.posName}</span>
                  <span className="font-bold text-neutral-800">{item.amount}</span>
                </div>
                <div className="flex justify-between text-[8px] text-neutral-400 pt-1 border-t border-dashed border-neutral-100">
                  <span>{item.serviceType}</span>
                  <span className="font-bold text-[#4B2172]">Komisi: {item.commission}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState icon={FileText} title="Transaksi Tidak Ditemukan" description="Tidak ada transaksi yang cocok." />
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">ID TRX & Waktu</th>
                <th className="py-3 px-5">Pos Asal</th>
                <th className="py-3 px-5">Layanan</th>
                <th className="py-3 px-5">Total Tarif</th>
                <th className="py-3 px-5">Komisi (15%)</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[9px]">
              {isLoadingReports ? (
                <SkeletonTableRows rows={3} columns={6} />
              ) : filteredReports.length > 0 ? (
                filteredReports.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedStatusDetail(item)} className="hover:bg-gray-50/50 transition cursor-pointer">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-neutral-800 font-mono text-[10px]">{item.id}</div>
                      <div className="text-[8px] text-neutral-400">{item.date}</div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">{item.posName}</td>
                    <td className="py-3.5 px-5 font-semibold text-neutral-700">{item.serviceType}</td>
                    <td className="py-3.5 px-5 font-bold text-neutral-800">{item.amount}</td>
                    <td className="py-3.5 px-5 font-bold text-[#4B2172]">{item.commission}</td>
                    <td className="py-3.5 px-5 text-right">
                      <StatusBadge variant="emerald">{item.status}</StatusBadge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyState icon={FileText} title="Transaksi Tidak Ditemukan" description="Tidak ada transaksi yang cocok." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={Boolean(selectedStatusDetail)}
        onClose={() => setSelectedStatusDetail(null)}
        title={`Detail Transaksi: ${selectedStatusDetail?.id}`}
        subtitle={`Metode: ${selectedStatusDetail?.paymentMethod}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-3 text-[10px]">
          <div><strong>ID Trip:</strong> {selectedStatusDetail?.tripId}</div>
          <div><strong>Metode Pembayaran:</strong> {selectedStatusDetail?.paymentMethod}</div>
          <div><strong>Catatan Settlement:</strong> {selectedStatusDetail?.statusDetail}</div>
          <button onClick={() => setSelectedStatusDetail(null)} className="w-full py-2 bg-[#4B2172] text-white text-[10px] font-bold rounded-full cursor-pointer mt-2">Tutup</button>
        </div>
      </BaseModal>
    </div>
  );
}