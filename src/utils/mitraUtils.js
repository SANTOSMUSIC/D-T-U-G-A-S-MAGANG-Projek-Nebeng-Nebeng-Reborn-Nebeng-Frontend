/**
 * Tabel estimasi tarif berdasarkan pasangan rute & jenis kendaraan.
 */
export const ROUTE_PRICING = {
  'Solo (Pos Pusat)|Yogyakarta': { Motor: 175000, Mobil: 450000 },
  'Solo (Pos Pusat)|Semarang': { Motor: 150000, Mobil: 400000 },
  'Solo (Pos Pusat)|Surabaya': { Motor: 280000, Mobil: 650000 },
  'Solo|Semarang': { Motor: 150000, Mobil: 400000 },
  'Solo|Surabaya': { Motor: 280000, Mobil: 650000 },
  'Solo|Yogyakarta': { Motor: 175000, Mobil: 450000 },
};

export const DEFAULT_PRICING = { Motor: 175000, Mobil: 450000 };

export function estimateFare(origin, destination, vehicle) {
  const direct = ROUTE_PRICING[`${origin}|${destination}`];
  const reverse = ROUTE_PRICING[`${destination}|${origin}`];
  const table = direct || reverse || DEFAULT_PRICING;
  return table[vehicle] ?? DEFAULT_PRICING[vehicle] ?? DEFAULT_PRICING.Motor;
}

let tripCounter = 702;
export function nextTripId() {
  tripCounter += 1;
  return `TRIP-${tripCounter}`;
}

let withdrawalCounter = 401;
export function nextWithdrawalId() {
  withdrawalCounter += 1;
  return `WD-${withdrawalCounter}`;
}

let incomeCounter = 882;
export function nextIncomeId() {
  incomeCounter += 1;
  return `IN-${incomeCounter}`;
}

export const initialTrips = [
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

export const initialHistory = [
  { id: 'WD-401', date: '20 Agu 2026', type: 'Pencairan (Withdrawal)', amount: -2500000, status: 'success', statusLabel: 'Berhasil ke BCA' },
  { id: 'IN-882', date: '19 Agu 2026', type: 'Komisi Trip TRIP-699', amount: 1400000, status: 'success', statusLabel: 'Masuk ke Available Balance' },
];