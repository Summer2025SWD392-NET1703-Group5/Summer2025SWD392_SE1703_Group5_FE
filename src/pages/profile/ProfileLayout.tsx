import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import UnassignedStaffNotice from '../../components/notifications/UnassignedStaffNotice';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { userService } from '../../services/userService';

const ProfileLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user && user.role === 'Customer') {
        setIsLoadingPoints(true);
        try {
          const response = await userService.getUserPoints();
          setUserPoints(response?.total_points || 0);
        } catch (error) {
          console.error('Không thể lấy điểm tích lũy:', error);
          setUserPoints(0);
        } finally {
          setIsLoadingPoints(false);
        }
      }
    };

    fetchUserPoints();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 relative overflow-hidden">
      {/* Animated Background Elements with Glowing Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD875]/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] bg-[#FFD875]/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#FFD875]/15 rounded-full blur-[80px] animate-bounce delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Compact Design */}
          <div className="lg:w-80 space-y-4">
            {/* Profile Header Card - Compact & Elegant */}
            <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD875]/10 shadow-[0_0_40px_rgba(255,216,117,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFD875]/5"></div>
              <div className="relative z-10">
                <div className="flex flex-col items-center space-y-4">
                  {/* Avatar Section - Smaller */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#FFD875]/30 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=FFD875&color=000&bold=true&size=150`}
                      alt={user.fullName}
                      className="relative w-24 h-24 rounded-full object-cover ring-2 ring-[#FFD875]/40 group-hover:ring-[#FFD875]/60 transition-all duration-500 shadow-[0_0_25px_rgba(255,216,117,0.3)]"
                    />
                  </div>

                  {/* User Info with Points - Integrated */}
                  <div className="text-center space-y-2 w-full">
                    <h1 className="text-xl font-bold text-[#FFD875] relative">
                      <span className="relative z-10 drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">
                      {user.fullName}
                      </span>
                    </h1>
                    <div className="flex items-center justify-center text-slate-300 text-sm">
                      <EnvelopeIcon className="w-3.5 h-3.5 mr-1.5 text-[#FFD875]" />
                      {user.email}
                    </div>

                    {/* Points Display - Integrated with glowing effect - Hidden for Staff */}
                    {user.role === 'Customer' && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <SparklesIcon className="w-5 h-5 text-[#FFD875] animate-pulse" />
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#FFD875]/20 blur-xl"></div>
                          <div className="relative bg-[#FFD875]/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-[#FFD875]/20">
                            <span className="text-[#FFD875] font-bold text-lg drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">
                              {isLoadingPoints ? (
                                <div className="inline-block w-4 h-4 border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                (userPoints || 0).toLocaleString('vi-VN')
                              )}
                            </span>
                            <span className="text-[#FFD875]/80 text-xs ml-1">điểm</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Sidebar - Compact */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-[#FFD875]/10 shadow-[0_0_30px_rgba(255,216,117,0.08)] overflow-hidden">
              <div className="relative z-10">
                <ProfileSidebar />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:flex-1 space-y-6">
            {/* Show unassigned staff notice */}
            {user?.role === 'Staff' && !user?.cinemaId && (
              <UnassignedStaffNotice />
            )}
            
            <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-[#FFD875]/10 shadow-[0_0_40px_rgba(255,216,117,0.1)] min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/[0.02] via-transparent to-[#FFD875]/[0.02]"></div>
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout; 
