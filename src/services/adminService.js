import apiClient from './apiClient';

/**
 * Mengambil data analitik global dashboard untuk Superadmin.
 * Mengacu pada endpoint backend: GET /api/admin/dashboard/global
 */
export async function getGlobalDashboard() {
  try {
    // Menggunakan path relatif '/admin/dashboard/global' karena baseURL apiClient sudah mengarah ke '/api'
    const response = await apiClient.get('/admin/dashboard/global');
    console.log('Global Dashboard Response:', response.data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Gagal mengambil data global dashboard:', error);
    throw error;
  }
}

/**
 * Mengambil buku besar audit Escrow (Superadmin Only).
 * Mengacu pada endpoint backend: GET /api/admin/escrow/ledger
 */
export async function getEscrowLedger() {
  try {
    // Menggunakan path relatif '/admin/escrow/ledger'
    const response = await apiClient.get('/admin/escrow/ledger');
    console.log('Escrow Ledger Response:', response.data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Gagal mengambil audit escrow ledger:', error);
    throw error;
  }
}