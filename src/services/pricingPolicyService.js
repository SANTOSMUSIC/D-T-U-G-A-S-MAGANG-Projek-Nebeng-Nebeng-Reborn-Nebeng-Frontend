import apiClient from './apiClient';

export async function updatePricingPolicy(payload) {
  // Menyesuaikan dengan endpoint backend untuk komisi dan tarif
  const response = await apiClient.patch('/admin/settings/commission', {
    commissionPercentage: payload.rideFeePercent
  });
  return response.data;
}

export async function updateRewardPolicy(pointsMultiplier) {
  const response = await apiClient.patch('/admin/settings/rewards', {
    pointsMultiplier
  });
  return response.data;
}

export async function updateCompletePricingPolicy(payload) {
  const response = await apiClient.patch('/admin/settings/pricing-policy', payload);
  return response.data;
}