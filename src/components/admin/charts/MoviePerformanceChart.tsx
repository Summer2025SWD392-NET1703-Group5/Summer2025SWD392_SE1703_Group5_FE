// src/components/admin/charts/MoviePerformanceChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Movie {
  id: string;
  title: string;
  revenue: number;
  bookings: number;
  rating: number;
}

interface MoviePerformanceChartProps {
  movies: Movie[];
}

const MoviePerformanceChart: React.FC<MoviePerformanceChartProps> = ({ movies }) => {
  const colors = [
    '#EAB308', // Yellow
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
  ];

  const chartData = {
    labels: movies.map(movie => movie.title.length > 20 ? 
      movie.title.substring(0, 20) + '...' : movie.title),
    datasets: [
      {
        data: movies.map(movie => movie.revenue),
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#FFFFFF',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Doanh thu theo phim',
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
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(context.parsed)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="h-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default MoviePerformanceChart;
