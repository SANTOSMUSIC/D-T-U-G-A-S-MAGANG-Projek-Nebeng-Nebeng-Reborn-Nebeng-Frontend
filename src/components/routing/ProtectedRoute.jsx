import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Membungkus sebuah Route agar hanya bisa diakses oleh user yang sudah
 * login (dan, jika `allowedRoles` diisi, hanya role tertentu).
 *
 * Sebelum ada komponen ini, siapa pun bisa langsung mengetik URL seperti
 * `/admin/dashboard` tanpa login sama sekali. Sekarang akses tanpa sesi
 * valid akan otomatis diarahkan ke halaman login.
 *
 * Pengecekan validitas sesi masih di sisi client (localStorage) karena
 * belum ada backend untuk verifikasi token — begitu backend tersedia,
 * cukup tambahkan pengecekan token expiry / panggilan verifikasi di
 * `AuthContext`, komponen ini tidak perlu diubah.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
