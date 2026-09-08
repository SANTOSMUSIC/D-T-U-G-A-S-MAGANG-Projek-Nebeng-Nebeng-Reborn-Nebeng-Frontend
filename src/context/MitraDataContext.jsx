import { createContext, useContext, useState, useCallback } from 'react';

const MitraDataContext = createContext(null);

/**
 * Tabel estimasi tarif berdasarkan pasangan rute & jenis kendaraan.
 * Kalau kombinasi rute belum terdaftar, dipakai DEFAULT_PRICING sebagai fallback
 * supaya tetap ada angka yang masuk akal (bukan disamaratakan seperti sebelumnya).
 */
const ROUTE_PRICING = {
  'Solo (Pos Pusat)|Yogyakarta': { Motor: 175000, Mobil: 450000 },
  'Solo (Pos Pusat)|Semarang': { Motor: 150000, Mobil: 400000 },
  'Solo (Pos Pusat)|Surabaya': { Motor: 280000, Mobil: 650000 },
  'Solo|Semarang': { Motor: 150000, Mobil: 400000 },
  'Solo|Surabaya': { Motor: 280000, Mobil: 650000 },
  'Solo|Yogyakarta': { Motor: 175000, Mobil: 450000 },
};
const DEFAULT_PRICING = { Motor: 175000, Mobil: 450000 };

export function estimateFare(origin, destination, vehicle) {
  const direct = ROUTE_PRICING[`${origin}|${destination}`];
  const reverse = ROUTE_PRICING[`${destination}|${origin}`];
  const table = direct || reverse || DEFAULT_PRICING;
  return table[vehicle] ?? DEFAULT_PRICING[vehicle] ?? DEFAULT_PRICING.Motor;
}

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
    if (!amount || amount > availableBalance) {
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

export function useMitraData() {
  const ctx = useContext(MitraDataContext);
  if (!ctx) {
    throw new Error('useMitraData harus dipakai di dalam <MitraDataProvider>');
  }
  return ctx;
}