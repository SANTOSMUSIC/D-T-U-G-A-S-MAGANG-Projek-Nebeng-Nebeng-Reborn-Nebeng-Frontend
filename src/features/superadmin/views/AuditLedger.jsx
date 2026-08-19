import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Printer, 
  FileText,
  Lock,
  Unlock,
  Building2,
  Bike
} from 'lucide-react';

export default function AuditFinancialReport() {
  const [activeTab, setActiveTab] = useState('escrow'); // 'escrow' atau 'withdrawal'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock Data: Laporan Arus Kas Escrow System (Dana Ditahan vs Dana Cair)
  const [escrowLedger, setEscrowLedger] = useState([
    { id: "ESC-9081", orderId: "ORD-8821", client: "Rian Pratama", amount: "Rp 150.000", type: "Ride Service", status: "Held", time: "19 Agu 2026, 09:30", note: "Dana ditahan di escrow menunggu perjalanan selesai" },
    { id: "ESC-9080", orderId: "ORD-8820", client: "Siti Aminah", amount: "Rp 75.000", type: "Parcel Delivery", status: "Released", time: "19 Agu 2026, 09:15", note: "Dana dicairkan ke kurir setelah paket diterima" },
    { id: "ESC-9079", orderId: "ORD-8819", client: "Joko Anwar", amount: "Rp 320.000", type: "Car Rental / Ride", status: "Released", time: "19 Agu 2026, 08:45", note: "Dana dicairkan ke driver" },
    { id: "ESC-9078", orderId: "ORD-8818", client: "Dewi Sartika", amount: "Rp 45.000", type: "Parcel Delivery", status: "Held", time: "19 Agu 2026, 08:20", note: "Dana ditahan dalam sistem pengiriman aktif" },
    { id: "ESC-9077", orderId: "ORD-8817", client: "Bambang Pamungkas", amount: "Rp 90.000", type: "Ride Service", status: "Released", time: "19 Agu 2026, 08:00", note: "Dana dicairkan otomatis" }
  ]);

  // Mock Data: Riwayat Penarikan Saldo (Withdrawal) oleh Mitra
  const [withdrawals, setWithdrawals] = useState([
    { id: "WD-5012", partnerName: "Ahmad Driver", partnerType: "Driver Motor", bank: "BCA - 1234567890", amount: "Rp 1.250.000", status: "Success", time: "19 Agu 2026, 07:30" },
    { id: "WD-5011", partnerName: "Sari Logistics Hub", partnerType: "Merchant / Hub", bank: "Mandiri - 0987654321", amount: "Rp 4.500.000", status: "Pending", time: "18 Agu 2026, 21:00" },
    { id: "WD-5010", partnerName: "Dani Mobil", partnerType: "Driver Mobil", bank: "BNI - 1122334455", amount: "Rp 850.000", status: "Success", time: "18 Agu 2026, 18:45" },
    { id: "WD-5009", partnerName: "Eko Kurir", partnerType: "Driver Motor", bank: "BRI - 5544332211", amount: "Rp 600.000", status: "Failed", time: "18 Agu 2026, 15:20" }
  ]);

  // Filter Escrow
  const filteredEscrow = escrowLedger.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter Withdrawal
  const filteredWithdrawals = withdrawals.filter(item => {
    const matchesSearch = item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="p-8 pt-10 space-y-8 bg-[#f8f9fa] min-h-screen">
      {/* CSS Khusus Print: Menyembunyikan segalanya di luar area laporan saat dicetak */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0px;
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* KONTEN UTAMA YANG AKAN DICETAK */}
      <div id="printable-report" className="space-y-8 bg-[#f8f9fa] print:bg-white">
        
        {/* Header Halaman */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 print-hidden">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700">
                AUDIT LEDGER & FINANCIAL REPORTING
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Audit Keuangan & Arus Kas</h1>
            <p className="text-xs text-gray-500 mt-0.5">Pantau arus kas Escrow System (dana ditahan vs cair) serta riwayat penarikan saldo mitra.</p>
          </div>
          
          <button 
            onClick={handlePrintPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm shadow-purple-200 cursor-pointer print-hidden"
          >
            <Printer size={16} />
            Cetak Laporan PDF
          </button>
        </div>

        {/* Statistik Ringkas Keuangan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 print:border print:border-gray-200 print:p-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl print-hidden">
              <Lock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Dana Ditahan (Escrow Held)</span>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Rp 195.000</h3>
              <span className="text-[11px] font-bold text-amber-600">Menunggu penyelesaian pesanan</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 print:border print:border-gray-200 print:p-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl print-hidden">
              <Unlock size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Dana Cair (Escrow Released)</span>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Rp 485.000</h3>
              <span className="text-[11px] font-bold text-emerald-600">Berhasil ditransfer ke penyedia</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 print:border print:border-gray-200 print:p-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl print-hidden">
              <Wallet size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total Withdrawal Mitra</span>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Rp 7.200.000</h3>
              <span className="text-[11px] font-bold text-purple-600">Bulan berjalan (Agustus 2026)</span>
            </div>
          </div>
        </div>

        {/* Navigasi Tab Utama (Disembunyikan saat cetak) */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-fit print-hidden">
          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'escrow' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck size={16} />
            Arus Kas Escrow System
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'withdrawal' 
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Wallet size={16} />
            Riwayat Penarikan Saldo (Withdrawal) Mitra
          </button>
        </div>

        {/* KONTEN TAB 1: ESCROW SYSTEM */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            {/* Bar Pencarian (Disembunyikan saat cetak) */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between gap-4 print-hidden">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari ID Escrow, ID Pesanan, atau Nama Klien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div className="text-xs font-bold text-gray-400 px-4">
                Menampilkan: <span className="text-gray-900">{filteredEscrow.length} Transaksi Escrow</span>
              </div>
            </div>

            {/* Tabel Escrow */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border print:border-gray-200 print:shadow-none">
              <div className="p-4 bg-gray-50 font-black text-xs text-gray-800 border-b border-gray-100 hidden print:block">
                LAPORAN ARUS KAS ESCROW SYSTEM
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold print:bg-gray-100 print:text-gray-700">
                      <th className="py-4 px-6">ID Ledger & Pesanan</th>
                      <th className="py-4 px-6">Klien / Layanan</th>
                      <th className="py-4 px-6">Nominal Transaksi</th>
                      <th className="py-4 px-6">Status Escrow (Ditahan vs Cair)</th>
                      <th className="py-4 px-6">Waktu & Catatan Sistem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredEscrow.length > 0 ? (
                      filteredEscrow.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900 font-mono">{item.id}</div>
                            <div className="text-[11px] font-bold text-purple-600 font-mono">{item.orderId}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-800">{item.client}</div>
                            <div className="text-[11px] text-gray-400 font-bold">{item.type}</div>
                          </td>
                          <td className="py-4 px-6 text-xs font-black text-gray-900">
                            {item.amount}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                              item.status === 'Held' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Held' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                              {item.status === 'Held' ? 'Dana Ditahan (Held)' : 'Dana Cair (Released)'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-xs font-bold text-gray-700">{item.time}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{item.note}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                          Tidak ada data ledger escrow ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB 2: WITHDRAWAL MITRA */}
        {activeTab === 'withdrawal' && (
          <div className="space-y-6">
            {/* Bar Pencarian & Filter Status (Disembunyikan saat cetak) */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 print-hidden">
              <div className="relative flex-1 w-full max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama mitra, ID withdrawal, atau bank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-purple-500 transition cursor-pointer"
                >
                  <option value="All">Semua Status</option>
                  <option value="Success">Success (Berhasil)</option>
                  <option value="Pending">Pending (Diproses)</option>
                  <option value="Failed">Failed (Gagal)</option>
                </select>
                <div className="text-xs font-bold text-gray-400 px-2">
                  Total: <span className="text-gray-900">{filteredWithdrawals.length} Penarikan</span>
                </div>
              </div>
            </div>

            {/* Tabel Withdrawal */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border print:border-gray-200 print:shadow-none">
              <div className="p-4 bg-gray-50 font-black text-xs text-gray-800 border-b border-gray-100 hidden print:block">
                RIWAYAT PENARIKAN SALDO (WITHDRAWAL) MITRA
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-extrabold print:bg-gray-100 print:text-gray-700">
                      <th className="py-4 px-6">ID & Nama Mitra</th>
                      <th className="py-4 px-6">Jenis Kemitraan</th>
                      <th className="py-4 px-6">Rekening Tujuan (Bank / E-Wallet)</th>
                      <th className="py-4 px-6">Jumlah Penarikan</th>
                      <th className="py-4 px-6">Status Transfer</th>
                      <th className="py-4 px-6 text-right">Waktu Request</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredWithdrawals.length > 0 ? (
                      filteredWithdrawals.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{item.partnerName}</div>
                            <div className="text-[11px] font-bold text-purple-600 font-mono">{item.id}</div>
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-gray-700">
                            {item.partnerType}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-gray-800 font-mono">
                            {item.bank}
                          </td>
                          <td className="py-4 px-6 text-xs font-black text-gray-900">
                            {item.amount}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 text-[10px] font-extrabold rounded-xl inline-flex items-center gap-1.5 ${
                              item.status === 'Success' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                : item.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Success' ? 'bg-emerald-500' : item.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}></span>
                              {item.status === 'Success' ? 'Berhasil Ditransfer' : item.status === 'Pending' ? 'Menunggu Proses' : 'Gagal / Dibatalkan'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-xs font-bold text-gray-500">
                            {item.time}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-xs font-bold text-gray-400">
                          Tidak ada riwayat penarikan saldo mitra ditemukan.
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