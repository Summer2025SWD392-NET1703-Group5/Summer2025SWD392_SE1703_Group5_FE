

import apiClient from './apiClient';

interface ExportResponse {
    success: boolean;
    message: string;
    filename?: string;
}

interface ImportResponse {
    success: boolean;
    message: string;
    results?: {
        imported: number;
        failed: number;
        errors?: string[];
    };
}

class ExportImportService {

    // =============================================================================
    // MOVIE EXPORT/IMPORT APIs
    // =============================================================================

    /**
     * Xuất tất cả phim ra file Excel (OPTIMIZED)
     * GET /export-import/movies/export
     */
    async exportMovies(): Promise<Blob> {
        console.log('🌐 [exportImportService] Gọi API export movies...');
        console.log('🔗 [exportImportService] URL:', '/export-import/movies/export');

        try {
            const response = await apiClient.get('/export-import/movies/export', {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            console.log('✅ [exportImportService] API response thành công:', {
                status: response.status,
                contentType: response.headers['content-type'],
                dataSize: response.data?.size || 'unknown'
            });

            return response.data;
        } catch (error: any) {
            console.error('❌ [exportImportService] API call failed:', {
                url: '/export-import/movies/export',
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Nhập phim từ file Excel (OPTIMIZED)
     * POST /export-import/movies/import
     */
    async importMovies(file: File): Promise<ImportResponse> {
        console.log('🌐 [exportImportService] Gọi API import movies...');
        console.log('🔗 [exportImportService] URL:', '/export-import/movies/import');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/export-import/movies/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('✅ [exportImportService] API response thành công:', {
                status: response.status,
                data: response.data
            });

            return response.data;
        } catch (error: any) {
            console.error('❌ [exportImportService] API call failed:', {
                url: '/export-import/movies/import',
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Tải template Excel cho import phim (Sử dụng API backend)
     * GET /export-import/movies/template
     */
    async downloadMovieTemplate(): Promise<Blob> {
        console.log('🌐 [exportImportService] Gọi API tải template phim...');
        console.log('🔗 [exportImportService] URL:', '/export-import/movies/template');

        try {
            const response = await apiClient.get('/export-import/movies/template', {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            console.log('✅ [exportImportService] API template response thành công:', {
                status: response.status,
                contentType: response.headers['content-type'],
                dataSize: response.data?.size || 'unknown'
            });

            return response.data;
        } catch (error: any) {
            console.error('❌ [exportImportService] API template call failed:', {
                url: '/export-import/movies/template',
                status: error.response?.status,
                message: error.message
            });
            throw error;
        }
    }

    // =============================================================================
    // CINEMA EXPORT/IMPORT APIs
    // =============================================================================

    /**
     * Xuất phòng chiếu và sơ đồ ghế cho một rạp phim
     * GET /export-import/cinemas/:cinemaId/export
     */
    async exportCinemaRooms(cinemaId: number): Promise<Blob> {
        console.log('🌐 [exportImportService] Gọi API export cinema rooms cho cinemaId:', cinemaId);
        console.log('🔗 [exportImportService] URL:', `/export-import/cinemas/${cinemaId}/export`);

        try {
            const response = await apiClient.get(`/export-import/cinemas/${cinemaId}/export`, {
                responseType: 'blob'
            });

            console.log('✅ [exportImportService] API export cinema rooms response thành công:', response.status);
            return response.data;
        } catch (error: any) {
            console.error('❌ [exportImportService] Lỗi khi export cinema rooms:', error);
            const errorMessage = error.response?.data?.message || 'Không thể xuất dữ liệu phòng chiếu.';

            if (error.response?.status === 404) {
                console.warn(`⚠️ [exportImportService] Rạp với ID ${cinemaId} không tồn tại hoặc không có phòng nào`);
                throw new Error(`Rạp ID ${cinemaId} không có phòng chiếu hoặc không tồn tại`);
            }

            throw new Error(errorMessage);
        }
    }

    /**
     * Xuất danh sách tất cả rạp chiếu (Sử dụng API cinemas và xuất bằng excelUtils)
     */
    async exportAllCinemas(): Promise<Blob> {
        console.log('🌐 [exportImportService] Gọi API export all cinemas...');
        console.log('🔗 [exportImportService] URL:', '/cinemas');

        try {
            // Lấy data từ API cinemas hiện có
            const response = await apiClient.get('/cinemas');
            console.log('✅ [exportImportService] API cinemas response:', {
                status: response.status,
                dataLength: response.data?.length || 0
            });

            const cinemas = response.data;

            // Chuyển đổi data cho Excel
            const exportData = cinemas.map((cinema: any) => ({
                'Cinema_ID': cinema.Cinema_ID,
                'Tên rạp': cinema.Cinema_Name,
                'Địa chỉ': cinema.Address,
                'Thành phố': cinema.City,
                'Trạng thái': cinema.Status,
                'Mô tả': cinema.Description || '',
                'Ngày tạo': cinema.Created_At ? new Date(cinema.Created_At).toLocaleDateString('vi-VN') : '',
            }));

            console.log('📊 [exportImportService] Export data prepared:', {
                recordCount: exportData.length,
                firstRecord: exportData[0]
            });

            // Sử dụng excelUtilsBlob để tạo file Excel
            const { exportToExcelBlob } = await import('../utils/excelUtilsBlob');
            const blob = await exportToExcelBlob(exportData, 'Danh sách rạp chiếu');

            console.log('📁 [exportImportService] Excel blob created:', {
                size: blob.size,
                type: blob.type
            });

            return blob;
        } catch (error: any) {
            console.error('❌ [exportImportService] Export all cinemas error:', {
                url: '/cinemas',
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Import phòng chiếu và sơ đồ ghế cho một rạp phim
     * POST /export-import/cinemas/:cinemaId/import
     */
    async importCinemaRooms(cinemaId: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post(`/export-import/cinemas/${cinemaId}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Xử lý trường hợp khi response.data không có trường results
            if (response.data && response.data.success) {
                if (!response.data.results) {
                    // Tạo một kết quả chuẩn dựa trên data từ backend
                    const roomsCreated = response.data.data?.rooms?.created || 0;
                    const roomsUpdated = response.data.data?.rooms?.updated || 0;
                    const layoutsCreated = response.data.data?.layouts?.created || 0;
                    const layoutsUpdated = response.data.data?.layouts?.updated || 0;

                    // Tự động refresh trang sau khi import thành công
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo thành công

                    return {
                        success: true,
                        results: {
                            imported: roomsCreated + roomsUpdated + layoutsCreated + layoutsUpdated,
                            failed: response.data.data?.rooms?.errors?.length + response.data.data?.layouts?.errors?.length || 0,
                            errors: [
                                ...(response.data.data?.rooms?.errors || []),
                                ...(response.data.data?.layouts?.errors || [])
                            ]
                        }
                    };
                }

                // Tự động refresh trang sau khi import thành công
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo thành công
            }

            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Rạp ID ${cinemaId} không tồn tại`);
            }

            const errorMessage = error.response?.data?.message || error.message || 'Không thể import dữ liệu phòng chiếu.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Tải template Excel cho import phòng (Sử dụng API backend)
     * GET /export-import/cinemas/template
     */
    async downloadCinemaTemplate(): Promise<Blob> {
        try {
            const response = await apiClient.get('/export-import/cinemas/template', {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải template.';
            throw new Error(errorMessage);
        }
    }

    /**
     * Tải xuống file blob
     */
    downloadFile(blob: Blob, filename: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Tạo tên file với timestamp
     */
    generateFilename(prefix: string, extension: string = 'xlsx'): string {
        const date = new Date();
        const timestamp = date.toISOString().split('T')[0].replace(/-/g, '-');
        const time = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${prefix}-${timestamp}-${time}.${extension}`;
    }
}

// Export singleton instance
export const exportImportService = new ExportImportService();
export default exportImportService;
