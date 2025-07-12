import React, { useState, useEffect } from 'react';
import {
    QrCodeIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    UserIcon,
    CalendarDaysIcon,
    ArrowLeftIcon,
    TicketIcon,
    FilmIcon,
    XCircleIcon,
    BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../../components/QRScanner';
import TicketInfo from '../../components/TicketInfo';
import { ticketService } from '../../services/ticketService';
import { cinemaService } from '../../services/cinemaService';
import { useAuth } from '../../contexts/SimpleAuthContext';
import type { ScanResult, ScanListItem } from '../../types/ticket';
import type { Cinema } from '../../types/cinema';

const TicketScanner: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanList, setScanList] = useState<ScanListItem[]>([]);
    const [pendingTickets, setPendingTickets] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' hoặc 'scanned'
    const [stats, setStats] = useState({
        totalScanned: 0,
        validTickets: 0,
        invalidTickets: 0,
    });
    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [loadingCinema, setLoadingCinema] = useState(false);
    const [refreshAnimation, setRefreshAnimation] = useState(false);
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    loadScanList(),
                    loadPendingTickets(),
                    user?.cinemaId ? loadCinema(user.cinemaId) : Promise.resolve()
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };

        loadInitialData();
    }, [user?.cinemaId]);

    const loadCinema = async (cinemaId: number) => {
        try {
            setLoadingCinema(true);
            const cinemaData = await cinemaService.getCinemaById(cinemaId);
            setCinema(cinemaData);
        } catch (error) {
            console.error('Error loading cinema:', error);
        } finally {
            setLoadingCinema(false);
        }
    };

    const loadScanList = async () => {
        try {
            const data = await ticketService.getScanList();
            
            const scannedTickets = data.filter((item: any) => item.rawData.is_checked_in === true);
            setScanList(scannedTickets);
            
            setStats({
                totalScanned: scannedTickets.length,
                validTickets: scannedTickets.filter((item: any) => item.status === 'SCANNED').length,
                invalidTickets: scannedTickets.filter((item: any) => item.status !== 'SCANNED').length
            });
        } catch (error) {
            console.error('Error loading scan list:', error);
        }
    };

    const loadPendingTickets = async () => {
        try {
            const data = await ticketService.getScanList();
            
            const pendingList = data.filter((item: any) => item.rawData.is_checked_in === false);
            
            const mappedPendingTickets = pendingList.map((item: any) => ({
                ticketCode: item.ticketCode,
                movieTitle: item.movieTitle,
                customerName: item.customerName,
                seatNumber: item.seatNumber,
                showtime: item.showtime,
                status: 'PENDING'
            }));
            
            setPendingTickets(mappedPendingTickets);
        } catch (error) {
            console.error('Error loading pending tickets:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshAnimation(true);
        try {
            await Promise.all([
                loadScanList(), 
                loadPendingTickets(), 
                user?.cinemaId ? loadCinema(user.cinemaId) : Promise.resolve()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setTimeout(() => setRefreshAnimation(false), 1000);
        }
    };

    const handleScan = async (qrData: string) => {
        try {
            setShowScanner(false);
            
            const result = await ticketService.scanTicket(qrData);
            setScanResult(result);
            
            // Refresh data after successful scan
            await Promise.all([loadScanList(), loadPendingTickets()]);
        } catch (error) {
            console.error('Scan error:', error);
            setScanResult({
                success: false,
                message: 'Có lỗi xảy ra khi quét vé',
                ticket: undefined
            });
        }
    };

    const handleScanTicket = async (ticketCode: string) => {
        try {
            const result = await ticketService.scanTicket(ticketCode);
            setScanResult(result);
            
            // Refresh data after successful scan
            await Promise.all([loadScanList(), loadPendingTickets()]);
        } catch (error) {
            console.error('Scan ticket error:', error);
            setScanResult({
                success: false,
                message: 'Có lỗi xảy ra khi quét vé',
                ticket: undefined
            });
        }
    };

    const handleScanError = (error: string) => {
        console.error('QR Scanner error:', error);
    };

    const formatTime = (timeInput: string | Date | null | undefined): string => {
        if (!timeInput) return '--:--';
        
        try {
            // Check if it's an epoch date pattern: 1970-01-01T14:00:00.000Z
            if (typeof timeInput === 'string' && timeInput.includes('1970-01-01T')) {
                const timeMatch = timeInput.match(/T(\d{2}:\d{2}):/);
                if (timeMatch) {
                    return timeMatch[1];
                }
            }
            
            // Handle string time format like "14:00:00"
            if (typeof timeInput === 'string') {
                // If it's already in HH:MM or HH:MM:SS format
                const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
                const match = timeInput.match(timePattern);
                if (match) {
                    const [, hours, minutes] = match;
                    return `${hours.padStart(2, '0')}:${minutes}`;
                }
                
                // Try to parse as Date if it's an ISO string
                const date = new Date(timeInput);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }
            }
            
            // Handle Date object
            if (timeInput instanceof Date && !isNaN(timeInput.getTime())) {
                return timeInput.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            }
            
            return '--:--';
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            SCANNED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Đã quét' },
            VALID: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Hợp lệ' },
            EXPIRED: { bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Hết hạn' },
        };

        const { bg, text, label } = config[status as keyof typeof config] || config.EXPIRED;

        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bg} ${text} border border-current/30 flex items-center gap-1`}>
                {status === 'SCANNED' && <CheckCircleIcon className="w-3 h-3" />}
                {status === 'EXPIRED' && <XCircleIcon className="w-3 h-3" />}
                {label}
            </span>
        );
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/3 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD875]/3 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
                
                {/* Added floating particles for depth */}
                <div className="absolute top-40 right-1/4 w-12 h-12 bg-blue-500/10 rounded-full filter blur-xl animate-float" />
                <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-emerald-500/10 rounded-full filter blur-xl animate-float animation-delay-2000" />
                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-amber-500/10 rounded-full filter blur-lg animate-float animation-delay-3000" />
            </div>

            <div className="relative z-10 p-4 max-w-6xl mx-auto">
                {/* Enhanced Header */}
                <motion.div
                    className="flex items-center justify-between mb-6 pt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Left side with back button and logo */}
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 mr-3 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
                            aria-label="Quay lại"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#FFD875]/30 to-[#FFD875]/10 rounded-full flex items-center justify-center border-2 border-[#FFD875]/30 mr-4 shadow-lg shadow-amber-500/20">
                                <QrCodeIcon className="w-7 h-7 text-[#FFD875]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#FFD875] tracking-tight" style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}>
                                    Galaxy Cinema
                                </h1>
                                <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                                    <BuildingLibraryIcon className="w-4 h-4 text-slate-400" />
                                    Hệ thống quét mã vé
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side with enhanced stats */}
                    <div className="flex gap-3">
                        <motion.div 
                            className="stats-card bg-gradient-to-br from-slate-800/80 to-slate-700/50 backdrop-blur-md rounded-xl px-4 py-2.5 border border-slate-600/30 text-center shadow-lg"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        >
                            <div className="text-xl font-bold text-white">{pendingTickets.length + stats.totalScanned}</div>
                            <div className="text-xs font-medium text-slate-300">Tổng vé</div>
                        </motion.div>
                        <motion.div 
                            className="stats-card bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-emerald-600/20 text-center shadow-lg"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        >
                            <div className="text-xl font-bold text-emerald-400">{stats.totalScanned}</div>
                            <div className="text-xs font-medium text-slate-300">Đã quét</div>
                        </motion.div>
                        <motion.div 
                            className="stats-card bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-blue-600/20 text-center shadow-lg"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        >
                            <div className="text-xl font-bold text-blue-400">{pendingTickets.length}</div>
                            <div className="text-xs font-medium text-slate-300">Chờ quét</div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left Column - Action Panel */}
                    <motion.div
                        className="lg:col-span-1 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Primary Action Button - Scan QR */}
                        <motion.button
                            onClick={() => {
                                setScanResult(null); // Clear previous scan result
                                setShowScanner(true);
                            }}
                            className="w-full py-4 text-black rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-xl"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: 'linear-gradient(135deg, #FFD875 0%, #FFC840 100%)',
                                boxShadow: '0 8px 25px rgba(255, 216, 117, 0.4), 0 0 60px rgba(255, 216, 117, 0.1)'
                            }}
                        >
                            <QrCodeIcon className="w-6 h-6" />
                            Quét mã QR
                        </motion.button>

                        {/* Secondary Action - Refresh */}
                        <motion.button
                            onClick={handleRefresh}
                            disabled={refreshAnimation}
                            className="w-full py-3.5 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-md text-white rounded-xl hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 flex items-center justify-center gap-2.5 border border-slate-600/30 shadow-lg"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${refreshAnimation ? 'animate-spin' : ''}`} />
                            Làm mới danh sách
                        </motion.button>
                        
                        {/* Tab Navigation - Enhanced */}
                        <motion.div 
                            className="bg-slate-800/40 rounded-xl p-1.5 flex shadow-lg border border-slate-700/30"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex-1 py-3 px-1 flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${
                                    activeTab === 'pending' 
                                        ? 'bg-gradient-to-br from-blue-800/50 to-blue-900/50 text-blue-300 border border-blue-700/30 shadow-md' 
                                        : 'bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                                }`}
                            >
                                <TicketIcon className="w-5 h-5" />
                                <span className="font-medium">Vé cần quét</span>
                                <span className="bg-blue-400/20 text-blue-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{pendingTickets.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('scanned')}
                                className={`flex-1 py-3 px-1 flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${
                                    activeTab === 'scanned' 
                                        ? 'bg-gradient-to-br from-emerald-800/50 to-emerald-900/50 text-emerald-300 border border-emerald-700/30 shadow-md' 
                                        : 'bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                                }`}
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="font-medium">Đã quét</span>
                                <span className="bg-emerald-400/20 text-emerald-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{stats.totalScanned}</span>
                            </button>
                        </motion.div>

                        {/* Date & Time Display */}
                        <motion.div
                            className="p-3 text-center bg-slate-800/30 rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <p className="text-slate-300 text-sm">
                                {new Date().toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                            <p className="text-[#FFD875] text-xl font-semibold">
                                {new Date().toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </motion.div>
                        
                        {/* Staff and Cinema Info */}
                        <motion.div
                            className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 bg-slate-700/80 rounded-full flex items-center justify-center mr-3">
                                    <UserIcon className="w-5 h-5 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{user?.fullName}</h3>
                                    <p className="text-slate-400 text-sm flex items-center gap-1">
                                        <BuildingLibraryIcon className="w-4 h-4 text-[#FFD875]" />
                                        {loadingCinema ? (
                                            <span className="text-sm text-slate-400">Đang tải...</span>
                                        ) : cinema ? (
                                            <span className="text-[#FFD875]">{cinema.Cinema_Name}</span>
                                        ) : (
                                            <span className="text-sm text-slate-400">Galaxy Cinema</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {cinema && (
                                <div className="text-xs text-slate-400 mt-1 pl-13">
                                    <p>{cinema.Address}</p>
                                    {cinema.Phone_Number && <p className="mt-0.5">SĐT: {cinema.Phone_Number}</p>}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Ticket Lists */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'pending' ? (
                                // Pending Tickets List
                                <motion.div
                                    key="pending-list"
                                    className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden h-full shadow-xl"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                                        <h3 className="text-blue-300 font-semibold flex items-center gap-2 text-lg">
                                            <TicketIcon className="w-5 h-5" />
                                            Vé cần quét hôm nay
                                        </h3>
                                        <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-500/20">
                                            {pendingTickets.length} vé
                                        </span>
                                    </div>

                                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                                        {pendingTickets.length > 0 ? (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-4">
                                                {pendingTickets.map((item, index) => (
                                                        <motion.div
                                                        key={`pending-${item.ticketCode}-${index}`}
                                                        className="bg-slate-700/40 rounded-xl backdrop-blur-md border border-slate-600/30 hover:border-blue-500/30 hover:bg-slate-700/60 transition-colors shadow-lg"
                                                        variants={itemVariants}
                                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                                                        <FilmIcon className="w-6 h-6 text-blue-400" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-white font-semibold text-lg line-clamp-1">{item.movieTitle}</div>
                                                                        <div className="text-slate-300 text-sm flex items-center gap-1.5">
                                                                            <UserIcon className="w-4 h-4 text-blue-400" />
                                                                            {item.customerName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <motion.button 
                                                                    onClick={() => handleScanTicket(item.ticketCode)}
                                                                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition-colors py-2 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-500/30"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <QrCodeIcon className="w-4 h-4" />
                                                                    Quét ngay
                                                                </motion.button>
                                                            </div>

                                                            <div className="flex items-center justify-between bg-slate-800/70 rounded-lg p-3 border border-slate-700/50">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                                                                        <ClockIcon className="w-4 h-4 text-[#FFD875]" />
                                                                        <span className="font-medium text-sm text-white">{formatTime(item.showtime)}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                                                                        <TicketIcon className="w-4 h-4 text-[#FFD875]" />
                                                                        <span className="font-medium text-sm text-white">{item.seatNumber}</span>
                                                                    </span>
                                                                </div>
                                                                <div className="bg-slate-700/70 px-2.5 py-1.5 rounded-lg text-xs font-mono text-blue-300 flex items-center">
                                                                    {item.ticketCode}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <motion.div 
                                                className="p-12 text-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <TicketIcon className="w-20 h-20 text-slate-600 mx-auto mb-4 opacity-50" />
                                                <p className="text-slate-300 text-xl font-medium mb-2">Không có vé nào cần quét</p>
                                                <p className="text-slate-400 text-base">Tất cả các vé đã được xử lý</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                // Scanned Tickets List
                                <motion.div
                                    key="scanned-list"
                                    className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden h-full shadow-xl"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                                        <h3 className="text-emerald-300 font-semibold flex items-center gap-2 text-lg">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Vé đã quét hôm nay
                                        </h3>
                                        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/20">
                                            {stats.totalScanned} vé
                                        </span>
                                    </div>

                                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                                        {scanList.length > 0 ? (
                                            <motion.div 
                                                className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-4"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                {scanList.map((item, index) => (
                                                    <motion.div
                                                        key={`${item.ticketCode}-${index}`}
                                                        className={`rounded-xl backdrop-blur-md border shadow-lg ${
                                                            item.status === 'SCANNED' 
                                                                ? 'bg-emerald-900/20 border-emerald-600/30' 
                                                                : 'bg-rose-900/20 border-rose-600/30'
                                                        }`}
                                                        variants={itemVariants}
                                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                                        item.status === 'SCANNED' 
                                                                            ? 'bg-emerald-500/20 border border-emerald-500/30' 
                                                                            : 'bg-rose-500/20 border border-rose-500/30'
                                                                    }`}>
                                                                        {item.status === 'SCANNED' ? (
                                                                            <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                                                                        ) : (
                                                                            <XCircleIcon className="w-6 h-6 text-rose-400" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-white font-semibold text-lg line-clamp-1">{item.movieTitle}</div>
                                                                        <div className="text-slate-300 text-sm flex items-center gap-1.5">
                                                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                                                            {item.customerName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {getStatusBadge(item.status)}
                                                            </div>

                                                            <div className="flex items-center justify-between bg-slate-800/70 rounded-lg p-3 border border-slate-700/50">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                                                                        <ClockIcon className="w-4 h-4 text-[#FFD875]" />
                                                                        <span className="font-medium text-sm text-white">{formatTime(item.scanTime)}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                                                                        <TicketIcon className="w-4 h-4 text-[#FFD875]" />
                                                                        <span className="font-medium text-sm text-white">{item.seatNumber}</span>
                                                                    </span>
                                                                </div>
                                                                <div className="bg-slate-700/70 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center">
                                                                    {item.ticketCode}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                className="p-12 text-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <CalendarDaysIcon className="w-20 h-20 text-slate-600 mx-auto mb-4 opacity-50" />
                                                <p className="text-slate-300 text-xl font-medium mb-2">Chưa có vé nào được quét</p>
                                                <p className="text-slate-400 text-base">Vui lòng quét vé để hiển thị tại đây</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* QR Scanner Modal - Enhanced */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <QRScanner
                            isActive={showScanner}
                            onScan={handleScan}
                            onError={handleScanError}
                            onClose={() => {
                                console.log('TicketScanner: Closing QR Scanner');
                                setShowScanner(false);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ticket Info Modal - Enhanced */}
            <AnimatePresence>
                {scanResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TicketInfo
                            scanResult={scanResult}
                            onClose={() => setScanResult(null)}
                            onScanAnother={() => {
                                setScanResult(null);
                                setShowScanner(true);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-3000 {
                        animation-delay: 3s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-15px); }
                        100% { transform: translateY(0px); }
                    }
                    .animate-float {
                        animation: float 8s ease-in-out infinite;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(15, 23, 42, 0.6);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(100, 116, 139, 0.5);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(100, 116, 139, 0.7);
                    }
                `
            }} />
        </div>
    );
};

export default TicketScanner; 