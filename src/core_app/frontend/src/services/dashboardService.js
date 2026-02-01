import axios from '../api/axios';

// Mock Data Generator cho demo
const USE_MOCK_DATA = true; // Set false khi backend sẵn sàng

/**
 * Generate mock data for dashboard demo
 */
const mockDataGenerator = {
    getStats: () => ({
        success: true,
        data: {
            totalRevenue: 15420000 + Math.random() * 500000,
            totalOrders: 48 + Math.floor(Math.random() * 10),
            totalMedicines: 342,
            totalCustomers: 1256,
            lowStockCount: 12,
            expiringCount: 8
        }
    }),

    getRevenueTimeline: (period) => {
        let data = [];
        if (period === 'today') {
            // Dữ liệu theo giờ (6:00 - 22:00)
            for (let hour = 6; hour <= 22; hour++) {
                data.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    revenue: Math.floor(200000 + Math.random() * 800000),
                    orders: Math.floor(2 + Math.random() * 8)
                });
            }
        } else if (period === 'week') {
            // Dữ liệu 7 ngày
            const days = ['26/01', '27/01', '28/01', '29/01', '30/01', '31/01', '01/02'];
            days.forEach(day => {
                data.push({
                    time: day,
                    revenue: Math.floor(5000000 + Math.random() * 10000000),
                    orders: Math.floor(30 + Math.random() * 50)
                });
            });
        } else if (period === 'month') {
            // Dữ liệu 30 ngày
            for (let i = 30; i >= 1; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                data.push({
                    time: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                    revenue: Math.floor(4000000 + Math.random() * 12000000),
                    orders: Math.floor(25 + Math.random() * 60)
                });
            }
        }
        return { success: true, data, period };
    },

    getRevenueByCategory: () => ({
        success: true,
        data: [
            { name: 'Kháng sinh', value: 4500000, orders: 15 },
            { name: 'Thực phẩm chức năng', value: 3800000, orders: 12 },
            { name: 'Mỹ phẩm', value: 2900000, orders: 8 },
            { name: 'Thuốc kê đơn', value: 2200000, orders: 6 },
            { name: 'Thuốc không kê đơn', value: 1500000, orders: 5 },
            { name: 'Dụng cụ y tế', value: 920000, orders: 2 }
        ]
    }),

    getAlerts: () => ({
        success: true,
        data: {
            expiring: [
                {
                    medicineId: 'MED001',
                    name: 'Amoxicillin 500mg',
                    batchId: 'BATCH2024001',
                    expiryDate: '2026-02-06',
                    daysUntilExpiry: 5,
                    quantity: 50
                },
                {
                    medicineId: 'MED002',
                    name: 'Paracetamol 500mg',
                    batchId: 'BATCH2024002',
                    expiryDate: '2026-02-10',
                    daysUntilExpiry: 9,
                    quantity: 120
                },
                {
                    medicineId: 'MED003',
                    name: 'Vitamin C 1000mg',
                    batchId: 'BATCH2024003',
                    expiryDate: '2026-02-15',
                    daysUntilExpiry: 14,
                    quantity: 80
                },
                {
                    medicineId: 'MED004',
                    name: 'Ibuprofen 400mg',
                    batchId: 'BATCH2024004',
                    expiryDate: '2026-02-20',
                    daysUntilExpiry: 19,
                    quantity: 60
                },
                {
                    medicineId: 'MED005',
                    name: 'Omega-3 Fish Oil',
                    batchId: 'BATCH2024005',
                    expiryDate: '2026-02-25',
                    daysUntilExpiry: 24,
                    quantity: 95
                }
            ],
            lowStock: [
                {
                    medicineId: 'MED010',
                    name: 'Cetrizine 10mg',
                    batchId: 'BATCH2024010',
                    quantity: 8,
                    unit: 'Hộp'
                },
                {
                    medicineId: 'MED011',
                    name: 'Omeprazole 20mg',
                    batchId: 'BATCH2024011',
                    quantity: 15,
                    unit: 'Hộp'
                },
                {
                    medicineId: 'MED012',
                    name: 'Metformin 500mg',
                    batchId: 'BATCH2024012',
                    quantity: 22,
                    unit: 'Hộp'
                },
                {
                    medicineId: 'MED013',
                    name: 'Atorvastatin 10mg',
                    batchId: 'BATCH2024013',
                    quantity: 35,
                    unit: 'Hộp'
                },
                {
                    medicineId: 'MED014',
                    name: 'Amlodipine 5mg',
                    batchId: 'BATCH2024014',
                    quantity: 42,
                    unit: 'Hộp'
                }
            ]
        }
    }),

    getRealtimeData: () => ({
        success: true,
        data: {
            recentOrders: Math.floor(Math.random() * 5),
            recentRevenue: Math.floor(Math.random() * 500000),
            hourlyOrders: 12 + Math.floor(Math.random() * 10),
            hourlyRevenue: 2500000 + Math.floor(Math.random() * 1000000),
            timestamp: new Date().toISOString()
        }
    })
};

/**
 * Dashboard Service
 * Handles all dashboard-related API calls with mock data fallback
 */
const dashboardService = {
    /**
     * Get overall statistics
     */
    getStats: async () => {
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockDataGenerator.getStats();
        }
        
        try {
            const response = await axios.get('/api/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Fallback to mock data on error
            return mockDataGenerator.getStats();
        }
    },

    /**
     * Get revenue timeline data
     * @param {string} period - 'today', 'week', or 'month'
     */
    getRevenueTimeline: async (period = 'today') => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockDataGenerator.getRevenueTimeline(period);
        }
        
        try {
            const response = await axios.get(`/api/dashboard/revenue-timeline?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue timeline:', error);
            return mockDataGenerator.getRevenueTimeline(period);
        }
    },

    /**
     * Get revenue breakdown by category
     */
    getRevenueByCategory: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockDataGenerator.getRevenueByCategory();
        }
        
        try {
            const response = await axios.get('/api/dashboard/revenue-by-category');
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue by category:', error);
            return mockDataGenerator.getRevenueByCategory();
        }
    },

    /**
     * Get alerts (expiring medicines and low stock)
     */
    getAlerts: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockDataGenerator.getAlerts();
        }
        
        try {
            const response = await axios.get('/api/dashboard/alerts');
            return response.data;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return mockDataGenerator.getAlerts();
        }
    },

    /**
     * Get real-time data for live updates
     */
    getRealtimeData: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return mockDataGenerator.getRealtimeData();
        }
        
        try {
            const response = await axios.get('/api/dashboard/realtime');
            return response.data;
        } catch (error) {
            console.error('Error fetching realtime data:', error);
            return mockDataGenerator.getRealtimeData();
        }
    }
};

export default dashboardService;
