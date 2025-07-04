import React, { useState, useRef } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    TicketIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';
import type { Ticket, ScanResult } from '../types/ticket';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';

interface TicketInfoProps {
    scanResult: ScanResult;
    onClose: () => void;
    onScanAnother: () => void;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ scanResult, onClose, onScanAnother }) => {
    const { success, message, ticket, alreadyScanned } = scanResult;
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const printTicketRef = useRef<HTMLDivElement>(null);

    const getStatusIcon = () => {
        if (success) {
            return <CheckCircleIcon className="w-16 h-16 text-green-400" />;
        } else if (alreadyScanned) {
            return <ClockIcon className="w-16 h-16 text-yellow-400" />;
        } else {
            return <XCircleIcon className="w-16 h-16 text-red-400" />;
        }
    };

    const getStatusColor = () => {
        if (success) return 'from-green-500/20 to-green-600/10 border-green-500/30';
        if (alreadyScanned) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
        return 'from-red-500/20 to-red-600/10 border-red-500/30';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const handlePrintTicket = () => {
        if (!ticket) return;
        
        setIsPrinting(true);
        toast.success('Đang chuẩn bị trang in vé...');
        
        // Tạo style tag cho trang in
        const style = document.createElement('style');
        style.textContent = `
            @media print {
                body, html {
                    margin: 0;
                    padding: 0;
                    background: white !important;
                }
                
                body * {
                    visibility: hidden;
                }
                
                .print-ticket, .print-ticket * {
                    visibility: visible;
                }
                
                .print-ticket {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: white !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .print-actions, .no-print {
                    display: none !important;
                }
                
                .print-ticket .bg-gradient-to-r {
                    background: #1a2a6c !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color: white !important;
                }
                
                .print-ticket .text-orange-500 {
                    color: #f97316 !important;
                }
                
                .print-ticket .bg-orange-100 {
                    background-color: #ffedd5 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .print-ticket .bg-gray-100 {
                    background-color: #f3f4f6 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            window.print();
            document.head.removeChild(style);
            setIsPrinting(false);
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getStatusColor()} border-b p-6 text-center`}>
                    <div className="flex justify-center mb-4">
                        {getStatusIcon()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {success ? 'Quét vé thành công!' : alreadyScanned ? 'Vé đã được quét' : 'Vé không hợp lệ'}
                    </h2>
                    <p className={`text-lg ${success ? 'text-green-300' : alreadyScanned ? 'text-yellow-300' : 'text-red-300'}`}>
                        {message}
                    </p>
                </div>

                {/* Ticket Details */}
                {ticket && (
                    <div className="p-6 space-y-6">
                        {/* Movie Info */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-[#FFD875] font-semibold mb-3 flex items-center gap-2">
                                <TicketIcon className="w-5 h-5" />
                                Thông tin phim
                            </h3>
                            <div className="space-y-2">
                                <div className="text-white font-bold text-lg">{ticket.movieTitle}</div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>{formatDateTime(ticket.showtime)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <MapPinIcon className="w-4 h-4" />
                                    <span>{ticket.cinemaName} - {ticket.roomName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seat Info */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-[#FFD875] font-semibold mb-3">Thông tin ghế</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Ghế số:</span>
                                <span className="text-white font-bold text-xl bg-[#FFD875]/20 px-3 py-1 rounded-lg border border-[#FFD875]/30">
                                    {ticket.seatNumber}
                                </span>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-[#FFD875] font-semibold mb-3 flex items-center gap-2">
                                <UserIcon className="w-5 h-5" />
                                Thông tin khách hàng
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <UserIcon className="w-4 h-4" />
                                    <span>{ticket.customerName}</span>
                                </div>
                                {ticket.customerPhone && (
                                <div className="flex items-center gap-2 text-gray-300">
                                    <PhoneIcon className="w-4 h-4" />
                                    <span>{ticket.customerPhone}</span>
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Info */}
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                            <h3 className="text-[#FFD875] font-semibold mb-3 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5" />
                                Thông tin đặt vé
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Mã vé:</span>
                                    <span className="text-white font-mono bg-slate-700 px-2 py-1 rounded text-sm">
                                        {ticket.ticketCode || ticket.code}
                                    </span>
                                </div>
                                {ticket.bookingDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Ngày đặt:</span>
                                    <span className="text-white">{formatDateTime(ticket.bookingDate)}</span>
                                </div>
                                )}
                                {ticket.price && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 flex items-center gap-1">
                                        <CurrencyDollarIcon className="w-4 h-4" />
                                        Giá vé:
                                    </span>
                                    <span className="text-[#FFD875] font-bold text-lg">
                                        {formatCurrency(ticket.price)}
                                    </span>
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Info */}
                        {ticket.scanTime && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 no-print">
                                <h3 className="text-yellow-400 font-semibold mb-2">Thông tin quét vé</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Thời gian quét:</span>
                                        <span className="text-white">{formatDateTime(ticket.scanTime)}</span>
                                    </div>
                                    {ticket.staffName && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Nhân viên quét:</span>
                                            <span className="text-white">{ticket.staffName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-0 space-y-3 print-actions">
                    {ticket && (success || alreadyScanned) && (
                        <button
                            onClick={handlePrintTicket}
                            disabled={isPrinting}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            {isPrinting ? 'Đang chuẩn bị...' : 'In vé'}
                        </button>
                    )}
                    <button
                        onClick={onScanAnother}
                        className="w-full py-3 bg-[#FFD875] text-black font-semibold rounded-xl hover:bg-[#e5c368] transition-colors"
                    >
                        Quét vé khác
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
            
            {/* Printable Ticket Template */}
            {ticket && (
                <div className="print-ticket hidden" ref={printTicketRef}>
                    <div className="w-full max-w-md mx-auto bg-white rounded-lg overflow-hidden">
                        {/* Phần đầu vé với logo và thương hiệu */}
                        <div className="bg-gradient-to-r from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] text-white p-4 text-center">
                            <h2 className="text-2xl font-bold tracking-wider">GALAXY CINEMA</h2>
                            <p className="uppercase text-sm tracking-widest">VŨ TRỤ ĐIỆN ẢNH</p>
                        </div>
                        
                        <div className="border-b-2 border-dashed border-gray-300 relative">
                            <div className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-gray-100"></div>
                            <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-gray-100"></div>
                        </div>
                        
                        {/* Thông tin chính */}
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">{ticket.movieTitle}</h3>
                                <p className="text-sm text-gray-600">{ticket.duration || 120} phút</p>
                            </div>
                            
                            <div className="flex justify-between items-center mb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                                        <p className="text-gray-800">{formatDate(ticket.showtime)}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                                        <p className="text-gray-800">{formatTime(ticket.showtime)}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-5 h-5 text-gray-600 mr-2" />
                                        <p className="text-gray-800">{ticket.roomName || "Phòng chiếu"}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="bg-orange-100 rounded-full p-2 mb-1">
                                        <TicketIcon className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <p className="text-2xl font-bold text-orange-500">{ticket.seatNumber}</p>
                                    <p className="text-xs text-gray-500">Ghế</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                {/* Mã vé */}
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">KHÁCH HÀNG</p>
                                    <p className="text-md font-semibold">{ticket.customerName}</p>
                                    <p className="text-xs text-gray-500 mt-2">MÃ VÉ</p>
                                    <p className="text-md font-mono font-bold">{ticket.ticketCode || ticket.code}</p>
                                </div>
                                
                                {/* QR Code */}
                                <div className="border-4 border-gray-800 rounded-md p-1 bg-white">
                                    <QRCode
                                        value={ticket.ticketCode || ticket.code}
                                        size={100}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"H"}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Phần chân vé */}
                        <div className="bg-gray-100 p-3 text-center">
                            <p className="text-sm font-medium text-gray-700">Vui lòng đến trước 15 phút để check-in</p>
                            <p className="text-xs text-gray-500 mt-1">Vé có giá trị duy nhất cho suất chiếu này</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketInfo; 