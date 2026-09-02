import apiClient from './apiClient';

// Memperbarui persentase komisi platform global di database
export async function updatePlatformCommission(commissionPercentage) {
  const response = await apiClient.patch('/admin/settings/commission', { commissionPercentage });
  return response.data;
}

// Memperbarui tarif per KM wilayah tertentu
export async function updateRegionRate(regionId, pricePerKm) {
  const response = await apiClient.patch(`/admin/regions/${regionId}/rate`, { pricePerKm });
  return response.data;
}

// Memperbarui pengaturan poin reward / fare per kg
export async function updateRewardSetting(pointsMultiplier) {
  const response = await apiClient.patch('/admin/settings/rewards', { pointsMultiplier });
  return response.data;
}