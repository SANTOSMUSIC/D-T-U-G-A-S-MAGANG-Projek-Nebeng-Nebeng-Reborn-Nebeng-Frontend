// BUG FIX (logika lintas role Regional -> Operator): akun Operator Pos
// dibuat oleh Admin Regional di OperatorPosManagement.jsx, lalu
// ditugaskan ke sebuah Pos lewat field `operatorId` di form Pos pada
// PosMitraManagement.jsx (lihat relasi `assignedPickupPoints` yang sudah
// dipakai untuk MENAMPILKAN pos penugasan di beberapa halaman Regional).
// Namun sebelumnya, identitas "pos tempat bertugas" ini TIDAK PERNAH
// disimpan ke sesi login Operator (beda dengan regionId milik Admin
// Regional yang sudah diambil lewat getRegionId()/authService.js).
//
// Akibatnya setiap layar Operator (Dual Scanner, Inspection, Handover)
// membiarkan operator mengetik ID Pos secara manual/bebas (bahkan
// default ke '1'), sehingga seorang Operator bisa saja check-in/
// melepas escrow untuk Pos MANAPUN, bukan cuma pos tempat dia
// ditugaskan — ini pelanggaran batas wewenang antar role yang cukup
// serius (Operator seharusnya terkunci ke pos-nya sendiri).
//
// getAssignedPos() mencoba semua bentuk field yang mungkin dikirim
// backend untuk relasi user -> pos (mirip pola getRegionId()), supaya
// posId ini bisa diisi otomatis & dikunci di form, bukan diketik bebas.
export function getAssignedPos(obj) {
  if (!obj) return { id: null, name: null };

  const fromArray =
    Array.isArray(obj.assignedPickupPoints) && obj.assignedPickupPoints.length > 0
      ? obj.assignedPickupPoints[0]
      : null;

  const source = obj.pickupPoint ?? obj.pos ?? fromArray ?? null;

  const candidateId =
    obj.posId ??
    obj.pickupPointId ??
    source?.id ??
    null;

  const name = obj.posName ?? source?.name ?? null;

  return {
    id: candidateId !== null && candidateId !== undefined ? String(candidateId) : null,
    name: name ?? null,
  };
}
