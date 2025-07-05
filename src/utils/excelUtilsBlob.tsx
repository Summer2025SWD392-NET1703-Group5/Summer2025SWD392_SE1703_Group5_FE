import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu thành file Excel và return blob
 * @param data Mảng object chứa dữ liệu cần xuất
 * @param sheetName Tên sheet trong file Excel
 * @returns Promise<Blob> - Excel file blob
 */
export const exportToExcelBlob = (data: any[], sheetName: string = 'Sheet1'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        try {
            // Tạo workbook
            const workbook = XLSX.utils.book_new();

            // Tạo worksheet từ dữ liệu
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Tạo buffer từ workbook
            const excelBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            // Tạo blob từ buffer
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            resolve(blob);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Tạo và download file Excel từ data
 * @param data Mảng object chứa dữ liệu cần xuất
 * @param fileName Tên file xuất ra (không cần đuôi file)
 * @param sheetName Tên sheet trong file Excel
 */
export const exportAndDownloadExcel = async (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    try {
        const blob = await exportToExcelBlob(data, sheetName);

        // Download file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error;
    }
};
