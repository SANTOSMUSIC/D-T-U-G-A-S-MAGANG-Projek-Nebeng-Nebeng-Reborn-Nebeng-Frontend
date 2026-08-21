import { useState, useEffect } from 'react';

/**
 * Hook simulasi state loading untuk halaman yang masih memakai data dummy.
 *
 * Dipusatkan di satu tempat (bukan diulang manual di tiap halaman) supaya:
 *  1. Kode lebih ringkas & konsisten (durasi delay seragam).
 *  2. Saat backend API sudah siap, cukup ganti ISI hook ini (atau ganti
 *     pemanggilannya) dengan `isLoading` dari React Query — komponen
 *     pemanggil tidak perlu diubah sama sekali.
 *
 * @param {Array} deps - dependency array, sama seperti useEffect (mis. [searchTerm, statusFilter])
 * @param {number} delay - durasi simulasi loading dalam ms (default 700ms)
 * @returns {boolean} isLoading
 */
export function useSimulatedLoading(deps = [], delay = 700) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sengaja mereset ke true setiap kali filter/kriteria berubah, untuk
    // mensimulasikan efek "memuat ulang data dari server".
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simulasi loading data dummy; akan digantikan isLoading dari React Query saat backend API tersedia
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return isLoading;
}
