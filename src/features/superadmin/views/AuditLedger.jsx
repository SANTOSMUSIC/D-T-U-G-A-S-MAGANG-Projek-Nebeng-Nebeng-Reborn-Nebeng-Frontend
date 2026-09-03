import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Search, 
  Printer,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getEscrowLedgerData } from '../../../services/auditService';

export default function AuditFinancialReport() {
  const [activeTab, setActiveTab] = useState('escrow');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // State Paginasi Ledger
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);

  // Murni data dari backend
  const [escrowLedger, setEscrowLedger] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalHeldEscrow: 0,
    totalReleasedEscrow: 0,
    totalTransactions: 0
  });
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAuditData() {
      try {
        setIsLoadingLedger(true);
        const res = await getEscrowLedgerData(currentPage, 20);
        if (isMounted && res) {
          const held = Number(res.totalHeldEscrow || 0);
          const released = Number(res.totalReleasedEscrow || 0);

          setFinancialStats({
            totalHeldEscrow: held,
            totalReleasedEscrow: released,
            totalTransactions: held + released
          });
          
          if (res.pagination) {
            setPaginationMeta(res.pagination);
          }
          
          // Memetakan transaksi murni dari backend database NestJS
          const rawTransactions = res.recentTransactions || res.transactions || [];
          const mappedLedger = rawTransactions.map((tx) => ({
            id: `ESC-${String(tx.id).padStart(4, '0')}`,
            orderId: tx.orderId ? `ORD-${String(tx.orderId)}` : 'SYS-TX',
            client: tx.reference || 'Sistem Escrow',
            amount: `Rp ${Number(tx.amount || 0).toLocaleString('id-ID')}`,
            type: tx.type === 'escrow_hold' ? 'Escrow Held' : 'Escrow Release',
            status: tx.type === 'escrow_hold' ? 'Held' : 'Released',
            time: new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
            note: tx.description || 'Pencatatan ledger otomatis dari database'
          }));

          setEscrowLedger(mappedLedger);
        }
      } catch (err) {
        console.error('Gagal memuat data audit keuangan dari backend:', err);
      } finally {
        if (isMounted) {
          setIsLoadingLedger(false);
        }
      }
    }

    loadAuditData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const filteredEscrow = escrowLedger.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] print:p-0 print:max-w-none print:bg-white">
      
      {/* KOP LAPORAN RESMI KHUSUS CETAK (PDF) */}
      <div className="hidden print:block pb-6 mb-6 border-b-2 border-neutral-800 text-center space-y-1">
        <h2 className="text-[20px] font-extrabold uppercase tracking-wider text-neutral-900">NEBENG TRANSPORT & LOGISTICS</h2>
        <p className="text-[11px] font-semibold text-neutral-600">Laporan Resmi Audit Keuangan & Arus Kas Escrow Sistem</p>
        <p className="text-[9px] text-neutral-500">Dicetak pada: {new Date().toLocaleString('id-ID')} • Status: Dokumen Resmi Terverifikasi Superadmin</p>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-none print:p-0 print:mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 print:hidden">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
              AUDIT LEDGER & FINANCIAL REPORTING
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800 print:text-neutral-900">Audit Keuangan & Arus Kas</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 print:text-neutral-600">Pantau arus kas Escrow System secara langsung dari database sistem.</p>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4B2172] hover:bg-[#3b195a] text-white rounded-full text-[10px] sm:text-[11px] font-bold transition cursor-pointer shadow-sm shrink-0 print:hidden"
        >
          <Printer size={14} />
          <span>Cetak Laporan PDF</span>
        </button>
      </div>

      {/* 3 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:grid-cols-3">
        <StatCard
          title="ESCROW HELD (DITAHAN)"
          value={`Rp ${Number(financialStats.totalHeldEscrow).toLocaleString('id-ID')}`}
          subtitle="Menunggu penyelesaian trip"
          icon={Lock}
        />
        <StatCard
          title="ESCROW RELEASED (CAIR)"
          value={`Rp ${Number(financialStats.totalReleasedEscrow).toLocaleString('id-ID')}`}
          subtitle="Berhasil ditransfer ke mitra"
          icon={Unlock}
        />
        <StatCard
          variant="primary"
          title="TOTAL VOLUME LEDGER"
          value={`Rp ${Number(financialStats.totalTransactions).toLocaleString('id-ID')}`}
          subtitle="Akumulasi total nilai transaksi"
          icon={Wallet}
        />
      </div>

      {/* TAB & FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full w-fit">
          <button
            onClick={() => { setActiveTab('escrow'); setStatusFilter('All'); }}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'escrow' ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <ShieldCheck size={13} />
            Arus Kas Escrow System (Backend)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari ID, order, atau referensi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-full pl-9 pr-8 py-1.5 text-[10px] font-medium text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B2172]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-neutral-200 rounded-full px-3 py-1.5 text-[10px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#4B2172] cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Held">Held (Ditahan)</option>
            <option value="Released">Released (Dicairkan)</option>
          </select>
        </div>
      </div>

      {/* TABEL UTAMA ESCROW */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden print:border print:shadow-none print:rounded-none">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse print:text-black">
              <thead>
                <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold print:bg-neutral-100 print:text-neutral-800">
                  <th className="py-3 px-5 border-b print:border-neutral-300">ID Ledger & Pesanan</th>
                  <th className="py-3 px-5 border-b print:border-neutral-300">Referensi / Klien</th>
                  <th className="py-3 px-5 border-b print:border-neutral-300">Nominal Transaksi</th>
                  <th className="py-3 px-5 border-b print:border-neutral-300">Status Escrow</th>
                  <th className="py-3 px-5 border-b print:border-neutral-300">Waktu & Catatan Database</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[9px] print:divide-neutral-200">
                {isLoadingLedger ? (
                  <SkeletonTableRows rows={4} columns={5} />
                ) : filteredEscrow.length > 0 ? (
                  filteredEscrow.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 font-mono text-[10px] print:text-neutral-900">{item.id}</div>
                        <div className="text-[8px] font-bold text-[#4B2172] font-mono print:text-neutral-600">{item.orderId}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-800 print:text-neutral-900">{item.client}</div>
                        <div className="text-[8px] text-neutral-400 print:text-neutral-500">{item.type}</div>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-neutral-800 print:text-neutral-900">{item.amount}</td>
                      <td className="py-3.5 px-5">
                        <StatusBadge variant={item.status === 'Held' ? 'amber' : 'emerald'}>
                          {item.status}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-neutral-700 print:text-neutral-900">{item.time}</div>
                        <div className="text-[8px] text-neutral-400 print:text-neutral-600">{item.note}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <EmptyState icon={ShieldCheck} title="Ledger Escrow Kosong" description="Belum ada catatan transaksi escrow dari database." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bar Navigasi Paginasi Ledger */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-neutral-50/50 border-t border-neutral-200 text-[10px] print:hidden">
              <span className="text-neutral-500">
                Halaman <strong>{paginationMeta.currentPage}</strong> dari <strong>{paginationMeta.totalPages}</strong> (Total: {paginationMeta.totalData} Transaksi)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage >= paginationMeta.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-white border border-neutral-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TANDA TANGAN / OTORITAS RESMI KHUSUS CETAK PDF */}
      <div className="hidden print:flex justify-between pt-12 mt-12 text-[10px] text-neutral-800">
        <div className="text-center space-y-12">
          <p>Mengetahui,</p>
          <p className="font-bold underline">Direktur Keuangan & Operasional</p>
        </div>
        <div className="text-center space-y-12">
          <p>Surakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold underline">Superadmin Sistem Escrow</p>
        </div>
      </div>

    </div>
  );
}