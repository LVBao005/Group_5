import axios from '../api/axios';

export const medicineService = {
    getAllMedicines: async () => {
        try {
            const response = await axios.get('/medicines');
            return response.data;
        } catch (error) {
            console.error('Error fetching medicines:', error);
            throw error;
        }
    },

    searchMedicines: async (query) => {
        try {
            const response = await axios.get(`/medicines?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching medicines:', error);
            throw error;
        }
    },

    getMedicineById: async (id) => {
        try {
            const response = await axios.get(`/medicines/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching medicine details:', error);
            throw error;
        }
    }
};
