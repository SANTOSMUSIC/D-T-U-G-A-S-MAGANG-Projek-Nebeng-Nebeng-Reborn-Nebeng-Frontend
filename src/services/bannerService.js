import apiClient from './apiClient';

export const bannerService = {
  // Public/All users
  getBanners: async (role) => {
    const params = role ? { role } : {};
    const response = await apiClient.get('/banners', { params });
    return response.data;
  },

  getBannerById: async (id) => {
    const response = await apiClient.get(`/banners/${id}`);
    return response.data;
  },

  // Admin only
  createBanner: async (data) => {
    const response = await apiClient.post('/banners', data);
    return response.data;
  },

  updateBanner: async (id, data) => {
    const response = await apiClient.patch(`/banners/${id}`, data);
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await apiClient.delete(`/banners/${id}`);
    return response.data;
  },

  uploadBannerImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/uploads/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { filePath, fileType }
  },
};
