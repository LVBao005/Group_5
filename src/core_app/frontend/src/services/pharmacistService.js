import axios from '../api/axios';

/**
 * Service to handle pharmacist related operations
 */
export const pharmacistService = {
    /**
     * Get all pharmacists
     */
    getAllPharmacists: async () => {
        try {
            const response = await axios.get('/pharmacists');
            return response.data;
        } catch (error) {
            console.error('Error fetching pharmacists:', error);
            throw error;
        }
    },

    /**
     * Get pharmacist by ID
     */
    getPharmacistById: async (id) => {
        try {
            const response = await axios.get(`/pharmacists?id=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching pharmacist:', error);
            throw error;
        }
    },

    /**
     * Update pharmacist info (Full name, Role, Branch)
     */
    updatePharmacist: async (pharmacistData) => {
        try {
            const response = await axios.put('/pharmacists', pharmacistData);
            return response.data;
        } catch (error) {
            console.error('Error updating pharmacist:', error);
            throw error;
        }
    },

    /**
     * Delete pharmacist account
     */
    deletePharmacist: async (id) => {
        try {
            const response = await axios.delete(`/pharmacists?id=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting pharmacist:', error);
            throw error;
        }
    }
};
