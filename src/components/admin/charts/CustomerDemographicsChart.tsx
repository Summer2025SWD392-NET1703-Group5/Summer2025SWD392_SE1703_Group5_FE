// src/components/admin/charts/CustomerDemographicsChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerDemographicsChart: React.FC = () => {
  const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
  const maleData = [120, 450, 680, 520, 380, 200];
  const femaleData = [150, 520, 720, 480, 350, 180];

  const chartData = {
    labels: ageGroups,
    datasets: [
      {
        label: 'Nam',
        data: maleData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
      {
        label: 'Nữ',
        data: femaleData,
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: '#EC4899',
        borderWidth: 1,
      },
    ],
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
        },
      },
      title: {
        display: true,
        text: 'Phân bố khách hàng theo tuổi',
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
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        stacked: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CustomerDemographicsChart;
