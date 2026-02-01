import axios from 'axios';

const API_URL = '/api'; // Placeholder for backend root

/**
 * Service to handle pharmacy invoices
 */
export const invoiceService = {
    /**
     * Create a new invoice and its details
     * @param {Object} invoiceData - Object containing branch_id, pharmacist_id, customer_id, total_amount, and details array
     */
    createInvoice: async (invoiceData) => {
        try {
            console.log('Pushing invoice to backend:', invoiceData);

            // Relational Mapping for Backend:
            // The invoiceData should look like:
            // {
            //   branch_id: 1,
            //   pharmacist_id: 1,
            //   customer_id: 1,
            //   total_amount: 170000,
            //   is_simulated: false, // true for robot, false for real sales
            //   details: [
            //     {
            //       batch_id: 101,
            //       unit_sold: 'HỘP',
            //       quantity_sold: 1,
            //       unit_price: 120000,
            //       total_std_quantity: 100 // (1 Hộp * 100 conversion_rate)
            //     }
            //   ]
            // }

            const response = await axios.post(`${API_URL}/invoices`, invoiceData);
            return response.data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    /**
     * Get all invoices with full details
     * @param {Object} filters - Optional filters (dateFrom, dateTo, pharmacistId, isSimulated)
     * @returns {Promise<Array>} Array of invoices with details
     */
    getInvoices: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            if (filters.pharmacistId) params.append('pharmacistId', filters.pharmacistId);
            if (filters.isSimulated !== undefined) params.append('isSimulated', filters.isSimulated);
            
            const response = await axios.get(`${API_URL}/invoices?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    },

    /**
     * Get a single invoice by ID with full details including batch information
     * @param {number} invoiceId - The invoice ID
     * @returns {Promise<Object>} Invoice object with details and batch info
     */
    getInvoiceById: async (invoiceId) => {
        try {
            const response = await axios.get(`${API_URL}/invoices/${invoiceId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            throw error;
        }
    },

    /**
     * Get invoice statistics
     * @param {Object} filters - Optional filters (dateFrom, dateTo)
     * @returns {Promise<Object>} Statistics object
     */
    getInvoiceStats: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            
            const response = await axios.get(`${API_URL}/invoices/stats?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching invoice stats:', error);
            throw error;
        }
    },

    /**
     * Search invoices by various criteria
     * @param {string} searchTerm - Search term (invoice ID, pharmacist name, customer name)
     * @returns {Promise<Array>} Array of matching invoices
     */
    searchInvoices: async (searchTerm) => {
        try {
            const response = await axios.get(`${API_URL}/invoices/search`, {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching invoices:', error);
            throw error;
        }
    }
};
