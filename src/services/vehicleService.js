import apiClient from "./apiClient";

export const vehicleService = {
    createVehicle: async (data) => {
        const response = await apiClient.post('/vehicles', data);
        return response.data;
    },

    getMyVehicles: async () => {
        const response = await apiClient.get('/vehicles/me');
        return response.data;
    },

    getVehicleById: async (id) => {
        const response = await apiClient.get(`/vehicles/${id}`);
        return response.data;
    },

    updateVehicle: async (id, data) => {
        const response = await apiClient.patch(`/vehicles/${id}`, data);
        return response.data;
    },

    deleteVehicle: async (id) => {
        const response = await apiClient.delete(`vehicles/${id}`);
        return response.data;
    }
}