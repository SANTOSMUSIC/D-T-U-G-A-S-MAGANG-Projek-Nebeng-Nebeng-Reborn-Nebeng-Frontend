import { useState } from 'react';
import { useSimulatedLoading } from '../../../hooks/useSimulatedLoading';
import { 
  ShieldCheck, 
  Wallet, 
  Search, 
  Printer,
  Lock,
  Unlock,
  X,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import { SkeletonTableRows } from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function AuditFinancialReport() {
  const [activeTab, setActiveTab] = useState('escrow');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unmaskedBankIds, setUnmaskedBankIds] = useState({});

  const toggleBankMask = (id) => {
    setUnmaskedBankIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskBankAccount = (bankStr) => {
    const parts = bankStr.split('-');
    if (parts.length < 2) return bankStr;
    const bankName = parts[0].trim();
    const accNum = parts[1].trim();
    return `${bankName} - ****${accNum.slice(-4)}`;
  };

  const [escrowLedger] = useState([
    { id: "ESC-9081", orderId: "ORD-8821", client: "Rian Pratama", amount: "Rp 150.000", type: "Ride Service", status: "Held", time: "19 Agu 2026, 09:30", note: "Dana ditahan di escrow menunggu perjalanan selesai" },
    { id: "ESC-9080", orderId: "ORD-8820", client: "Siti Aminah", amount: "Rp 75.000", type: "Parcel Delivery", status: "Released", time: "19 Agu 2026, 09:15", note: "Dana dicairkan ke kurir setelah paket diterima" },
    { id: "ESC-9079", orderId: "ORD-8819", client: "Joko Anwar", amount: "Rp 320.000", type: "Car Rental / Ride", status: "Released", time: "19 Agu 2026, 08:45", note: "Dana dicairkan ke driver" },
    { id: "ESC-9078", orderId: "ORD-8818", client: "Dewi Sartika", amount: "Rp 45.000", type: "Parcel Delivery", status: "Held", time: "19 Agu 2026, 08:20", note: "Dana ditahan dalam sistem pengiriman aktif" }
  ]);

  const [withdrawals] = useState([
    { id: "WD-5012", partnerName: "Ahmad Driver", partnerType: "Driver Motor", bank: "BCA - 1234567890", amount: "Rp 1.250.000", status: "Success", time: "19 Agu 2026, 07:30" },
    { id: "WD-5011", partnerName: "Sari Logistics Hub", partnerType: "Merchant / Hub", bank: "Mandiri - 0987654321", amount: "Rp 4.500.000", status: "Pending", time: "18 Agu 2026, 21:00" },
    { id: "WD-5010", partnerName: "Dani Mobil", partnerType: "Driver Mobil", bank: "BNI - 1122334455", amount: "Rp 850.000", status: "Success", time: "18 Agu 2026, 18:45" },
    { id: "WD-5009", partnerName: "Eko Kurir", partnerType: "Driver Motor", bank: "BRI - 5544332211", amount: "Rp 600.000", status: "Failed", time: "18 Agu 2026, 15:20" }
  ]);

  const filteredEscrow = escrowLedger.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = withdrawals.filter(item => {
    const matchesSearch = item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoadingLedger = useSimulatedLoading([activeTab, searchTerm, statusFilter], 700);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div id="printable-report" className="space-y-6 print:bg-white">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-none print:p-0 print:mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 print-hidden">
              <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172]">
                AUDIT LEDGER & FINANCIAL REPORTING
              </span>
            </div>
            <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">Audit Keuangan & Arus Kas</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Pantau arus kas Escrow System serta riwayat penarikan saldo mitra.</p>
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
            title="ESCROW HELD (DITAHAN)"
            value="Rp 195.000"
            subtitle="Menunggu penyelesaian trip"
            icon={Lock}
          />
          <StatCard
            title="ESCROW RELEASED (CAIR)"
            value="Rp 485.000"
            subtitle="Berhasil ditransfer ke mitra"
            icon={Unlock}
          />
          <StatCard
            variant="primary"
            title="TOTAL WITHDRAWAL MITRA"
            value="Rp 7.200.000"
            subtitle="Periode Bulan Agustus 2026"
            icon={Wallet}
          />
        </div>

        {/* Tab & Bar Pencarian / Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print-hidden">
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full w-fit">
            <button
              onClick={() => { setActiveTab('escrow'); setStatusFilter('All'); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'escrow' ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <ShieldCheck size={13} />
              Arus Kas Escrow System
            </button>
            <button
              onClick={() => { setActiveTab('withdrawal'); setStatusFilter('All'); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'withdrawal' ? 'bg-white text-[#4B2172] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Wallet size={13} />
              Penarikan Saldo (Withdrawal)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={activeTab === 'escrow' ? "Cari ID, order, atau klien..." : "Cari mitra, ID, atau bank..."}
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
              {activeTab === 'escrow' ? (
                <>
                  <option value="Held">Held (Ditahan)</option>
                  <option value="Released">Released (Dicairkan)</option>
                </>
              ) : (
                <>
                  <option value="Success">Success (Berhasil)</option>
                  <option value="Pending">Pending (Menunggu)</option>
                  <option value="Failed">Failed (Gagal)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {activeTab === 'escrow' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              {/* Card View Khusus Layar HP */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {isLoadingLedger ? (
                  <div className="p-4"><SkeletonTableRows rows={3} columns={1} /></div>
                ) : filteredEscrow.length > 0 ? (
                  filteredEscrow.map((item) => (
                    <div key={item.id} className="p-4 space-y-2 text-[10px]">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-neutral-800 font-mono">{item.id}</span>
                          <span className="text-[8px] font-bold text-[#4B2172] font-mono block">{item.orderId}</span>
                        </div>
                        <StatusBadge variant={item.status === 'Held' ? 'amber' : 'emerald'}>
                          {item.status}
                        </StatusBadge>
                      </div>
                      <div className="flex justify-between items-center text-neutral-700">
                        <span className="font-bold">{item.client} ({item.type})</span>
                        <span className="font-bold text-neutral-900">{item.amount}</span>
                      </div>
                      <p className="text-[8px] text-neutral-400">{item.time} • {item.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4"><EmptyState icon={ShieldCheck} title="Ledger Escrow Tidak Ditemukan" description="Tidak ada transaksi escrow yang cocok." /></div>
                )}
              </div>

              {/* Tabel Layar Tablet & Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-5">ID Ledger & Pesanan</th>
                      <th className="py-3 px-5">Klien / Layanan</th>
                      <th className="py-3 px-5">Nominal Transaksi</th>
                      <th className="py-3 px-5">Status Escrow</th>
                      <th className="py-3 px-5">Waktu & Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[9px]">
                    {isLoadingLedger ? (
                      <SkeletonTableRows rows={4} columns={5} />
                    ) : filteredEscrow.length > 0 ? (
                      filteredEscrow.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-neutral-800 font-mono text-[10px]">{item.id}</div>
                            <div className="text-[8px] font-bold text-[#4B2172] font-mono">{item.orderId}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-neutral-800">{item.client}</div>
                            <div className="text-[8px] text-neutral-400">{item.type}</div>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-neutral-800">{item.amount}</td>
                          <td className="py-3.5 px-5">
                            <StatusBadge variant={item.status === 'Held' ? 'amber' : 'emerald'}>
                              {item.status}
                            </StatusBadge>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-neutral-700">{item.time}</div>
                            <div className="text-[8px] text-neutral-400">{item.note}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <EmptyState icon={ShieldCheck} title="Ledger Escrow Tidak Ditemukan" description="Tidak ada transaksi escrow yang cocok." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              {/* Card View Khusus Layar HP */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {isLoadingLedger ? (
                  <div className="p-4"><SkeletonTableRows rows={3} columns={1} /></div>
                ) : filteredWithdrawals.length > 0 ? (
                  filteredWithdrawals.map((item) => {
                    const isUnmasked = unmaskedBankIds[item.id];
                    return (
                      <div key={item.id} className="p-4 space-y-2 text-[10px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-neutral-800">{item.partnerName}</span>
                            <span className="text-[8px] font-bold text-[#4B2172] font-mono block">{item.id}</span>
                          </div>
                          <StatusBadge variant={item.status === 'Success' ? 'emerald' : item.status === 'Pending' ? 'amber' : 'rose'}>
                            {item.status}
                          </StatusBadge>
                        </div>
                        <div className="flex justify-between items-center text-neutral-700 font-mono">
                          <span>{isUnmasked ? item.bank : maskBankAccount(item.bank)}</span>
                          <button onClick={() => toggleBankMask(item.id)} className="p-1 bg-neutral-100 rounded text-neutral-600">
                            {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400 text-[8px]">{item.time}</span>
                          <span className="font-bold text-neutral-900">{item.amount}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4"><EmptyState icon={Wallet} title="Riwayat Penarikan Tidak Ditemukan" description="Tidak ada riwayat penarikan saldo mitra yang cocok." /></div>
                )}
              </div>

              {/* Tabel Layar Tablet & Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-neutral-400 text-[9px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-5">ID & Nama Mitra</th>
                      <th className="py-3 px-5">Jenis Kemitraan</th>
                      <th className="py-3 px-5">Rekening Tujuan (Protected)</th>
                      <th className="py-3 px-5">Jumlah Penarikan</th>
                      <th className="py-3 px-5">Status Transfer</th>
                      <th className="py-3 px-5 text-right">Waktu Request</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[9px]">
                    {isLoadingLedger ? (
                      <SkeletonTableRows rows={4} columns={6} />
                    ) : filteredWithdrawals.length > 0 ? (
                      filteredWithdrawals.map((item) => {
                        const isUnmasked = unmaskedBankIds[item.id];
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-bold text-neutral-800 text-[10px]">{item.partnerName}</div>
                              <div className="text-[8px] font-bold text-[#4B2172] font-mono">{item.id}</div>
                            </td>
                            <td className="py-3.5 px-5 font-semibold text-neutral-700">{item.partnerType}</td>
                            <td className="py-3.5 px-5 font-mono text-neutral-700">
                              <div className="flex items-center gap-2">
                                <span>{isUnmasked ? item.bank : maskBankAccount(item.bank)}</span>
                                <button
                                  onClick={() => toggleBankMask(item.id)}
                                  className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer"
                                  title="Tampilkan Rekening Lengkap"
                                >
                                  {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-bold text-neutral-800">{item.amount}</td>
                            <td className="py-3.5 px-5">
                              <StatusBadge variant={item.status === 'Success' ? 'emerald' : item.status === 'Pending' ? 'amber' : 'rose'}>
                                {item.status}
                              </StatusBadge>
                            </td>
                            <td className="py-3.5 px-5 text-right font-medium text-neutral-400">{item.time}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <EmptyState icon={Wallet} title="Riwayat Penarikan Tidak Ditemukan" description="Tidak ada riwayat penarikan saldo mitra yang cocok." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}