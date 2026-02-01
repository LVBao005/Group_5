import dayjs from 'dayjs'


export function getBatchStatus(expiryDate) {
const days = dayjs(expiryDate).diff(dayjs(), 'day')


if (days <= 15) return { color: 'red', label: 'Sắp / Đã hết hạn' }
if (days <= 90) return { color: 'gold', label: 'Còn < 3 tháng' }
return { color: 'green', label: 'Bình thường' }
}