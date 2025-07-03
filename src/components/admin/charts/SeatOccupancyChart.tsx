// src/components/admin/charts/SeatOccupancyChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Cinema {
  id: string;
  name: string;
  revenue: number;
  occupancyRate: number;
}

interface SeatOccupancyChartProps {
  cinemas: Cinema[];
}

const SeatOccupancyChart: React.FC<SeatOccupancyChartProps> = ({ cinemas }) => {
  // Generate mock weekly data for each cinema
  const generateWeeklyData = (baseRate: number) => {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return days.map(() => {
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      return Math.max(0, Math.min(100, baseRate + variation));
    });
  };

  const colors = ['#EAB308', '#3B82F6', '#10B981', '#F59E0B'];

  const chartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: cinemas.slice(0, 4).map((cinema, index) => ({
      label: cinema.name,
      data: generateWeeklyData(cinema.occupancyRate),
      borderColor: colors[index],
      backgroundColor: colors[index] + '20',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: colors[index],
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#FFFFFF',
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Tỷ lệ lấp đầy ghế theo tuần',
        color: '#FFFFFF',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return value + '%';
          },
        },
        beginAtZero: true,
        max: 100,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="h-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SeatOccupancyChart;
