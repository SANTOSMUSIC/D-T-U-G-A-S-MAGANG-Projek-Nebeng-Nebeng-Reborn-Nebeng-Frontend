import apiClient from './apiClient';

export const operatorService = {
  // Mengambil daftar trip / jadwal operasional pos[cite: 27]
  getTrips: async (params = {}) => {
    const response = await apiClient.get('/trips', { params }).catch(() => ({ data: [] }));
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getPayments: async () => {
    const response = await apiClient.get('/payments/operator-summary');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  }, 

  // Melakukan scan QR Checkpoint di Pos Asal atau Pos Tujuan (Mendukung Sealing & Validasi)[cite: 31, 32, 33]
  scanCheckpoint: async (payload) => {
    const response = await apiClient.post('/checkpoints/scan', payload);
    return response.data;
  },

  // Intervensi darurat: Force Complete & Release Escrow manual oleh Operator Pos[cite: 31, 32, 33]
  manualForceRelease: async (payload) => {
    const response = await apiClient.post('/checkpoints/manual-force-release', payload);
    return response.data;
  }
};