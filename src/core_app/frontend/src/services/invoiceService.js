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
     * Get invoice history (Optional helper)
     */
    getInvoices: async () => {
        const response = await axios.get(`${API_URL}/invoices`);
        return response.data;
    }
};
