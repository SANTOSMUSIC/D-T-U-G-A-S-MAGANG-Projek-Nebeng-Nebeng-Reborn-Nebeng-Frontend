import apiClient from "./apiClient";

export const verificationService = {
  // Submit dokumen verifikasi (Onboarding Mitra / Customer)
  submitVerification: async (data) => {
    // Format payload: { type: 'ktp' | 'sim' | 'skck' | 'stnk', files: [{ filePath, fileType }] }
    const response = await apiClient.post('/verifications/submit', data);
    return response.data;
  },

  // Lihat daftar verifikasi (Admin / Regional)
  getAllVerifications: async (status) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/verifications', { params });
    return response.data;
  },

  // Lihat detail verifikasi
  getVerificationById: async (id) => {
    const response = await apiClient.get(`/verifications/${id}`);
    return response.data;
  },

  // Review / Approve / Reject verifikasi (Admin / Regional)
  reviewVerification: async (id, data) => {
    // Format payload: { status: 'approved' | 'rejected', rejectionReason?: string }
    const response = await apiClient.patch(`/verifications/${id}/review`, data);
    return response.data;
  },
};