import apiClient from './apiClient';

/**
 * Mengambil data analitik global dashboard untuk Superadmin.
 * Mengacu pada endpoint backend: GET /api/admin/dashboard/global
 */
export async function getGlobalDashboard() {
  try {
    const response = await apiClient.get('/admin/dashboard/global');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Gagal mengambil data global dashboard:', error);
    throw error;
  }
}

/**
 * Mengambil buku besar audit Escrow (Superadmin Only) dengan dukungan Paginasi.
 * Mengacu pada endpoint backend: GET /api/admin/escrow/ledger?page=1&limit=20
 */
export async function getEscrowLedger(page = 1, limit = 20) {
  try {
    const response = await apiClient.get('/admin/escrow/ledger', {
      params: { page, limit },
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Gagal mengambil audit escrow ledger:', error);
    throw error;
  }
}