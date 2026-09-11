import { useState, useCallback, useContext } from 'react';
import { estimateFare } from '../services/mitraPricing';
import { MitraDataContext } from './mitraDataContextObject';

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

const initialTrips = [];

const initialHistory = [];

export function MitraDataProvider({ children }) {
  const [trips, setTrips] = useState(initialTrips);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState(initialHistory);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });


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
    throw new Error('useMitraData must be used within a MitraDataProvider');
  }
  return ctx;
}