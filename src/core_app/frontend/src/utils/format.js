/**
 * Format a number as Vietnamese Dong currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string (e.g., "100.000 đ")
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Format a date string to Vietnamese locale
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "10:30:00 01/02/2026")
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
};
