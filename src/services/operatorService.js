import apiClient from './apiClient';

export const operatorService = {
  
  getTrips: async (params = {}) => {
    const response = await apiClient.get('/trips', { params }).catch(() => ({ data: [] }));
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getPayments: async () => {
    const response = await apiClient.get('/payments/operator-summary');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  }, 

  
  scanCheckpoint: async (payload) => {
    const response = await apiClient.post('/checkpoints/scan', payload);
    return response.data;
  },

  
  manualForceRelease: async (payload) => {
    const response = await apiClient.post('/checkpoints/manual-force-release', payload);
    return response.data;
  }
};