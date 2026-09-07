import { useState } from 'react';
import { Wallet, Lock, ArrowUpRight, CheckCircle2, History, Eye, EyeOff, Pencil, Clock3, ChevronDown, Building2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import StatCard from '../../../components/ui/StatCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import BaseModal from '../../../components/ui/BaseModal';
import { useMitraData } from '../../../context/MitraDataContext';

const STATUS_LABEL = { 'Aktif': 'Menunggu Keberangkatan', 'In Transit': 'Dalam Perjalanan (Escrow Hold)' };

// Komponen Vektor SVG Logo Bank (Ringan, Tanpa HTTP Request, Anti-Broken)
function BankLogoIcon({ code, className = "w-8 h-5" }) {
  switch (code) {
    case 'BCA':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#00529C"/>
          <path d="M14 10C20 10 24 26 30 26" stroke="#0088FF" strokeWidth="4" strokeLinecap="round"/>
          <text x="62" y="25" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BCA</text>
        </svg>
      );
    case 'MANDIRI':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#0A2540"/>
          <path d="M12 24C18 12 28 12 34 24" stroke="#F2A900" strokeWidth="3.5" strokeLinecap="round"/>
          <text x="62" y="24" fill="white" fontSize="13" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">mandırı</text>
        </svg>
      );
    case 'BRI':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#00529C"/>
          <rect x="10" y="8" width="20" height="20" rx="3" fill="#F37021"/>
          <text x="20" y="23" fill="white" fontSize="11" fontWeight="900" textAnchor="middle">B</text>
          <text x="62" y="25" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BRI</text>
        </svg>
      );
    case 'BNI':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#F37021"/>
          <text x="50" y="25" fill="#00529C" fontSize="20" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BNI</text>
        </svg>
      );
    case 'BSI':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#008266"/>
          <circle cx="20" cy="18" r="6" fill="#FFC700"/>
          <text x="60" y="25" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BSI</text>
        </svg>
      );
    case 'CIMB':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#7A0000"/>
          <polygon points="12,10 24,18 12,26" fill="#ED1C24"/>
          <text x="62" y="24" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">CIMB</text>
        </svg>
      );
    case 'PERMATA':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#006633"/>
          <polygon points="18,8 26,18 18,28 10,18" fill="#8DC63F"/>
          <text x="62" y="23" fill="white" fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif" textAnchor="middle">Permata</text>
        </svg>
      );
    case 'DANAMON':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#E85D04"/>
          <rect x="10" y="10" width="4" height="16" fill="#FFB703"/>
          <text x="60" y="23" fill="white" fontSize="11" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Danamon</text>
        </svg>
      );
    case 'JAGO':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#FF7A00"/>
          <text x="50" y="25" fill="#381757" fontSize="18" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">jago</text>
        </svg>
      );
    case 'SEABANK':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#FF5722"/>
          <path d="M10 22C14 16 20 24 24 18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <text x="62" y="23" fill="white" fontSize="11" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">SeaBank</text>
        </svg>
      );
    case 'BTN':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#003399"/>
          <rect x="8" y="24" width="84" height="4" fill="#E50012"/>
          <text x="50" y="22" fill="white" fontSize="16" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">BTN</text>
        </svg>
      );
    case 'MEGA':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#231F20"/>
          <polygon points="12,10 24,10 18,26" fill="#F15A24"/>
          <polygon points="20,10 32,10 26,26" fill="#FCB040"/>
          <text x="65" y="24" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">MEGA</text>
        </svg>
      );
    case 'MAYBANK':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#FFC700"/>
          <text x="50" y="23" fill="#000000" fontSize="12" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">Maybank</text>
        </svg>
      );
    case 'OCBC':
      return (
        <svg viewBox="0 0 100 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="36" rx="6" fill="#D9232D"/>
          <circle cx="20" cy="18" r="8" fill="white"/>
          <text x="62" y="24" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">OCBC</text>
        </svg>
      );
    default:
      return <Building2 className="w-5 h-5 text-[#4B2172]" />;
  }
}

// Daftar Bank Resmi Indonesia
const INDONESIAN_BANKS = [
  { name: 'Bank BCA', code: 'BCA' },
  { name: 'Bank Mandiri', code: 'MANDIRI' },
  { name: 'Bank BRI', code: 'BRI' },
  { name: 'Bank BNI', code: 'BNI' },
  { name: 'Bank Syariah Indonesia (BSI)', code: 'BSI' },
  { name: 'Bank CIMB Niaga', code: 'CIMB' },
  { name: 'Bank Permata', code: 'PERMATA' },
  { name: 'Bank Danamon', code: 'DANAMON' },
  { name: 'Bank Jago', code: 'JAGO' },
  { name: 'SeaBank Indonesia', code: 'SEABANK' },
  { name: 'Bank BTN', code: 'BTN' },
  { name: 'Bank Mega', code: 'MEGA' },
  { name: 'Bank Maybank', code: 'MAYBANK' },
  { name: 'Bank OCBC NISP', code: 'OCBC' },
];

