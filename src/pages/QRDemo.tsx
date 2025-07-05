import React from 'react';
import { Link } from 'react-router-dom';
import { QrCodeIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const QRDemo: React.FC = () => {
    // Tạo QR code mẫu (trong thực tế sẽ được tạo từ backend)
    const sampleTicketCode = 'TICKET-20241201-001';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#FFD875] mb-4" style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}>
                        QR Scanner Demo
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Trang demo cho hệ thống quét vé nhân viên rạp chiếu phim
                    </p>
                </div>

                {/* Status Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-yellow-400 text-lg font-semibold">Trạng thái hiện tại</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-green-300">Frontend QR Scanner: Hoạt động</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-300">Backend API: Đang phát triển (sử dụng mock data)</span>
                        </div>
                    </div>
                    <p className="text-yellow-200 text-sm mt-3">
                        Hệ thống sẽ tự động chuyển sang dữ liệu thật khi backend API sẵn sàng.
                    </p>
                </div>

                {/* Feature Overview */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-slate-700/50">
                    <h2 className="text-[#FFD875] text-xl font-semibold mb-4">Tính năng chính:</h2>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-3">
                            <QrCodeIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>Quét mã QR vé xem phim bằng camera</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <DevicePhoneMobileIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>Giao diện thân thiện với mobile và tablet</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <ComputerDesktopIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>Hiển thị thông tin vé chi tiết sau khi quét</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <QrCodeIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>Kiểm tra tính hợp lệ và trạng thái vé</span>
                        </li>
                    </ul>
                </div>

                {/* Testing Instructions */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-slate-700/50">
                    <h3 className="text-[#FFD875] text-lg font-semibold mb-4">Cách test hệ thống:</h3>
                    <div className="space-y-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">1. Test với buttons demo:</h4>
                            <p className="text-slate-300 text-sm">
                                Trong QR Scanner có 2 nút test: "Vé hợp lệ" và "Vé đã quét" để test các trường hợp khác nhau.
                            </p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">2. Test với nhập thủ công:</h4>
                            <p className="text-slate-300 text-sm">
                                Nhấn "Nhập mã thủ công" và nhập bất kỳ mã vé nào để test (ví dụ: TICKET-123).
                            </p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">3. Test với camera:</h4>
                            <p className="text-slate-300 text-sm">
                                Camera sẽ có 0.5% cơ hội tự động detect QR code giả để test (chờ khoảng 1-2 phút).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sample QR Code */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-slate-700/50 text-center">
                    <h3 className="text-[#FFD875] text-lg font-semibold mb-4">QR Code mẫu để test:</h3>
                    <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        {/* Placeholder for QR code - trong thực tế sẽ sử dụng thư viện tạo QR */}
                        <div className="w-48 h-48 bg-slate-200 flex items-center justify-center text-slate-600 text-sm">
                            QR Code cho<br />
                            {sampleTicketCode}
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Mã vé mẫu: <code className="bg-slate-700 px-2 py-1 rounded text-[#FFD875]">{sampleTicketCode}</code>
                    </p>
                </div>

                {/* API Information */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-slate-700/50">
                    <h3 className="text-[#FFD875] text-lg font-semibold mb-4">API được tích hợp:</h3>
                    <div className="space-y-3 text-sm">
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                            <code className="text-green-400">POST /ticket/scan/{'{ticketcode}'}</code>
                            <p className="text-slate-400 mt-1">Quét vé để check in</p>
                            <p className="text-yellow-300 text-xs mt-1">⚠️ Hiện tại: Mock response</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                            <code className="text-blue-400">GET /ticket/booking/{'{bookingId}'}</code>
                            <p className="text-slate-400 mt-1">Lấy thông tin vé theo booking</p>
                            <p className="text-red-300 text-xs mt-1">❌ Chưa implement</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                            <code className="text-blue-400">GET /ticket/code/{'{ticketcode}'}</code>
                            <p className="text-slate-400 mt-1">Lấy thông tin vé theo mã vé</p>
                            <p className="text-red-300 text-xs mt-1">❌ Chưa implement</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg">
                            <code className="text-blue-400">GET /ticket/scan-list</code>
                            <p className="text-slate-400 mt-1">Lấy danh sách vé đã quét trong ngày</p>
                            <p className="text-yellow-300 text-xs mt-1">⚠️ Hiện tại: Mock data</p>
                        </div>
                    </div>
                </div>

                {/* Access Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/staff/scanner"
                        className="block p-6 bg-gradient-to-r from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/30 rounded-2xl hover:from-[#FFD875]/30 hover:to-[#FFD875]/20 transition-all duration-300 text-center group"
                    >
                        <QrCodeIcon className="w-12 h-12 text-[#FFD875] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold text-lg mb-2">Mở QR Scanner</h3>
                        <p className="text-slate-400 text-sm">Truy cập trang quét vé cho nhân viên</p>
                    </Link>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/staff/scanner');
                            alert('Đã copy link!');
                        }}
                        className="block p-6 bg-slate-700/50 border border-slate-600/50 rounded-2xl hover:bg-slate-600/50 transition-all duration-300 text-center group"
                    >
                        <DevicePhoneMobileIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-white font-semibold text-lg mb-2">Copy Link</h3>
                        <p className="text-slate-400 text-sm">Sao chép link để mở trên mobile</p>
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-[#FFD875] text-lg font-semibold mb-4">Hướng dẫn sử dụng:</h3>
                    <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                        <li>Mở trang QR Scanner trên thiết bị mobile hoặc tablet</li>
                        <li>Cho phép truy cập camera khi được yêu cầu (hoặc bỏ qua nếu test)</li>
                        <li>Sử dụng buttons "Vé hợp lệ" hoặc "Vé đã quét" để test nhanh</li>
                        <li>Hoặc nhấn "Nhập mã thủ công" để test với mã tùy ý</li>
                        <li>Xem thông tin vé hiển thị và các trạng thái khác nhau</li>
                        <li>Kiểm tra danh sách vé đã quét và thống kê</li>
                    </ol>
                </div>

                {/* Backend Status */}
                <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                    <h3 className="text-red-400 text-lg font-semibold mb-4">Lỗi Backend hiện tại:</h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                        <code className="text-red-300 text-sm">
                            GET /api/ticket/scan-list 500 (Internal Server Error)<br />
                            Lỗi lấy danh sách vé: TicketBooking is associated
                        </code>
                    </div>
                    <p className="text-red-300 text-sm">
                        Lỗi này liên quan đến association trong database. Frontend đã xử lý bằng cách sử dụng mock data để demo có thể hoạt động bình thường.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRDemo; 