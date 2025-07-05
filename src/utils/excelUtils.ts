import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu thành file Excel và tải về
 * @param data Mảng object chứa dữ liệu cần xuất
 * @param fileName Tên file xuất ra (không cần đuôi file)
 * @param sheetName Tên sheet trong file Excel
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    // Tạo workbook
    const workbook = XLSX.utils.book_new();

    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Tạo file Excel và tải về
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Nhập dữ liệu từ file Excel
 * @param file File Excel đã chọn
 * @returns Promise chứa dữ liệu đọc được từ file Excel
 */
export const importFromExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Lấy tên sheet đầu tiên
                const firstSheetName = workbook.SheetNames[0];

                // Lấy dữ liệu từ sheet
                const worksheet = workbook.Sheets[firstSheetName];

                // Chuyển đổi dữ liệu sang dạng JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        // Đọc file dưới dạng binary
        reader.readAsBinaryString(file);
    });
};

/**
 * Tạo mẫu file Excel trống với các cột được chỉ định
 * @param headers Đối tượng chứa tên cột và tiêu đề tương ứng
 * @param fileName Tên file xuất ra (không cần đuôi file)
 * @param sheetName Tên sheet trong file Excel
 */
export const downloadExcelTemplate = (
    headers: { [key: string]: string },
    fileName: string,
    sheetName: string = 'Template'
) => {
    // Tạo một hàng dữ liệu mẫu trống
    const sampleRow = Object.keys(headers).reduce((acc, key) => {
        acc[key] = '';
        return acc;
    }, {} as { [key: string]: string });

    // Tạo workbook
    const workbook = XLSX.utils.book_new();

    // Tạo worksheet từ dữ liệu mẫu
    const worksheet = XLSX.utils.json_to_sheet([sampleRow]);

    // Thay thế header bằng tiêu đề tùy chỉnh
    XLSX.utils.sheet_add_aoa(worksheet, [Object.values(headers)], { origin: 'A1' });

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Tạo file Excel và tải về
    XLSX.writeFile(workbook, `${fileName}-template.xlsx`);
};

/**
 * Đọc dữ liệu từ file Excel và chuyển đổi thành mẫu dữ liệu mong muốn
 * @param file File Excel đã chọn
 * @param headerMapping Đối tượng ánh xạ từ tiêu đề Excel sang tên trường dữ liệu
 * @param transformer Hàm chuyển đổi dữ liệu sang định dạng mong muốn
 * @returns Promise chứa dữ liệu đã được chuyển đổi
 */
export const parseExcelData = <T>(
    file: File,
    headerMapping: { [excelHeader: string]: string },
    transformer?: (rawData: any) => T
): Promise<T[]> => {
    return importFromExcel(file).then(jsonData => {
        // Map dữ liệu từ file Excel sang cấu trúc mong muốn
        return jsonData.map(row => {
            const mappedData: any = {};

            // Áp dụng mapping từ tiêu đề Excel sang tên trường
            Object.entries(headerMapping).forEach(([excelHeader, fieldName]) => {
                if (row[excelHeader] !== undefined) {
                    mappedData[fieldName] = row[excelHeader];
                }
            });

            // Áp dụng transformer nếu có
            return transformer ? transformer(mappedData) : mappedData as T;
        });
    });
}; 