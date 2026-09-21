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
let tripCounter = 702;
function nextTripId() {
  tripCounter += 1;
  return `TRIP-${tripCounter}`;
}

let withdrawalCounter = 401;
function nextWithdrawalId() {
  withdrawalCounter += 1;
  return `WD-${withdrawalCounter}`;
}

let incomeCounter = 882;
function nextIncomeId() {
  incomeCounter += 1;
  return `IN-${incomeCounter}`;
}

const initialTrips = [
  {
    id: 'TRIP-701',
    origin: 'Solo (Pos Pusat)',
    destination: 'Yogyakarta',
    date: '2026-09-03',
    time: '08:00',
    vehicle: 'Motor',
    seats: 1,
    luggage: 15,
    estimation: estimateFare('Solo (Pos Pusat)', 'Yogyakarta', 'Motor'),
    status: 'In Transit',
    escrowAmount: 750000,
  },
  {
    id: 'TRIP-702',
    origin: 'Solo',
    destination: 'Semarang',
    date: '2026-09-04',
    time: '10:00',
    vehicle: 'Mobil',
    seats: 4,
    luggage: 45,
    estimation: estimateFare('Solo', 'Semarang', 'Mobil'),
    status: 'Aktif',
    escrowAmount: 500000,
  },
  // Riwayat trip yang sudah selesai (dananya sudah cair, tidak masuk hitungan escrow)
  {
    id: 'TRIP-498',
    origin: 'Solo',
    destination: 'Surabaya',
    date: '2026-08-31',
    time: '09:00',
    vehicle: 'Mobil',
    seats: 4,
    luggage: 40,
    estimation: 350000,
    status: 'Selesai',
    escrowAmount: 0,
    rating: 5.0,
  },
  {
    id: 'TRIP-497',
    origin: 'Solo',
    destination: 'Madiun',
    date: '2026-08-16',
    time: '09:00',
    vehicle: 'Motor',
    seats: 1,
    luggage: 15,
    estimation: 200000,
    status: 'Selesai',
    escrowAmount: 0,
    rating: 4.8,
  },
];

const initialHistory = [
  { id: 'WD-401', date: '20 Agu 2026', type: 'Pencairan (Withdrawal)', amount: -2500000, status: 'success', statusLabel: 'Berhasil ke BCA' },
  { id: 'IN-882', date: '19 Agu 2026', type: 'Komisi Trip TRIP-699', amount: 1400000, status: 'success', statusLabel: 'Masuk ke Available Balance' },
];

export function MitraDataProvider({ children }) {
  const [trips, setTrips] = useState(initialTrips);
  const [availableBalance, setAvailableBalance] = useState(3850000);
  const [walletHistory, setWalletHistory] = useState(initialHistory);
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountHolder: 'Budi Santoso (Mitra)',
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