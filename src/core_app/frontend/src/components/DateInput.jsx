import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DateInput = ({ value, onChange, label, placeholder = 'DD/MM/YYYY', className = '' }) => {
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef(null);

    // Convert yyyy-mm-dd to dd/mm/yyyy for display
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date)) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                setDisplayValue(`${day}/${month}/${year}`);
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleInputChange = (e) => {
        let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
        let formatted = '';

        // Format as DD/MM/YYYY
        if (input.length > 0) {
            formatted = input.substring(0, 2);
            if (input.length >= 3) {
                formatted += '/' + input.substring(2, 4);
            }
            if (input.length >= 5) {
                formatted += '/' + input.substring(4, 8);
            }
        }

        setDisplayValue(formatted);

        // Parse and validate complete date
        if (input.length === 8) {
            const day = parseInt(input.substring(0, 2));
            const month = parseInt(input.substring(2, 4));
            const year = parseInt(input.substring(4, 8));

            // Basic validation
            if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
                // Convert to yyyy-mm-dd format for the onChange callback
                const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                onChange({ target: { value: isoDate } });
            }
        } else if (input.length < 8) {
            // Clear the value if incomplete
            onChange({ target: { value: '' } });
        }
    };

    const handleKeyDown = (e) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Ensure that it is a number and stop the keypress if not
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    maxLength={10}
                    className={`w-full bg-[#0d0f0e] border border-white/5 rounded-xl px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-[#00ff80]/20 ${className}`}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
            </div>
        </div>
    );
};

export default DateInput;
