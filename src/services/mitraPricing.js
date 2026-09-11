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