import apiClient from './apiClient';

export async function getAllUsers(page = 1, limit = 15, search = '', status = 'All', role = '') {
  const response = await apiClient.get('/users', {
    params: { page, limit, search, status, role },
  });
  return response.data;
}

export async function createUser(data) {
  const response = await apiClient.post('/users', data);
  return response.data;
}

export async function updateUser(id, data) {
  const response = await apiClient.patch(`/users/${id}`, data);
  return response.data;
}

export async function updateUserStatus(id, status) {
  const response = await apiClient.patch(`/users/${id}/status`, { status });
  return response.data;
}

// Mengambil profil akun yang sedang login (/auth/me)
export async function getMyProfile() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

// Memperbarui profil dasar akun sendiri (/users/me)
export async function updateMyProfile(payload) {
  const response = await apiClient.patch('/users/me', payload);
  return response.data;
}

// Mengunggah avatar / foto profil (/users/me/avatar)
export async function uploadMyAvatar(formData) {
  const response = await apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// Mengubah kata sandi akun sendiri (/auth/change-password)
export async function changeMyPassword(payload) {
  const response = await apiClient.patch('/auth/change-password', payload);
  return response.data;
}

// Menjalankan aksi Super-Override Governance (Suspend / Block / Active dengan Alasan Audit)
export async function updateUserGovernance(id, status, reason) {
  const response = await apiClient.patch(`/admin/users/${id}/governance`, { status, reason });
  return response.data;
}

export async function getUserStats() {
  const response = await apiClient.get('/users/stats');
  return response.data;
}