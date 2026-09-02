import apiClient from './apiClient';

export async function getEscrowLedgerData() {
  const response = await apiClient.get('/admin/escrow/ledger');
  return response.data;
}