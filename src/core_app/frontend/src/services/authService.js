import axios from '../api/axios';

/**
 * Authentication Service
 * Handles login, logout, and session management
 */
export const authService = {
    /**
     * Login with username and password
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>} User data
     */
    login: async (username, password) => {
        try {
            const response = await axios.post('/login', {
                username,
                password
            });

            if (response.data.success) {
                // Store user info in localStorage
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('pharmacistId', user.pharmacistId || user.pharmacist_id);
                localStorage.setItem('username', user.username);
                localStorage.setItem('role', user.role);
                localStorage.setItem('branchId', user.branchId || user.branch_id);
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw { success: false, error: 'Không thể kết nối đến server' };
        }
    },

    /**
     * Logout current user
     */
    logout: async () => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear localStorage regardless of API response
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('pharmacistId');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            localStorage.removeItem('branchId');
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: () => {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null}
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    /**
     * Check current session from server
     */
    checkSession: async () => {
        try {
            const response = await axios.get('/login');
            return response.data;
        } catch (error) {
            console.error('Session check error:', error);
            return { success: false };
        }
    },

    /**
     * Get user role
     * @returns {string|null}
     */
    getUserRole: () => {
        return localStorage.getItem('role');
    },

    /**
     * Get user branch ID
     * @returns {number|null}
     */
    getBranchId: () => {
        const branchId = localStorage.getItem('branchId');
        return branchId ? parseInt(branchId) : null;
    },

    /**
     * Get pharmacist ID
     * @returns {number|null}
     */
    getPharmacistId: () => {
        const pharmacistId = localStorage.getItem('pharmacistId');
        return pharmacistId ? parseInt(pharmacistId) : null;
    }
};
