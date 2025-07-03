// src/components/admin/common/DateTimePicker.tsx
import React, { useState } from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  showTime = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateTime = (date: Date) => {
    if (showTime) {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    }
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      if (value && showTime) {
        // Preserve time if it exists
        newDate.setHours(value.getHours(), value.getMinutes());
      }
      onChange(newDate);
    } else {
      onChange(null);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue && value) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  const formatInputDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatInputTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={value ? formatInputDate(value) : ''}
            onChange={handleDateChange}
            min={minDate ? formatInputDate(minDate) : undefined}
            max={maxDate ? formatInputDate(maxDate) : undefined}
            className="w-full bg-slate-600 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        
        {showTime && (
          <div className="w-32 relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={value ? formatInputTime(value) : ''}
              onChange={handleTimeChange}
              className="w-full bg-slate-600 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
            />
          </div>
        )}
      </div>
      
      {value && (
        <div className="mt-2 text-sm text-gray-400">
          Đã chọn: {formatDateTime(value)}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;

