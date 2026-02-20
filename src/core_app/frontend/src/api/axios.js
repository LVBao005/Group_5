import axios from 'axios';

/**
 * Axios instance cấu hình sẵn cho dự án
 * - baseURL: /api (được proxy qua localhost:8080/backend trong vite.config.js)
 * - Headers: Hỗ trợ JSON và Tiếng Việt (UTF-8)
 */
const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true, // Gửi cookies và session
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
    },
});

// Thêm interceptor nếu cần xử lý token hoặc lỗi tập trung
axiosInstance.interceptors.request.use(
    (config) => {
        // Ví dụ: thêm token vào header nếu có
        // const token = localStorage.get('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
