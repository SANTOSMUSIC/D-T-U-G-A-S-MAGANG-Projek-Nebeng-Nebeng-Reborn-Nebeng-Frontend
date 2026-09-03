import apiClient from './apiClient';

export async function getAllUsers(page = 1, limit = 50) {
  const response = await apiClient.get('/users', {
    params: { page, limit },
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