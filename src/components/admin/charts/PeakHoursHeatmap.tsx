// src/components/admin/charts/PeakHoursHeatmap.tsx
import React from 'react';

const PeakHoursHeatmap: React.FC = () => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8AM to 9PM

  // Mock data: booking intensity (0-100)
  const generateHeatmapData = () => {
    const data = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 14; hour++) {
        const actualHour = hour + 8;
        let intensity = 20; // Base intensity
        
        // Weekend boost
        if (day >= 5) intensity += 30;
        
        // Evening boost (6PM-9PM)
        if (actualHour >= 18 && actualHour <= 21) intensity += 40;
        
        // Afternoon boost (2PM-5PM)
        if (actualHour >= 14 && actualHour <= 17) intensity += 20;
        
        // Add some randomness
        intensity += Math.random() * 20 - 10;
        
        // Ensure within bounds
        intensity = Math.max(0, Math.min(100, intensity));
        
        data.push({
          day,
          hour: actualHour,
          intensity: Math.round(intensity),
        });
      }
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-green-500';
    return 'bg-slate-600';
  };

  const getIntensityOpacity = (intensity: number) => {
    return Math.max(0.3, intensity / 100);
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Giờ cao điểm đặt vé</h3>
      
      <div className="space-y-2">
        {/* Hours header */}
        <div className="flex">
          <div className="w-8"></div>
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-gray-400 min-w-[24px]">
              {hour}h
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex items-center">
            <div className="w-8 text-xs text-gray-400 text-right pr-2">
              {day}
            </div>
            <div className="flex flex-1 gap-1">
              {hours.map(hour => {
                const dataPoint = heatmapData.find(
                  d => d.day === dayIndex && d.hour === hour
                );
                const intensity = dataPoint?.intensity || 0;
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`aspect-square rounded-sm ${getIntensityColor(intensity)} min-w-[20px] relative group cursor-pointer`}
                    style={{ opacity: getIntensityOpacity(intensity) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {day} {hour}:00 - {intensity}% hoạt động
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-400">
          <span>Thấp</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-slate-600 rounded-sm opacity-30"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm opacity-50"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-sm opacity-70"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-sm opacity-90"></div>
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          </div>
          <span>Cao</span>
        </div>
      </div>
    </div>
  );
};

export default PeakHoursHeatmap;
