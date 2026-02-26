import axios from '../api/axios';

export const inventoryService = {
    getInventoryByBranch: async (branchId = 1) => {
        try {
            const response = await axios.get(`/inventory?branchId=${branchId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw error;
        }
    },

    getCentralBatches: async () => {
        try {
            const response = await axios.get('/inventory?action=centralBatches');
            return response.data;
        } catch (error) {
            console.error('Error fetching central batches:', error);
            throw error;
        }
    },

    importStock: async (branchId, batchId, quantity) => {
        try {
            const response = await axios.post('/inventory?action=import', {
                branchId,
                batchId,
                quantity
            });
            return response.data;
        } catch (error) {
            console.error('Error importing stock:', error);
            throw error;
        }
    },

    // Placeholder for future CSV import implementation
    importCSV: async (file, branchId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('branchId', branchId);

        try {
            const response = await axios.post('/inventory/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error importing CSV:', error);
            throw error;
        }
    }
};
