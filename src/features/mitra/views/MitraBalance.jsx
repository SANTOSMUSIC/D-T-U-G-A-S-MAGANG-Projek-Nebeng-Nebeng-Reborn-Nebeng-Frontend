import { useState } from 'react';
import { Wallet, Lock, ArrowUpRight, Building2, CheckCircle2, History, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';

export default function MitraBalance() {
  const toast = useToast();
  const [availableBalance, setAvailableBalance] = useState(3850000);
  const [escrowHold] = useState(1250000);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showAccountPii, setShowAccountPii] = useState(false);
  const MIN_WITHDRAWAL = 50000;

  const [bankInfo] = useState({
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountHolder: 'Budi Santoso (Mitra)'
  });

  const [walletHistory, setWalletHistory] = useState([
    { id: 'WD-401', date: '20 Agu 2026', type: 'Pencairan (Withdrawal)', amount: -2500000, status: 'Berhasil ke BCA' },
    { id: 'IN-882', date: '19 Agu 2026', type: 'Komisi Trip TRIP-699', amount: 1400000, status: 'Masuk ke Available Balance' },
  ]);

  const escrowTransactions = [
    { id: 'TRX-901', trip: 'TRIP-701 (Solo - Jogja)', amount: 750000, status: 'Menunggu Verifikasi Pos Tujuan' },
    { id: 'TRX-902', trip: 'TRIP-702 (Solo - Semarang)', amount: 500000, status: 'Dalam Perjalanan (Escrow Hold)' }
  ];

  const maskAccountNumber = (accNum) => {
    if (!accNum || accNum.length < 6) return accNum;
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.warning(`Minimum penarikan saldo adalah Rp ${MIN_WITHDRAWAL.toLocaleString('id-ID')}.`, { title: 'Batas Minimum Penarikan' });
      return;
    }
    if (amount > availableBalance) {
      toast.warning('Jumlah penarikan melebihi Saldo Boleh Ditarik (Available Balance).', { title: 'Saldo Tidak Cukup' });
      return;
    }

    setAvailableBalance(prev => prev - amount);
    
    const newTx = {
      id: `WD-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Hari ini',
      type: 'Pencairan (Withdrawal)',
      amount: -amount,
      status: `Berhasil ke ${bankInfo.bankName} (${maskAccountNumber(bankInfo.accountNumber)})`
    };
    setWalletHistory([newTx, ...walletHistory]);

    setWithdrawAmount('');
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <Wallet className="w-3 h-3" /> KEUANGAN & SISTEM ESCROW MITRA
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Mitra Wallet & Auto-Escrow Earnings
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pantau saldo tertahan otomatis (escrow) dan lakukan penarikan komisi trip ke rekening bank terdaftar secara aman.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="SALDO BOLEH DITARIK (AVAILABLE)"
          value={`Rp ${availableBalance.toLocaleString('id-ID')}`}
          subtitle="Siap dicairkan ke rekening"
          icon={Wallet}
        />
        <StatCard
          title="SALDO DITAHAN (ESCROW HOLD)"
          value={`Rp ${escrowHold.toLocaleString('id-ID')}`}
          subtitle="Terkunci aman sistem hingga verifikasi pos"
          icon={Lock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-1 space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-[#4B2172]" /> Tarik Saldo (Withdrawal)
          </h3>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#4B2172] flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-800">
                    {bankInfo.bankName} - {showAccountPii ? bankInfo.accountNumber : maskAccountNumber(bankInfo.accountNumber)}
                  </p>
                  <p className="text-[8px] text-neutral-400 font-medium">{bankInfo.accountHolder}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountPii(!showAccountPii)}
                className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                title={showAccountPii ? "Sembunyikan Nomor Rekening" : "Tampilkan Nomor Rekening"}
              >
                {showAccountPii ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jumlah Penarikan (Rp)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 1000000"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
              <span className="text-[8px] text-neutral-400 mt-1 block">Min. Rp 50.000 | Maks. Rp {availableBalance.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
            >
              Cairkan ke Rekening Bank
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-[14px] font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Rincian Dana Escrow Aktif
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-[#9px] text-neutral-400 uppercase font-semibold">
                    <th className="py-3 px-3">ID Transaksi</th>
                    <th className="py-3 px-3">Trip Terkait</th>
                    <th className="py-3 px-3">Nominal Escrow</th>
                    <th className="py-3 px-3">Status Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[9px]">
                  {escrowTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3.5 px-3 font-bold text-neutral-800 font-mono">{tx.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-700">{tx.trip}</td>
                      <td className="py-3.5 px-3 font-bold text-neutral-800">Rp {tx.amount.toLocaleString('id-ID')}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge variant="amber">{tx.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-[14px] font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#4B2172]" /> Riwayat Mutasi Dompet Mitra
            </h3>
            <div className="space-y-2">
              {walletHistory.map((item) => (
                <div key={item.id} className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-800">{item.type}</p>
                    <p className="text-[8px] text-neutral-400">{item.date} • {item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold ${item.amount < 0 ? 'text-neutral-800' : 'text-emerald-600'}`}>
                      {item.amount < 0 ? `- Rp ${Math.abs(item.amount).toLocaleString('id-ID')}` : `+ Rp ${item.amount.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-[8px] text-neutral-400 font-medium">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Penarikan Berhasil Diajukan!"
        subtitle="Pencairan Komisi Mitra"
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-3 text-[10px]">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-neutral-500">Dana Anda sedang diproses oleh Payment Gateway dan akan masuk ke rekening dalam 1x24 jam.</p>
          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white font-bold rounded-xl transition cursor-pointer"
          >
            Tutup & Selesai
          </button>
        </div>
      </BaseModal>
    </div>
  );
}