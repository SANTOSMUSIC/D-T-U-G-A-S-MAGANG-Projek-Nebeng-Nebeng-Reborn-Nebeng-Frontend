
/**
 * Skeleton dasar — kotak abu-abu berkedip (pulse) sebagai placeholder
 * selagi data asli sedang dimuat dari API.
 *
 * Contoh pakai:
 *   <Skeleton className="h-4 w-24" />
 *   <Skeleton className="h-10 w-10 rounded-full" />
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Memuat data"
      className={`animate-pulse bg-gray-200/80 rounded-lg ${className}`}
    />
  );
}

/**
 * Skeleton untuk kartu metrik/statistik (mengikuti bentuk kartu
 * di SuperadminDashboard: label kecil, ikon, angka besar, footer).
 */
export function SkeletonStatCard() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="pt-3 border-t border-gray-100">
        <Skeleton className="h-5 w-20 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton untuk satu baris tabel. Kolom disesuaikan lewat prop `columns`
 * (jumlah kolom) supaya bisa dipakai ulang di tabel manapun.
 */
export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-6">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Beberapa baris skeleton sekaligus — dipakai sebagai isi <tbody>
 * selagi data tabel dimuat.
 */
export function SkeletonTableRows({ rows = 4, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </>
  );
}