export default function MitraBalance() {
  const toast = useToast();
  const {
    trips,
    availableBalance,
    escrowHold,
    walletHistory,
    bankInfo,
    setBankInfo,
    requestWithdrawal,
  } = useMitraData();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showAccountPii, setShowAccountPii] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankDraft, setBankDraft] = useState(bankInfo);
  const MIN_WITHDRAWAL = 50000;

  const escrowTransactions = trips.filter((t) => t.status === 'Aktif' || t.status === 'In Transit');

  const selectedBankObj = INDONESIAN_BANKS.find((b) => b.name === bankInfo.bankName);
  const selectedDraftBankObj = INDONESIAN_BANKS.find((b) => b.name === bankDraft.bankName);

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

    const result = requestWithdrawal(amount);
    if (!result.ok) {
      toast.warning('Penarikan gagal diproses. Silakan coba lagi.', { title: 'Gagal' });
      return;
    }

    setWithdrawAmount('');
    setIsSuccessModalOpen(true);
  };

  const handleStartEditBank = () => {
    setBankDraft(bankInfo);
    setIsEditingBank(true);
    setIsBankDropdownOpen(false);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    if (!bankDraft.bankName.trim() || !bankDraft.accountNumber.trim() || !bankDraft.accountHolder.trim()) {
      toast.warning('Semua field rekening bank wajib diisi.', { title: 'Data Tidak Lengkap' });
      return;
    }
    setBankInfo(bankDraft);
    setIsEditingBank(false);
    setIsBankDropdownOpen(false);
    toast.success('Rekening bank berhasil diperbarui.', { title: 'Rekening Diperbarui' });
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
            !bankInfo.bankName && !bankInfo.accountNumber ? (
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-dashed border-neutral-200 space-y-2 text-center">
                <p className="text-[10px] font-bold text-neutral-600">Belum ada rekening bank terdaftar</p>
                <p className="text-[8px] text-neutral-400">Tambahkan rekening tujuan pencairan saldo Anda.</p>
                <button
                  type="button"
                  onClick={handleStartEditBank}
                  className="mt-1 px-3.5 py-2 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl text-[9px] font-bold transition cursor-pointer"
                >
                  Tambah Rekening Bank
                </button>
              </div>
            ) : (
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 flex items-center justify-center">
                      <BankLogoIcon code={selectedBankObj?.code} className="w-9 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-800">
                        {bankInfo.bankName} - {showAccountPii ? bankInfo.accountNumber : maskAccountNumber(bankInfo.accountNumber)}
                      </p>
                      <p className="text-[8px] text-neutral-400 font-medium">{bankInfo.accountHolder}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAccountPii(!showAccountPii)}
                      className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                      title={showAccountPii ? "Sembunyikan Nomor Rekening" : "Tampilkan Nomor Rekening"}
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
            )
          ) : (
            <form onSubmit={handleSaveBank} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-[10px]">
              
              {/* Custom Bank Selector Dropdown */}
              <div className="relative">
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Bank</label>
                <button
                  type="button"
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 flex items-center justify-between text-left focus:outline-none focus:border-[#4B2172] cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {selectedDraftBankObj ? (
                      <>
                        <BankLogoIcon code={selectedDraftBankObj.code} className="w-7 h-4 shrink-0" />
                        <span className="truncate">{selectedDraftBankObj.name}</span>
                      </>
                    ) : (
                      <span className="text-neutral-400 font-normal">-- Pilih Bank Tujuan --</span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </button>

                {isBankDropdownOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-neutral-100">
                    {INDONESIAN_BANKS.map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => {
                          setBankDraft((prev) => ({ ...prev, bankName: bank.name }));
                          setIsBankDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-purple-50 transition text-left cursor-pointer"
                      >
                        <BankLogoIcon code={bank.code} className="w-8 h-5 shrink-0" />
                        <span className="text-[10px] font-bold text-neutral-800">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan nomor rekening"
                  value={bankDraft.accountNumber}
                  onChange={(e) => setBankDraft((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan"
                  value={bankDraft.accountHolder}
                  onChange={(e) => setBankDraft((prev) => ({ ...prev, accountHolder: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingBank(false);
                    setIsBankDropdownOpen(false);
                  }}
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
                placeholder="Contoh: 1000000"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-bold text-neutral-800 focus:outline-none focus:border-[#4B2172]"
              />
              <span className="text-[8px] text-neutral-400 mt-1 block">Min. Rp 50.000 | Maks. Rp {availableBalance.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              disabled={isEditingBank}
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
                  <tr className="border-b border-neutral-100 text-[#9px] text-neutral-400 uppercase font-semibold">
                    <th className="py-3 px-3">ID Trip</th>
                    <th className="py-3 px-3">Trip Terkait</th>
                    <th className="py-3 px-3">Nominal Escrow</th>
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
                      <td className="py-3.5 px-3 font-bold text-neutral-800 font-mono">{tx.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-700">{tx.origin} - {tx.destination}</td>
                      <td className="py-3.5 px-3 font-bold text-neutral-800">Rp {tx.escrowAmount.toLocaleString('id-ID')}</td>
                      <td className="py-3.5 px-3">
                        <StatusBadge variant="amber">{STATUS_LABEL[tx.status] ?? tx.status}</StatusBadge>
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
                    <p className="text-[10px] font-bold text-neutral-800 flex items-center gap-1.5">
                      {item.type}
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 text-[8px] font-bold">
                          <Clock3 className="w-2.5 h-2.5" /> Diproses
                        </span>
                      )}
                    </p>
                    <p className="text-[8px] text-neutral-400">{item.date} • {item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold ${item.amount < 0 ? 'text-neutral-800' : 'text-emerald-600'}`}>
                      {item.amount < 0 ? `- Rp ${Math.abs(item.amount).toLocaleString('id-ID')}` : `+ Rp ${item.amount.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-[8px] text-neutral-400 font-medium">{item.statusLabel}</p>
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
          <p className="text-neutral-500">Dana Anda sedang diproses oleh Payment Gateway dan akan masuk ke rekening dalam 1x24 jam. Status akan berubah menjadi "Berhasil" setelah bank mengonfirmasi.</p>
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