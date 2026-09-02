import apiClient from './apiClient';

export async function getEscrowLedgerData(page = 1, limit = 20) {
  const response = await apiClient.get('/admin/escrow/ledger', {
    params: { page, limit },
  });
  return response.data?.data || response.data;
}