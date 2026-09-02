import apiClient from './apiClient';

export async function getAllRegions(onlyActive = false) {
  const response = await apiClient.get(`/regions${onlyActive ? '?onlyActive=true' : ''}`);
  return response.data;
}

export async function createRegion(data) {
  const response = await apiClient.post('/regions', data);
  return response.data;
}

export async function updateRegion(id, data) {
  const response = await apiClient.patch(`/regions/${id}`, data);
  return response.data;
}

export async function getAllCities() {
  const response = await apiClient.get('/cities');
  return response.data;
}