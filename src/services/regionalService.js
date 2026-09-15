import apiClient from './apiClient';

export const regionalService = {
  getRegionalDashboard: async (regionId) => {
    const params = regionId ? { regionId } : {};
    const response = await apiClient.get('/admin/dashboard/regional', { params });
    return response.data;
  },

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

  getOperators: async (role = 'operator') => {
    const response = await apiClient.get('/users', { params: { role } });
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

  getVerifications: async (status, regionId) => {
    const params = {};
    if (status) params.status = status;
    if (regionId) params.regionId = regionId;
    
    const response = await apiClient.get('/verifications', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  getTrips: async (filters) => {
    const response = await apiClient.get('/trips', { params: filters });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },
  getUsersByRole: async (role, regionId) => {
    const params = { role };
    if (regionId) params.regionId = regionId;
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  // CATATAN: sengaja TIDAK mengirim param regionId ke /vehicles.
  // Vehicle dimiliki oleh akun mitra perorangan dan tidak punya kolom regionId
  // sendiri yang bisa diandalkan di backend — memfilter di sini terbukti membuat
  // backend mengembalikan list kosong/tidak lengkap walau mitra sudah update kendaraan.
  // Scoping wilayah tetap aman karena kita join vehicle ke daftar mitra yang SUDAH
  // difilter per region lewat getUsersByRole (lihat ArmadaPage.jsx).
  getVehicles: async () => {
    const response = await apiClient.get('/vehicles');
    return response.data;
  },
  getPayments: async (regionId) => {
    const params = regionId ? { regionId } : {};
    const response = await apiClient.get('/payments', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },
  reviewVerification: async (id, status, rejectionReason) => {
    const payload = { status };
    if (rejectionReason) payload.rejectionReason = rejectionReason;
    
    const response = await apiClient.patch(`/verifications/${id}/review`, payload);
    return response.data;
  },
};