import { createContext, useCallback, useContext, useState } from 'react';

const TicketsContext = createContext(null);

/**
 * CATATAN LOGIKA: dulu ada data dummy (seedTickets) yang didefinisikan
 * lokal di dalam MyTickets.jsx, terpisah dari SearchTrip.jsx — akibatnya
 * tiket hasil booking baru tidak pernah muncul di "My Tickets" karena
 * masing-masing halaman punya state sendiri-sendiri. Sekarang keduanya
 * berbagi satu context yang sama.
 *
 * FIX (hapus dummy data): array contoh tiket (TKT-2026-001/002/003) sudah
 * dihapus. State dimulai kosong (`[]`) dan hanya terisi dari:
 * 1) booking nyata lewat addTicket() di SearchTrip.jsx, atau
 * 2) hasil fetch dari backend (GET /api/orders milik customer yang
 *    sedang login) — belum diwire karena endpoint-nya belum tersedia
 *    di scope ini. Sebelum backend siap, "My Tickets" akan menampilkan
 *    EmptyState yang jujur ("Belum Ada Tiket") alih-alih data fiktif.
 */

export function TicketsProvider({ children }) {
  const [tickets, setTickets] = useState([]);

  // Menambahkan tiket baru hasil booking (dipanggil dari SearchTrip.jsx
  // setelah PIN transaksi berhasil diverifikasi).
  const addTicket = useCallback((ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  }, []);

  // Memperbarui sebagian field tiket berdasarkan id (mis. saat user
  // mengirim rating & ulasan di MyTickets.jsx).
  const updateTicket = useCallback((id, patch) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const value = { tickets, addTicket, updateTicket };

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- pola context umum (Provider + hook satu file), konsisten dengan AuthContext & ToastContext
export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) {
    throw new Error('useTickets harus dipakai di dalam <TicketsProvider>');
  }
  return ctx;
}