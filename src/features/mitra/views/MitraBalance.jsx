import { useEffect, useState, useCallback } from 'react';
import {
  Wallet,
  Lock,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  History,
  Eye,
  EyeOff,
  Pencil,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import apiClient from '../../../services/apiClient';

const PRIMARY_COLOR = '#4FBF99';
const PRIMARY_ACCENT = '#66CDAA';

const STATUS_LABEL = {
  scheduled: 'Menunggu Keberangkatan',
  in_origin_pos: 'Di Pos Asal',
  in_transit: 'Dalam Perjalanan (Escrow Hold)',
  arrived_dest_pos: 'Tiba di Pos Tujuan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function MitraBalance() {
  const toast = useToast();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [escrowHold, setEscrowHold] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [escrowTransactions, setEscrowTransactions] = useState([]);
  
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showAccountPii, setShowAccountPii] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankDraft, setBankDraft] = useState(bankInfo);
  const [isLoading, setIsLoading] = useState(true);

  const MIN_WITHDRAWAL = 50000;

  const fetchWalletData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. Ambil profil user & bank dari database (/api/auth/me) yang memuat user_profiles
      const userRes = await apiClient.get('/auth/me');
      if (userRes.data && userRes.data.profile) {
        const profile = userRes.data.profile;
        const initialBank = {
          bankName: profile.bankName || '',
          accountNumber: profile.bankAccountNumber || '',
          accountHolder: profile.bankAccountHolder || userRes.data.name || '',
        };
        setBankInfo(initialBank);
        setBankDraft(initialBank);
      }

      // 2. Ambil data dompet & mutasi (/api/wallets/me)
      const walletRes = await apiClient.get('/wallets/me');
      if (walletRes.data) {
        setAvailableBalance(Number(walletRes.data.balance || 0));
        setEscrowHold(Number(walletRes.data.heldEscrowBalance || 0));
        
        if (walletRes.data.transactions) {
          setWalletHistory(walletRes.data.transactions);
        }
      }

      // 3. Ambil data trip mitra untuk rincian escrow
      const tripsRes = await apiClient.get('/trips');
      if (tripsRes.data) {
        const allTrips = Array.isArray(tripsRes.data) ? tripsRes.data : tripsRes.data.data || [];
        const activeEscrows = allTrips.filter(
          (t) => ['scheduled', 'in_origin_pos', 'in_transit', 'arrived_dest_pos'].includes(t.status)
        );
        setEscrowTransactions(activeEscrows);
      }
    } catch (error) {
      console.error('Gagal memuat data keuangan:', error);
      toast.error('Gagal menyinkronkan data keuangan dari database.', { title: 'Error' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);

        const userRes = await apiClient.get('/auth/me');
        if (!isMounted) return;

        if (userRes.data) {
          const userData = userRes.data;
          const bankName = userData.bankName || userData.profile?.bankName || '';
          const accountNumber = userData.bankAccountNumber || userData.profile?.bankAccountNumber || '';
          const accountHolder = userData.bankAccountHolder || userData.profile?.bankAccountHolder || userData.name || '';

          const initialBank = {
            bankName: bankName,
            accountNumber: accountNumber,
            accountHolder: accountHolder,
          };
          
          setBankInfo(initialBank);
          setBankDraft(initialBank);
        }

        // 2. Ambil data dompet & mutasi (/api/wallets/me)[cite: 2]
        const walletRes = await apiClient.get('/wallets/me');
        if (!isMounted) return;

        if (walletRes.data) {
          setAvailableBalance(Number(walletRes.data.balance || 0));
          setEscrowHold(Number(walletRes.data.heldEscrowBalance || 0));
          
          if (walletRes.data.transactions) {
            setWalletHistory(walletRes.data.transactions);
          }
        }

        // 3. Ambil data trip mitra untuk rincian escrow[cite: 2]
        const tripsRes = await apiClient.get('/trips');
        if (!isMounted) return;

        if (tripsRes.data) {
          const allTrips = Array.isArray(tripsRes.data) ? tripsRes.data : tripsRes.data.data || [];
          const activeEscrows = allTrips.filter(
            (t) => ['scheduled', 'in_origin_pos', 'in_transit', 'arrived_dest_pos'].includes(t.status)
          );
          setEscrowTransactions(activeEscrows);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Gagal memuat data keuangan:', error);
        toast.error('Gagal menyinkronkan data keuangan dari database.', { title: 'Error' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const maskAccountNumber = (accNum) => {
    if (!accNum || accNum.length < 6) return accNum || '-';
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.warning(
        `Minimum penarikan saldo adalah Rp ${MIN_WITHDRAWAL.toLocaleString('id-ID')}.`,
        { title: 'Batas Minimum Penarikan' }
      );
      return;
    }

    if (amount > availableBalance) {
      toast.warning(
        'Jumlah penarikan melebihi Saldo Boleh Ditarik (Available Balance).',
        { title: 'Saldo Tidak Cukup' }
      );
      return;
    }

    try {
      await apiClient.post('/wallets/withdraw', { amount });
      setWithdrawAmount('');
      setIsSuccessModalOpen(true);
      fetchWalletData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Penarikan gagal diproses.',
        { title: 'Gagal' }
      );
    }
  };

  const handleStartEditBank = () => {
    setBankDraft(bankInfo);
    setIsEditingBank(true);
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();

    if (
      !bankDraft.bankName.trim() ||
      !bankDraft.accountNumber.trim() ||
      !bankDraft.accountHolder.trim()
    ) {
      toast.warning('Semua field rekening bank wajib diisi.', { title: 'Data Tidak Lengkap' });
      return;
    }

    try {
      // Memperbarui rincian bank ke database melalui endpoint profil detail (/api/users/me/profile)
      await apiClient.patch('/users/me/profile', {
        bankName: bankDraft.bankName,
        bankAccountNumber: bankDraft.accountNumber,
        bankAccountHolder: bankDraft.accountHolder,
      });

      setBankInfo(bankDraft);
      setIsEditingBank(false);
      toast.success('Rekening bank berhasil diperbarui.', { title: 'Rekening Diperbarui' });
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui rekening bank.',
        { title: 'Error' }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: PRIMARY_COLOR }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
              style={{ color: PRIMARY_COLOR }}
            >
              <Wallet className="w-3 h-3" />
              KEUANGAN & SISTEM ESCROW MITRA
            </span>
          </div>

          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            Mitra Wallet & Auto-Escrow Earnings
          </h1>

          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Pantau saldo tertahan otomatis (escrow) dan lakukan penarikan
            komisi trip ke rekening bank terdaftar secara aman.
          </p>
        </div>
      </div>

      {/* Saldo Cards */}
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
        {/* Withdrawal Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-1 space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-800 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" style={{ color: PRIMARY_COLOR }} />
            Tarik Saldo (Withdrawal)
          </h3>

          {!isEditingBank ? (
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0"
                    style={{
                      backgroundColor: `${PRIMARY_ACCENT}25`,
                      color: PRIMARY_COLOR,
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-neutral-800">
                      {bankInfo.bankName ? `${bankInfo.bankName} - ` : ''}
                      {showAccountPii
                        ? bankInfo.accountNumber || 'Belum diatur'
                        : maskAccountNumber(bankInfo.accountNumber || 'Belum diatur')}
                    </p>
                    <p className="text-[8px] text-neutral-400 font-medium">
                      {bankInfo.accountHolder || 'Atas Nama Belum Diatur'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAccountPii(!showAccountPii)}
                    className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    title={showAccountPii ? 'Sembunyikan Nomor Rekening' : 'Tampilkan Nomor Rekening'}
                  >
                    {showAccountPii ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleStartEditBank}
                    className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                    title="Ubah Rekening Bank"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSaveBank}
              className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-[10px]"
            >
              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA / Mandiri"
                  value={bankDraft.bankName}
                  onChange={(e) =>
                    setBankDraft((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234567890"
                  value={bankDraft.accountNumber}
                  onChange={(e) =>
                    setBankDraft((prev) => ({
                      ...prev,
                      accountNumber: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan"
                  value={bankDraft.accountHolder}
                  onChange={(e) =>
                    setBankDraft((prev) => ({ ...prev, accountHolder: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none"
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
                  className="flex-1 py-2 text-white rounded-lg font-bold transition cursor-pointer"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          <form onSubmit={handleWithdraw} className="space-y-3.5 text-[10px]">
            <div>
              <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Jumlah Penarikan (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 100000"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-bold text-neutral-800 focus:outline-none"
              />
              <span className="text-[8px] text-neutral-400 mt-1 block">
                Min. Rp 50.000 | Maks. Rp {availableBalance.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isEditingBank || availableBalance < MIN_WITHDRAWAL}
              className="w-full py-3 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
              style={{ backgroundColor: isEditingBank ? undefined : PRIMARY_COLOR }}
            >
              Cairkan ke Rekening Bank
            </button>
          </form>
        </div>

        {/* Escrow & History Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 lg:col-span-2 space-y-5">
          {/* Active Escrow */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Rincian Dana Escrow Aktif
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 text-[9px] text-neutral-400 uppercase font-semibold">
                    <th className="py-3 px-3">ID Trip</th>
                    <th className="py-3 px-3">Rute Perjalanan</th>
                    <th className="py-3 px-3">Nominal Escrow</th>
                    <th className="py-3 px-3">Status Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[9px]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-neutral-400">
                        Memuat data...
                      </td>
                    </tr>
                  ) : escrowTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-neutral-400 font-medium">
                        Tidak ada dana escrow aktif saat ini.
                      </td>
                    </tr>
                  ) : (
                    escrowTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-50/60 transition">
                        <td className="py-3.5 px-3 font-bold text-neutral-800 font-mono">
                          #{tx.id}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-neutral-700">
                          {tx.originPoint?.name || '-'} → {tx.destinationPoint?.name || '-'}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-neutral-800">
                          Rp {Number(tx.price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-3">
                          <StatusBadge variant="amber">
                            {STATUS_LABEL[tx.status] ?? tx.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallet History */}
          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-[14px] font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" style={{ color: PRIMARY_COLOR }} />
              Riwayat Mutasi Dompet Mitra
            </h3>

            <div className="space-y-2">
              {walletHistory.length === 0 ? (
                <p className="text-[10px] text-neutral-400 text-center py-4">
                  Belum ada riwayat mutasi transaksi.
                </p>
              ) : (
                walletHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-neutral-800 flex items-center gap-1.5">
                        {item.description || item.type || 'Mutasi Dompet'}
                      </p>
                      <p className="text-[8px] text-neutral-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        • ID: {item.id}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-[10px] font-bold ${
                          Number(item.amount) < 0 ? 'text-neutral-800' : 'text-emerald-600'
                        }`}
                      >
                        {Number(item.amount) < 0
                          ? `- Rp ${Math.abs(Number(item.amount)).toLocaleString('id-ID')}`
                          : `+ Rp ${Number(item.amount).toLocaleString('id-ID')}`}
                      </p>
                      <p className="text-[8px] text-neutral-400 font-medium uppercase">
                        {item.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
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

          <p className="text-neutral-500">
            Permintaan penarikan saldo Anda telah diterima dan sedang diproses ke rekening bank terdaftar.
          </p>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py.2.5 text-white font-bold rounded-xl transition cursor-pointer"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Tutup & Selesai
          </button>
        </div>
      </BaseModal>
    </div>
  );
}