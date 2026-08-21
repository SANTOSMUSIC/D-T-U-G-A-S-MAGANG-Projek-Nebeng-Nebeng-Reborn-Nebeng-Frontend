import React, { useState } from 'react';
import { Wallet, Lock, ArrowUpRight, Building2, CheckCircle2, History, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function MitraBalance() {
  const toast = useToast();
  const [availableBalance, setAvailableBalance] = useState(3850000);
  const [escrowHold, setEscrowHold] = useState(1250000);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountHolder: 'Mitra Pos Utama'
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.warning('Masukkan jumlah penarikan yang valid.', { title: 'Jumlah Tidak Valid' });
      return;
    }
    if (amount > availableBalance) {
      toast.warning('Jumlah penarikan melebihi Saldo Boleh Ditarik (Available Balance).', { title: 'Saldo Tidak Cukup' });
      return;
    }

    setAvailableBalance(prev => prev - amount);
    setWithdrawAmount('');
    setIsSuccessModalOpen(true);
  };

  const escrowTransactions = [
    { id: 'TRX-901', trip: 'TRIP-701 (Solo - Jogja)', amount: 750000, status: 'Menunggu Verifikasi Pos Tujuan' },
    { id: 'TRX-902', trip: 'TRIP-702 (Solo - Semarang)', amount: 500000, status: 'Dalam Perjalanan (Escrow Hold)' }
  ];

  const walletHistory = [
    { id: 'WD-401', date: '20 Jun 2026', type: 'Pencairan (Withdrawal)', amount: -2500000, status: 'Berhasil ke BCA (***890)' },
    { id: 'IN-882', date: '19 Jun 2026', type: 'Komisi Trip TRIP-699', amount: 1400000, status: 'Masuk ke Available Balance' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <Wallet className="w-3.5 h-3.5" /> Keuangan & Sistem Escrow
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Mitra Wallet & Auto-Escrow Earnings</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Pantau saldo tertahan otomatis (escrow) dan lakukan penarikan komisi trip ke rekening bank terdaftar.</p>
        </div>
      </div>

      {/* Kartu Informasi Saldo Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Available Balance (Boleh Ditarik) */}
        <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Wallet className="w-48 h-48" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Saldo Boleh Ditarik (Available)</span>
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Siap Cair
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Rp {availableBalance.toLocaleString('id-ID')}</h2>
            <p className="text-pink-100 text-xs mt-1">Dana bersih dari komisi trip yang telah selesai diverifikasi oleh Operator Pos.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
            <span>Rekening Terdaftar: {bankInfo.bankName} ({bankInfo.accountNumber})</span>
          </div>
        </div>

        {/* Escrow Hold (Saldo Ditahan Otomatis) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saldo Ditahan (Escrow Hold)</span>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Terkunci Aman
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Rp {escrowHold.toLocaleString('id-ID')}</h2>
            <p className="text-neutral-500 text-xs mt-1">Dana trip aktif yang ditahan sementara di sistem escrow sampai paket diserahterimakan di pos tujuan.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-pink-600" /> 
            <span>Dilindungi sistem otomatis pos untuk keamanan transaksi bersama.</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Withdrawal (Penarikan Saldo) */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-1">
          <h3 className="text-base font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-pink-600" /> Tarik Saldo (Withdrawal)
          </h3>

          <div className="bg-neutral-50 p-4 rounded-2xl mb-4 border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-neutral-900">{bankInfo.bankName} - {bankInfo.accountNumber}</p>
                <p className="text-[11px] text-neutral-500">{bankInfo.accountHolder}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Penarikan (Rp)</label>
              <input 
                type="number" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Contoh: 1000000"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-pink-600"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Maksimal penarikan: Rp {availableBalance.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-pink-900/20 cursor-pointer"
            >
              Cairkan ke Rekening Bank
            </button>
          </form>
        </div>

        {/* Tabel Detail Escrow Hold & Histori */}
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 lg:col-span-2 space-y-6">
          
          {/* Bagian Rincian Escrow Hold */}
          <div>
            <h3 className="text-base font-extrabold text-neutral-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" /> Rincian Dana Escrow Aktif
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-[11px] font-extrabold text-neutral-500 uppercase">
                    <th className="py-3 px-3">ID Transaksi</th>
                    <th className="py-3 px-3">Trip Terkait</th>
                    <th className="py-3 px-3">Nominal Escrow</th>
                    <th className="py-3 px-3">Status Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs font-medium">
                  {escrowTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-extrabold text-neutral-900">{tx.id}</td>
                      <td className="py-3 px-3 text-neutral-700">{tx.trip}</td>
                      <td className="py-3 px-3 font-extrabold text-neutral-900">Rp {tx.amount.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3">
                        <span className="bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bagian Histori Dompet */}
          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-base font-extrabold text-neutral-900 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-pink-600" /> Riwayat Mutasi Dompet Mitra
            </h3>
            <div className="space-y-2.5">
              {walletHistory.map((item) => (
                <div key={item.id} className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900">{item.type}</p>
                    <p className="text-[10px] text-neutral-500">{item.date} • {item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-extrabold ${item.amount < 0 ? 'text-neutral-800' : 'text-emerald-600'}`}>
                      {item.amount < 0 ? `- Rp ${Math.abs(item.amount).toLocaleString('id-ID')}` : `+ Rp ${item.amount.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Sukses Penarikan */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-900">Penarikan Berhasil Diajukan!</h3>
            <p className="text-neutral-500 text-xs">Dana Anda sedang diproses dan akan segera masuk ke rekening bank terdaftar dalam beberapa menit ke depan.</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Tutup & Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}