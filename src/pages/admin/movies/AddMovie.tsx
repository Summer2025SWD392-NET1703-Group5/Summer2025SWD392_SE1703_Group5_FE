// src/pages/admin/movies/AddMovie.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MultiStepMovieForm from '../../../components/admin/forms/MultiStepMovieForm';
import '../styles/MovieManagement.css';
import { motion } from 'framer-motion';

const AddMovie: React.FC = () => {
  // Chỉ giữ lại trạng thái "sắp chiếu" và "đang chiếu" cho form thêm phim mới
  const limitedStatuses = {
    statuses: ['Coming Soon', 'Now Showing']
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <motion.div
        className="mb-8 flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/admin/movies"
          className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-all duration-200 text-gray-400 hover:text-white group"
        >
          <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Thêm phim mới</h1>
          <p className="text-gray-400 mt-1">Tạo phim mới với các thông tin chi tiết</p>
        </div>
      </motion.div>

      <motion.div
        className="fade-in bg-slate-800 rounded-xl shadow-lg border border-slate-700 shadow-[0_0_20px_0_rgba(0,0,0,0.3)] relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Hiệu ứng gradient cho viền */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/10 via-[#FFD875]/30 to-[#FFD875]/10 rounded-xl blur-sm -z-10"></div>

        {/* Hiệu ứng overlay gradient ở đầu form */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#FFD875]/20 to-transparent"></div>

        <div className="p-1"> {/* Padding để tạo hiệu ứng viền gradient */}
          <div className="bg-slate-800 rounded-lg p-6">
            <MultiStepMovieForm mode="add" additionalData={limitedStatuses} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMovie;
