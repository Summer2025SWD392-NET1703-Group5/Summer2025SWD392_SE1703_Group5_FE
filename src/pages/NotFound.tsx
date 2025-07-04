import React from 'react';
import { Link } from 'react-router-dom';
import { FilmIcon } from '@heroicons/react/24/solid';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center items-center mb-8">
            <div className="text-[120px] md:text-[180px] font-bold text-slate-800">4</div>
            <div className="mx-4">
              <FilmIcon className="w-24 h-24 md:w-32 md:h-32 text-[#ffd875]" />
            </div>
            <div className="text-[120px] md:text-[180px] font-bold text-slate-800">4</div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trang không tồn tại
          </h1>
          
          <p className="text-gray-400 mb-2">
            Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          </p>
          <p className="text-gray-400 mb-8">
            Có thể trang đã được di chuyển hoặc không còn tồn tại.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/" 
              className="bg-[#ffd875] hover:bg-[#ffb347] text-black font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Về trang chủ
            </Link>
            
            <Link 
              to="/movies" 
              className="border border-[#ffd875] text-[#ffd875] hover:bg-[#ffd875]/10 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <FilmIcon className="h-5 w-5 mr-2" />
              Xem phim
            </Link>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Hoặc thử tìm kiếm những gì bạn cần:
          </p>
          <div className="mt-4 flex justify-center">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Tìm kiếm phim"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-[#ffd875] focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ffd875]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
