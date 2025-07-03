import React from 'react';

interface PaginationProps {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    paginate: (pageNumber: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    itemsPerPage,
    totalItems,
    currentPage,
    paginate,
    className
}) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Giới hạn số lượng trang hiển thị để tránh quá nhiều nút
    const maxPageDisplay = 5;
    let startPage: number, endPage: number;

    if (totalPages <= maxPageDisplay) {
        // Nếu có ít hơn hoặc bằng maxPageDisplay trang, hiển thị tất cả
        startPage = 1;
        endPage = totalPages;
    } else {
        // Tính toán trang bắt đầu và kết thúc trong trường hợp có nhiều trang
        const halfWay = Math.ceil(maxPageDisplay / 2);

        if (currentPage <= halfWay) {
            // Gần trang đầu
            startPage = 1;
            endPage = maxPageDisplay;
        } else if (currentPage + halfWay - 1 >= totalPages) {
            // Gần trang cuối
            startPage = totalPages - maxPageDisplay + 1;
            endPage = totalPages;
        } else {
            // Ở giữa
            startPage = currentPage - halfWay + 1;
            endPage = currentPage + halfWay - 1;
        }
    }

    // Tạo mảng số trang
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <ul className={`flex space-x-2 ${className || ''}`}>
            {/* Nút Trang trước */}
            <li>
                <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1
                        ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                        } transition-all`}
                >
                    &laquo;
                </button>
            </li>

            {/* Hiển thị "..." nếu không bắt đầu từ trang 1 */}
            {startPage > 1 && (
                <>
                    <li>
                        <button
                            onClick={() => paginate(1)}
                            className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600 transition-all"
                        >
                            1
                        </button>
                    </li>
                    {startPage > 2 && (
                        <li className="px-3 py-1 text-gray-400">
                            ...
                        </li>
                    )}
                </>
            )}

            {/* Các số trang */}
            {pageNumbers.map(number => (
                <li key={number}>
                    <button
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md transition-all ${currentPage === number
                            ? 'bg-[#FFD875] text-black font-medium shadow-[0_0_10px_0_rgba(255,216,117,0.6)]'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                    >
                        {number}
                    </button>
                </li>
            ))}

            {/* Hiển thị "..." nếu không kết thúc ở trang cuối cùng */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <li className="px-3 py-1 text-gray-400">
                            ...
                        </li>
                    )}
                    <li>
                        <button
                            onClick={() => paginate(totalPages)}
                            className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-600 transition-all"
                        >
                            {totalPages}
                        </button>
                    </li>
                </>
            )}

            {/* Nút Trang sau */}
            <li>
                <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
                        ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                        } transition-all`}
                >
                    &raquo;
                </button>
            </li>
        </ul>
    );
};

export default Pagination; 