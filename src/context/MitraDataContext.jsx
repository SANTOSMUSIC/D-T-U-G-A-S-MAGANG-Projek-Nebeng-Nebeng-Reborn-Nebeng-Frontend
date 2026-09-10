import { useState, useCallback } from 'react';
import { estimateFare } from '../services/mitraPricing';
import { MitraDataContext } from './mitraDataContextObject';

// Counter internal untuk ID unik, tidak bergantung pada panjang array
// (aman walau ada trip yang dibatalkan/dihapus).
// FIX (hapus dummy data): counter dulu mulai dari angka yang sengaja
// "menyambung" ID trip/transaksi contoh di bawah (702, 401, 882). Sekarang
// data contoh sudah dihapus, jadi counter mulai dari 0 seperti akun baru
// yang sungguhan belum punya trip/transaksi sama sekali.
let tripCounter = 0;
function nextTripId() {
  tripCounter += 1;
  return `TRIP-${tripCounter}`;
}

let withdrawalCounter = 0;
function nextWithdrawalId() {
  withdrawalCounter += 1;
  return `WD-${withdrawalCounter}`;
}

let incomeCounter = 0;
function nextIncomeId() {
  incomeCounter += 1;
  return `IN-${incomeCounter}`;
}

// FIX (hapus dummy data): sebelumnya ada 4 trip contoh (TRIP-701, 702,
// 498, 497) lengkap dengan escrow & rating fiktif, yang selalu tampil di
// Dashboard/Trip Management/QR/Balance sejak akun baru pertama login.
// Sekarang mitra baru mulai dari kosong — trip hanya muncul setelah
// benar-benar dibuat lewat addTrip() (form "Kelola Trip & Jadwal"), atau
// nanti lewat fetch dari backend (GET /api/trips milik mitra yang login).
const initialTrips = [];

const initialHistory = [];

export function MitraDataProvider({ children }) {
  const [trips, setTrips] = useState(initialTrips);
  // FIX (hapus dummy data): saldo dulu mulai dari Rp 3.850.000 padahal
  // schema-nya (model Wallet) mendefinisikan balance default 0.00 untuk
  // wallet baru. Rekening bank juga dulu sudah terisi contoh ("Budi
  // Santoso" / BCA / 1234567890) padahal itu data milik mitra lain, bukan
  // milik akun yang sedang login. Sekarang keduanya mulai kosong/0, sama
  // seperti mitra baru yang benar-benar belum pernah bertransaksi.
  const [availableBalance, setAvailableBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState(initialHistory);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  // Escrow hold dihitung otomatis dari trip yang masih berjalan — satu sumber
  // kebenaran, jadi tidak akan berbeda antara Dashboard, Balance, dan QR lagi.
  const escrowHold = trips
    .filter((t) => t.status === 'Aktif' || t.status === 'In Transit')
    .reduce((sum, t) => sum + (t.escrowAmount || 0), 0);

  const addTrip = useCallback((formData) => {
    const fare = estimateFare(formData.origin, formData.destination, formData.vehicle);
    const newTrip = {
      ...formData,
      id: nextTripId(),
      estimation: fare,
      status: 'Aktif',
      escrowAmount: fare,
    };
    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  }, []);

  const cancelTrip = useCallback((tripId) => {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Dibatalkan' } : t)));
  }, []);

  const updateTripStatus = useCallback((tripId, nextStatus) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: nextStatus } : t)));

    // Saat trip ditandai Selesai, escrow otomatis cair ke Available Balance
    // dan tercatat di riwayat mutasi — sebelumnya ini terputus sama sekali.
    if (nextStatus === 'Selesai') {
      setAvailableBalance((bal) => bal + (trip.escrowAmount || 0));
      setWalletHistory((hist) => [
        {
          id: nextIncomeId(),
          date: 'Hari ini',
          type: `Komisi Trip ${tripId}`,
          amount: trip.escrowAmount || 0,
          status: 'success',
          statusLabel: 'Masuk ke Available Balance (Escrow Cair)',
        },
        ...hist,
      ]);
    }
  }, [trips]);

  const requestWithdrawal = useCallback((amount) => {
    // BUG FIX (guard berlapis): sebelumnya hanya `!amount || amount >
    // availableBalance` yang dicek. Nilai negatif (mis. -100) lolos dari
    // kedua kondisi itu (truthy, dan tidak lebih besar dari saldo), lalu
    // `setAvailableBalance((bal) => bal + amount)` di bawah justru MENGURANGI
    // saldo dengan angka negatif = balance bertambah alih-alih berkurang.
    // UI (MitraBalance.jsx) memang sudah membatasi input hanya digit, tapi
    // requestWithdrawal juga dipakai langsung sebagai satu-satunya sumber
    // kebenaran saldo, jadi validasi harus tetap ketat di sini juga.
    if (!amount || amount <= 0 || amount > availableBalance) {
      return { ok: false, reason: 'insufficient' };
    }
    setAvailableBalance((prev) => prev - amount);
    const id = nextWithdrawalId();
    const newTx = {
      id,
      date: 'Hari ini',
      type: 'Pencairan (Withdrawal)',
      amount: -amount,
      status: 'processing',
      statusLabel: `Diproses ke ${bankInfo.bankName}`,
    };
    setWalletHistory((prev) => [newTx, ...prev]);

    // Simulasi konfirmasi payment gateway. Di backend nyata ini akan
    // datang lewat webhook, bukan setTimeout — cukup untuk demo agar
    // status "Diproses" tidak langsung berubah jadi "Berhasil".
    setTimeout(() => {
      setWalletHistory((prev) => prev.map((tx) => (
        tx.id === id ? { ...tx, status: 'success', statusLabel: `Berhasil ke ${bankInfo.bankName}` } : tx
      )));
    }, 4000);

    return { ok: true, id };
  }, [availableBalance, bankInfo.bankName]);

  const value = {
    trips,
    availableBalance,
    escrowHold,
    walletHistory,
    bankInfo,
    setBankInfo,
    addTrip,
    cancelTrip,
    updateTripStatus,
    requestWithdrawal,
  };

  return (
    <MitraDataContext.Provider value={value}>
      {children}
    </MitraDataContext.Provider>
  );
}