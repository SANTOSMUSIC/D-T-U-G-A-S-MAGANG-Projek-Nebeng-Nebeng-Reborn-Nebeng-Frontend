import apiClient from "./apiClient";

export const mitraService = {
    submitVerification: async (type, filesData) => {
        const response = await apiClient.post('/verifications/submit', {
            type,
            files: filesData,
        });
        return response.data;
    },

    createVehicle: async (vehicleData) => {
        const response = await apiClient.post('/vehicles', vehicleData);
        return response.data;
    },

    getMyVehicles: async () => {
        const response = await apiClient.get('/vehicles/me');
        return response.data;
    }
};