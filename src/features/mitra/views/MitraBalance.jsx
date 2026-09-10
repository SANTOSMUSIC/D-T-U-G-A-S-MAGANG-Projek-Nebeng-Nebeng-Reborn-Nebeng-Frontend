import { useState, useEffect } from 'react';
import { Wallet, Lock, ArrowUpRight, Building2, CheckCircle2, Eye, EyeOff, Pencil } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

export default function MitraBalance() {
  const toast = useToast();

  const [walletData, setWalletData] = useState({ balance: 0, heldEscrowBalance: 0, transactions: [] });
  const [trips, setTrips] = useState([]);
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showAccountPii, setShowAccountPii] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankDraft, setBankDraft] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  const MIN_WITHDRAWAL = 50000;

  // Ambil data dompet, profil rekening, dan trip aktif langsung dari backend
  useEffect(() => {
    let isMounted = true;
    const fetchBalanceData = async () => {
      setIsLoading(true);
      try {
        const [walletRes, userRes, tripsRes] = await Promise.all([
          apiClient.get('/wallets/me'),
          apiClient.get('/auth/me'),
          apiClient.get('/trips')
        ]);

        if (!isMounted) return;

        setWalletData(walletRes.data || { balance: 0, heldEscrowBalance: 0, transactions: [] });

        const profile = userRes.data?.profile || {};
        const initialBank = {
          bankName: profile.bankName || '',
          accountNumber: profile.bankAccountNumber || '',
          accountHolder: profile.bankAccountHolder || userRes.data?.name || ''
        };
        setBankInfo(initialBank);
        setBankDraft(initialBank);

        const currentUserId = String(userRes.data?.id);
        const allTrips = tripsRes.data?.data || tripsRes.data || [];
        const myTrips = allTrips.filter(t => String(t.mitraId || t.mitra?.id) === currentUserId);
        setTrips(myTrips);

      } catch (err) {
        console.error('Gagal memuat data keuangan mitra:', err);
        toast.error('Gagal mengambil data saldo dari server.', { title: 'Error' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBalanceData();
    return () => { isMounted = false; };
  }, [toast]);

  const availableBalance = Number(walletData.balance || 0);
  const escrowHold = Number(walletData.heldEscrowBalance || 0);

  // Filter trip yang masih menahan dana escrow
  const escrowTransactions = trips.filter((t) => t.status === 'scheduled' || t.status === 'in_transit');

  const maskAccountNumber = (accNum) => {
    if (!accNum || accNum.length < 6) return accNum;
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.warning(`Minimum penarikan saldo adalah Rp ${MIN_WITHDRAWAL.toLocaleString('id-ID')}.`, { title: 'Batas Minimum' });
      return;
    }
    if (amount > availableBalance) {
      toast.warning('Jumlah penarikan melebihi Saldo Boleh Ditarik (Available Balance).', { title: 'Saldo Tidak Cukup' });
      return;
    }

    try {
      await apiClient.post('/wallets/withdraw', { amount });
      
      // Refresh ulang data wallet setelah withdraw berhasil
      const walletRes = await apiClient.get('/wallets/me');
      setWalletData(walletRes.data);

      setWithdrawAmount('');
      setIsSuccessModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Penarikan gagal diproses.', { title: 'Gagal' });
    }
  };

  const handleStartEditBank = () => {
    setBankDraft(bankInfo);
    setIsEditingBank(true);
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankDraft.bankName.trim() || !bankDraft.accountNumber.trim() || !bankDraft.accountHolder.trim()) {
      toast.warning('Semua field rekening bank wajib diisi.', { title: 'Data Tidak Lengkap' });
      return;
    }

    try {
      await apiClient.patch('/users/me/profile', {
        bankName: bankDraft.bankName.trim(),
        bankAccountNumber: bankDraft.accountNumber.trim(),
        bankAccountHolder: bankDraft.accountHolder.trim()
      });

      setBankInfo(bankDraft);
      setIsEditingBank(false);
      toast.success('Rekening bank berhasil diperbarui.', { title: 'Rekening Diperbarui' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui rekening bank.', { title: 'Gagal' });
    }
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

          {!isEditingBank ? (
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#4B2172] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-800">
                      {bankInfo.bankName ? `${bankInfo.bankName} - ${showAccountPii ? bankInfo.accountNumber : maskAccountNumber(bankInfo.accountNumber)}` : 'Belum ada rekening terdaftar'}
                    </p>
                    <p className="text-[8px] text-neutral-400 font-medium">{bankInfo.accountHolder || 'Silakan lengkapi rekening'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAccountPii(!showAccountPii)}
                    className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    title={showAccountPii ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showAccountPii ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEditBank}
                    className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    title="Ubah Rekening"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBank} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-[10px]">
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={bankDraft.bankName}
                  onChange={(e) => setBankDraft((prev) => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bankDraft.accountNumber}
                  onChange={(e) => setBankDraft((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  value={bankDraft.accountHolder}
                  onChange={(e) => setBankDraft((prev) => ({ ...prev, accountHolder: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingBank(false)}
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-lg font-bold transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          <form onSubmit={handleWithdraw} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Jumlah Penarikan (Rp)</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 100000"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
              <span className="text-[8px] text-neutral-400 mt-1 block">Min. Rp 50.000 | Maks. Rp {availableBalance.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              disabled={isEditingBank || isLoading}
              className="w-full py-3 bg-[#4B2172] hover:bg-[#3a1a59] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
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
                  <tr className="border-b border-neutral-100 text-[9px] text-neutral-400 uppercase font-semibold">
                    <th className="py-3 px-3">ID Trip</th>
                    <th className="py-3 px-3">Trip Terkait</th>
                    <th className="py-3 px-3">Tarif Trip</th>
                    <th className="py-3 px-3">Status Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[9px]">
                  {escrowTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-neutral-400 font-medium">Tidak ada dana escrow aktif saat ini.</td>
                    </tr>
                  ) : escrowTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3.5 px-3 font-bold text-neutral-800 font-mono">TRIP-{tx.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-700">{tx.originPoint?.name} &rarr; {tx.destinationPoint?.name}</td>
                      <td className="py-3.5 px-3 font-bold text-neutral-800">Rp {Number(tx.price || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge variant="amber">{tx.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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