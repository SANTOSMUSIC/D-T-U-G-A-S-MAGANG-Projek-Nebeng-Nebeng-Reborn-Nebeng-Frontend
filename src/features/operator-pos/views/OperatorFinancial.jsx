import { useState } from 'react';
import { FileText, DollarSign, Printer, Wallet, QrCode } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function OperatorFinancial() {
  const [dailyTransactions] = useState([
    { id: 'TRX-001', amount: 80000, type: 'Ride', method: 'Tunai', time: '09:15 WIB' },
    { id: 'TRX-002', amount: 45000, type: 'Parcel', method: 'QRIS', time: '10:00 WIB' },
    { id: 'TRX-003', amount: 30000, type: 'Ride', method: 'Tunai', time: '11:20 WIB' }
  ]);

  const totalRevenue = dailyTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const cashTotal = dailyTransactions.filter(t => t.method === 'Tunai').reduce((acc, curr) => acc + curr.amount, 0);
  const qrisTotal = dailyTransactions.filter(t => t.method === 'QRIS').reduce((acc, curr) => acc + curr.amount, 0);
  const regionalCommission = Math.round(totalRevenue * 0.15);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] print:p-0 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body, html { background: white !important; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <FileText className="w-3 h-3" /> REKAPITULASI KAS & PENDAPATAN POS
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Laporan Finansial Pos Terminal
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Kelola setoran tunai harian, rekonsiliasi kasir, dan pantau pendapatan total pos.
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-[#4B2172] hover:bg-[#3a1a59] text-white px-4 py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer shrink-0 print-hidden"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak Laporan Shift
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="TOTAL PENDAPATAN POS"
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          subtitle={`${dailyTransactions.length} transaksi hari ini`}
          icon={DollarSign}
        />
        <StatCard
          title="KAS FISIK DI LACI (TUNAI)"
          value={`Rp ${cashTotal.toLocaleString('id-ID')}`}
          subtitle={`QRIS Non-Tunai: Rp ${qrisTotal.toLocaleString('id-ID')}`}
          icon={Wallet}
        />
        <StatCard
          title="SETORAN REGIONAL (15%)"
          value={`Rp ${regionalCommission.toLocaleString('id-ID')}`}
          subtitle="Potongan otomatis sistem"
          icon={FileText}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 space-y-4">
        <h2 className="text-[14px] font-bold text-neutral-800">Rincian Transaksi Shift Aktif</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">ID TRX & WAKTU</th>
                <th className="py-3 px-4">LAYANAN POS</th>
                <th className="py-3 px-4">METODE PEMBAYARAN</th>
                <th className="py-3 px-4 text-right">TOTAL NOMINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-[9px]">
              {dailyTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-neutral-50/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-neutral-800 font-mono text-[10px]">{trx.id}</p>
                    <p className="text-[8px] text-neutral-400">{trx.time}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-700">{trx.type}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge variant={trx.method === 'Tunai' ? 'emerald' : 'purple'}>
                      {trx.method === 'Tunai' ? <Wallet size={10} className="mr-1 inline" /> : <QrCode size={10} className="mr-1 inline" />}
                      {trx.method}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-neutral-800">
                    Rp {trx.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}