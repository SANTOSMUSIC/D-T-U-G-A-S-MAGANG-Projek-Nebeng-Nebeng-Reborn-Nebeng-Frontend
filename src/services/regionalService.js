import apiClient from './apiClient';

export const regionalService = {
  // Dashboard Regional
  getRegionalDashboard: async (regionId) => {
    const params = regionId ? { regionId } : {};
    const response = await apiClient.get('/admin/dashboard/regional', { params });
    return response.data;
  },

  // Pickup Points (Pos Mitra)
  getPickupPoints: async (regionId) => {
    const response = await apiClient.get('/pickup-points', {
      params: { regionId, onlyActive: true }
    });
    return response.data;
  },
  createPickupPoint: async (data) => {
    const response = await apiClient.post('/pickup-points', data);
    return response.data;
  },
  updatePickupPoint: async (id, data) => {
    const response = await apiClient.patch(`/pickup-points/${id}`, data);
    return response.data;
  },
  deletePickupPoint: async (id) => {
    const response = await apiClient.patch(`/pickup-points/${id}`, { isActive: false });
    return response.data;
  },

  // Manajemen Operator / Users
  getOperators: async (role = 'operator') => {
    const response = await apiClient.get('/users', {
      params: { role }
    });
    return response.data;
  },
  createOperator: async (data) => {
    const response = await apiClient.post('/users', { ...data, role: 'operator' });
    return response.data;
  },
  updateOperatorStatus: async (id, status) => {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  // Verifikasi Dokumen & Trip
  getVerifications: async (status = 'pending') => {
    const response = await apiClient.get('/verifications', { params: { status } });
    return response.data;
  },
  getTrips: async (filters) => {
    const response = await apiClient.get('/trips', { params: filters });
    return response.data;
  }
};