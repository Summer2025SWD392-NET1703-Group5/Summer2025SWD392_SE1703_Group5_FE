// components/MobileDatePicker.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MobileDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({ selectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.getMonth() + 1,
        weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        isToday: i === 0,
        isSelected: date.toISOString().split('T')[0] === selectedDate
      });
    }
    return dates;
  };

  const dates = generateDates();

  return (
    <div className="md:hidden">
      {/* Mobile Date Slider */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Chọn ngày
          </h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-yellow-500 text-sm"
          >
            {showCalendar ? 'Thu gọn' : 'Xem lịch'}
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dates.slice(0, 7).map((date) => (
            <button
              key={date.value}
              onClick={() => onDateChange(date.value)}
              className={`flex-shrink-0 p-3 rounded-lg text-center min-w-[60px] transition-colors ${
                date.isSelected
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <div className="text-xs font-medium">{date.weekday}</div>
              <div className="text-lg font-bold">{date.day}</div>
              <div className="text-xs">{date.month}</div>
              {date.isToday && (
                <div className="text-xs text-yellow-400 mt-1">Hôm nay</div>
              )}
            </button>
          ))}
        </div>

        {showCalendar && (
          <div className="mt-4 grid grid-cols-7 gap-1">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => onDateChange(date.value)}
                className={`p-2 text-center text-sm rounded transition-colors ${
                  date.isSelected
                    ? 'bg-yellow-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {date.day}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDatePicker;
