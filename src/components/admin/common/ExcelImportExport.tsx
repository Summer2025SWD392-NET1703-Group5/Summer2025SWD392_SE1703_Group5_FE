import React, { useState, useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { exportToExcel, importFromExcel, downloadExcelTemplate } from '../../../utils/excelUtils';
import { exportImportService } from '../../../services/exportImportService';

interface ExcelImportExportProps {
    data?: any[]; // Dữ liệu để xuất ra file Excel
    onImport?: (data: any[]) => void; // Callback khi nhập dữ liệu thành công
    fileName: string; // Tên file Excel (không cần đuôi)
    sheetName?: string; // Tên sheet trong file Excel
    headers?: { [key: string]: string }; // Đối tượng chứa tên trường và tiêu đề tương ứng
    showExport?: boolean; // Có hiển thị nút xuất không
    showImport?: boolean; // Có hiển thị nút nhập không
    showTemplate?: boolean; // Có hiển thị nút tải mẫu không
    className?: string; // CSS class thêm vào
    disabled?: boolean; // Vô hiệu hóa các nút
    useApi?: boolean; // Sử dụng API thay vì local utils
    apiType?: 'movies' | 'cinemas'; // Loại API để gọi
    cinemaId?: number; // ID rạp (cho cinema API)
}

const ExcelImportExport: React.FC<ExcelImportExportProps> = ({
    data = [],
    onImport,
    fileName,
    sheetName = 'Sheet1',
    headers,
    showExport = true,
    showImport = true,
    showTemplate = true,
    className = '',
    disabled = false,
    useApi = false,
    apiType = 'movies',
    cinemaId
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const handleExport = async () => {
        const toastId = toast.loading('Đang xuất dữ liệu...');

        try {
            if (useApi) {
                // Sử dụng API export
                let blob: Blob;

                if (apiType === 'movies') {
                    blob = await exportImportService.exportMovies();
                } else {
                    if (cinemaId) {
                        blob = await exportImportService.exportCinemaRooms(cinemaId);
                    } else {
                        blob = await exportImportService.exportAllCinemas();
                    }
                }

                const filename = exportImportService.generateFilename(fileName);
                exportImportService.downloadFile(blob, filename);
                toast.success('Xuất dữ liệu thành công!', { id: toastId });
            } else {
                // Sử dụng local utils
                if (!data || data.length === 0) {
                    toast.error('Không có dữ liệu để xuất', { id: toastId });
                    return;
                }

                exportToExcel(data, fileName, sheetName);
                toast.success('Xuất dữ liệu thành công!', { id: toastId });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Xuất dữ liệu thất bại';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const toastId = toast.loading('Đang nhập dữ liệu...');

        try {
            if (useApi) {
                // Sử dụng API import
                let result;

                if (apiType === 'movies') {
                    result = await exportImportService.importMovies(file);
                } else {
                    if (!cinemaId) {
                        toast.error('Cần chọn rạp chiếu để import phòng chiếu', { id: toastId });
                        return;
                    }
                    result = await exportImportService.importCinemaRooms(cinemaId, file);
                }

                if (result.success) {
                    const { imported = 0, failed = 0, errors = [] } = result.results || {};

                    if (failed > 0) {
                        toast.success(
                            `Nhập thành công ${imported} dòng, thất bại ${failed} dòng`,
                            { id: toastId }
                        );
                    } else {
                        toast.success(`Nhập thành công ${imported} dòng dữ liệu!`, { id: toastId });
                    }

                    // Gọi callback để refresh data
                    if (onImport) {
                        onImport([]);
                    }

                    // Thông báo trang sẽ được refresh sau 1.5 giây
                    toast.success('Trang sẽ tự động tải lại sau 1.5 giây...', {
                        duration: 1500
                    });
                } else {
                    throw new Error(result.message || 'Import failed');
                }
            } else {
                // Sử dụng local utils
                const jsonData = await importFromExcel(file);

                if (onImport) {
                    onImport(jsonData);
                }

                toast.success(`Đã nhập ${jsonData.length} dòng dữ liệu thành công!`, { id: toastId });
            }

            // Reset input để có thể nhập lại file cùng tên
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Nhập dữ liệu thất bại. Vui lòng kiểm tra lại file.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        const toastId = toast.loading('Đang tải template...');

        try {
            if (useApi) {
                // Sử dụng API template
                let blob: Blob;

                if (apiType === 'movies') {
                    blob = await exportImportService.downloadMovieTemplate();
                } else {
                    blob = await exportImportService.downloadCinemaTemplate();
                }

                const filename = exportImportService.generateFilename(`template-${apiType}`);
                exportImportService.downloadFile(blob, filename);
                toast.success('Tải template thành công!', { id: toastId });
            } else {
                // Sử dụng local utils
                if (!headers) {
                    toast.error('Không có thông tin cấu trúc mẫu', { id: toastId });
                    return;
                }

                downloadExcelTemplate(headers, fileName, 'Template');
                toast.success('Đã tải xuống file mẫu', { id: toastId });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Tải mẫu thất bại';
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div className={`flex space-x-2 ${className}`}>
            {showExport && (
                <button
                    onClick={handleExport}
                    disabled={disabled || data.length === 0}
                    className={`bg-[#FFD875]/10 hover:bg-[#FFD875]/20 text-[#FFD875] py-2 px-4 rounded-lg flex items-center space-x-2 shadow-[0_0_10px_0_rgba(255,216,117,0.2)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.4)] transition-all ${disabled || data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    title="Xuất ra file Excel"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Xuất Excel</span>
                </button>
            )}

            {showTemplate && headers && (
                <button
                    onClick={handleDownloadTemplate}
                    disabled={disabled}
                    className={`bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-2 px-4 rounded-lg flex items-center space-x-2 shadow-[0_0_10px_0_rgba(99,102,241,0.2)] hover:shadow-[0_0_15px_0_rgba(99,102,241,0.4)] transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    title="Tải xuống file mẫu"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Tải mẫu</span>
                </button>
            )}

            {showImport && (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        disabled={disabled || importing}
                        className={`bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 px-4 rounded-lg flex items-center space-x-2 shadow-[0_0_10px_0_rgba(34,197,94,0.2)] hover:shadow-[0_0_15px_0_rgba(34,197,94,0.4)] transition-all ${disabled || importing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        title="Nhập từ file Excel"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        <span>{importing ? 'Đang nhập...' : 'Nhập Excel'}</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default ExcelImportExport;
