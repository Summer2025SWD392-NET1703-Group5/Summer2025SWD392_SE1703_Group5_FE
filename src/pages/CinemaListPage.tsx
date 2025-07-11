// pages/CinemaListPage.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Filter, Search, Building2, Sparkles, Eye, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Cinema } from '../types/cinema';
import { cinemaService } from '../services/cinemaService';
import toast from 'react-hot-toast';
import FullScreenLoader from '../components/FullScreenLoader';

// Define a type for the frontend cinema display that includes additional fields from the sample data
interface CinemaDisplay extends Cinema {
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  amenities?: string[];
  rating?: number;
  operatingHours?: {
    open: string;
    close: string;
  };
  screens?: number;
  totalSeats?: number;
  ticketPrices?: {
    standard: number;
    vip: number;
    couple?: number;
  };
}

const CinemaListPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<CinemaDisplay[]>([]);
  const [filteredCinemas, setFilteredCinemas] = useState<CinemaDisplay[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch cinemas from API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let cinemasData: Cinema[];

        if (selectedCity !== 'all') {
          cinemasData = await cinemaService.getCinemasByCity(selectedCity);
        } else {
          cinemasData = await cinemaService.getAllCinemas();
        }

        // Transform API data to display format
        const displayCinemas: CinemaDisplay[] = cinemasData.map((cinema, index) => ({
          ...cinema,
          // Add default values for frontend display if needed
          coordinates: { lat: 10.7769 + (index * 0.01), lng: 106.7009 + (index * 0.01) }, // Sample coordinates around Ho Chi Minh City
          images: [`https://placehold.co/600x400/1e293b/ffd875?text=${encodeURIComponent(cinema.Cinema_Name)}`],
          amenities: ['Bãi đậu xe', 'Khu ẩm thực', 'WiFi miễn phí', 'Điều hòa'],
          rating: 4.2 + (Math.random() * 0.8), // Random rating between 4.2-5.0
          operatingHours: { open: '08:00', close: '23:00' },
          screens: 8 + Math.floor(Math.random() * 4), // 8-12 screens
          totalSeats: 800 + Math.floor(Math.random() * 400), // 800-1200 seats
          ticketPrices: {
            standard: 80000 + Math.floor(Math.random() * 20000), // 80k-100k
            vip: 120000 + Math.floor(Math.random() * 30000), // 120k-150k
            couple: 200000 + Math.floor(Math.random() * 50000) // 200k-250k
          }
        }));

        setCinemas(displayCinemas);

        // Extract unique cities
        const uniqueCities = [...new Set(cinemasData.map(cinema => cinema.City))];
        setCities(uniqueCities);

      } catch (err: any) {
        console.error('Error fetching cinemas:', err);
        setError(err.message || 'Không thể tải danh sách rạp. Vui lòng thử lại sau.');
        toast.error('Không thể tải danh sách rạp');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCinemas();
  }, [selectedCity]);

  // Filter cinemas based on search only
  useEffect(() => {
    let filtered = cinemas;

    if (searchTerm) {
      filtered = filtered.filter(cinema =>
        cinema.Cinema_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cinema.Address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCinemas(filtered);
  }, [searchTerm, cinemas]);

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold text-[#FFD875] mb-4 flex items-center justify-center gap-4" style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}>
            <Building2 className="w-12 h-12" />
            Hệ Thống Rạp Chiếu Phim
            <Sparkles className="w-10 h-10" />
          </h1>
          <p className="text-slate-400 text-xl max-w-3xl mx-auto">Khám phá các rạp chiếu phim hiện đại với công nghệ tiên tiến và dịch vụ đẳng cấp</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-[#FFD875]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875]/70 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm rạp chiếu phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 placeholder-slate-400"
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
              }}
              className="px-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50"
              disabled={isLoading}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">Tất cả thành phố</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <FullScreenLoader text="Đang tải danh sách rạp chiếu phim..." />
        ) : error ? (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)' }}
          >
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button
              onClick={() => {
                setSelectedCity('all');
              }}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-medium"
            >
              Thử lại
            </button>
          </motion.div>
        ) : (
          <>
            {/* Results Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div>
                <p className="text-slate-400 text-lg">
                  Tìm thấy <span className="text-[#FFD875] font-bold text-2xl">{filteredCinemas.length}</span> rạp chiếu phim
                </p>
              </div>
            </motion.div>

            {/* Cinema Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCinemas.map((cinema, index) => (
                <motion.div
                  key={cinema.Cinema_ID}
                  className="bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-[#FFD875]/20 group hover:border-[#FFD875]/40 transition-all duration-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 40px rgba(255, 216, 117, 0.2)'
                  }}
                  style={{ boxShadow: '0 0 20px rgba(255, 216, 117, 0.05)' }}
                >
                  {/* Cinema Image */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={cinema.images && cinema.images.length > 0 ? cinema.images[0] : `https://placehold.co/600x400/1e293b/ffd875?text=${encodeURIComponent(cinema.Cinema_Name)}`}
                      alt={cinema.Cinema_Name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                        Đang hoạt động
                      </span>
                    </div>
                  </div>

                  {/* Cinema Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFD875] transition-colors duration-300">
                      {cinema.Cinema_Name}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start text-slate-300">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-[#FFD875]" />
                        <span className="text-sm leading-relaxed">{cinema.Address}</span>
                      </div>

                      {cinema.Phone_Number && (
                        <div className="flex items-center text-slate-300">
                          <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-[#FFD875]" />
                          <span className="text-sm">{cinema.Phone_Number}</span>
                        </div>
                      )}

                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        to={`/cinemas/${cinema.Cinema_ID}`}
                        className="flex-1 bg-[#FFD875] hover:bg-[#FFD875]/90 text-black py-3 px-4 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                        style={{ boxShadow: '0 4px 15px rgba(255, 216, 117, 0.3)' }}
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </Link>
                      <Link
                        to={`/showtimes?cinema=${cinema.Cinema_ID}`}
                        className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white py-3 px-4 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 border border-slate-700 hover:border-[#FFD875]/50 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Lịch chiếu
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredCinemas.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-slate-400 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Filter className="w-20 h-20 mx-auto mb-6 text-[#FFD875]/50" />
                  </motion.div>
                  <p className="text-2xl text-white mb-2">Không tìm thấy rạp chiếu phim nào</p>
                  <p className="text-lg">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animation-delay-150 {
            animation-delay: 150ms;
          }
          
          /* Custom select dropdown styles */
          select option {
            background-color: #1e293b;
            color: white;
            padding: 10px;
          }
          
          select option:hover {
            background-color: #FFD875;
            color: black;
          }
          
          /* Glowing effect for focused elements */
          select:focus, input:focus {
            box-shadow: 0 0 20px rgba(255, 216, 117, 0.3);
          }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #FFD875;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 216, 117, 0.8);
          }
        `
      }} />
    </div>
  );
};

export default CinemaListPage;

