// FIX: berbagai halaman regional membandingkan `regionId` milik record
// (pos, user/mitra, operator) dengan `regionId` milik admin yang login
// untuk memutuskan apakah record itu boleh ditampilkan. Sebelumnya setiap
// halaman menebak bentuk field ini sendiri-sendiri (kadang cuma `regionId`
// langsung, kadang `region?.id`), padahal backend bisa saja mengirim
// bentuk lain seperti `region_id` (snake_case) atau `regionID`.
// Kalau bentuknya tidak sesuai dugaan, hasilnya `undefined`/`null` dan
// filter wilayah jadi tidak berfungsi sama sekali (semua data lolos atau
// semua tersaring habis) — gejalanya persis seperti "region masih bisa
// saling melihat data region lain".
//
// getRegionId() mencoba semua kemungkinan bentuk yang umum dipakai REST
// API, supaya filter wilayah tetap jalan walau backend memakai penamaan
// yang sedikit berbeda dari yang diasumsikan frontend.
export function getRegionId(obj) {
  if (!obj) return null;

  const candidate =
    obj.regionId ??
    obj.region_id ??
    obj.regionID ??
    obj.region?.id ??
    obj.region?.regionId ??
    null;

  return candidate !== null && candidate !== undefined ? String(candidate) : null;
}
