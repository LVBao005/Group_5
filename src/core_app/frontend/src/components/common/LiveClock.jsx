import React, { useState, useEffect } from 'react';

/**
 * LiveClock component - Displays real-time time and date in Vietnamese locale
 * @param {Object} props
 * @param {string} props.className - Optional extra classes for the container
 * @param {boolean} props.showDate - Whether to show the date (default: true)
 * @param {boolean} props.showTime - Whether to show the time (default: true)
 */
const LiveClock = ({ className = "", showDate = true, showTime = true }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const day = days[date.getDay()];
        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return { day, date: dateStr, time: timeStr };
    };

    const { day, date, time } = formatDateTime(currentTime);

    return (
        <div className={`text-right ${className}`}>
            {showTime && (
                <p className="text-sm font-black text-white leading-none">
                    {time}
                </p>
            )}
            {showDate && (
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">
                    {day}, {date}
                </p>
            )}
        </div>
    );
};

export default LiveClock;
