import apiClient from './apiClient';

export async function getAllRegions(
  page = 1,
  limit = 10,
  onlyActive = false
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (onlyActive) {
    params.append('onlyActive', 'true');
  }

  const response = await apiClient.get(`/regions?${params.toString()}`);

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