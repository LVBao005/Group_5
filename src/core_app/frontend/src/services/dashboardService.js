import axios from '../api/axios';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
const dashboardService = {
    /**
     * Get overall statistics
     */
    /**
     * Get overall statistics
     * @param {string} period - 'today', 'week', 'month', or 'all'
     */
    getStats: async (period = 'today') => {
        try {
            const response = await axios.get(`/dashboard/stats?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to load statistics'
            };
        }
    },

    /**
     * Get revenue timeline data
     * @param {string} period - 'today', 'week', or 'month'
     */
    getRevenueTimeline: async (period = 'today') => {
        try {
            const response = await axios.get(`/dashboard/revenue-timeline?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue timeline:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to load revenue timeline'
            };
        }
    },

    /**
     * Get revenue breakdown by category
     */
    getRevenueByCategory: async (period = 'all') => {
        try {
            const response = await axios.get(`/dashboard/revenue-by-category?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue by category:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to load category revenue'
            };
        }
    },

    /**
     * Get alerts (expiring medicines and low stock)
     */
    getAlerts: async () => {
        try {
            const response = await axios.get('/dashboard/alerts');
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to load alerts'
            };
        }
    },

    /**
     * Get real-time data for live updates
     */
    getRealtimeData: async () => {
        try {
            const response = await axios.get('/dashboard/realtime');
            return response.data;
        } catch (error) {
            console.error('Error fetching realtime data:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to load realtime data'
            };
        }
    }
};

export default dashboardService;
