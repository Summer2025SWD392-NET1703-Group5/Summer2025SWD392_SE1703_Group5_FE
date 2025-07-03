// src/components/admin/common/DataTable.tsx
import React, { useState, useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface PaginationConfig {
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  pagination?: PaginationConfig;
  rowKey?: string;
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  rowKey = 'id',
  onRowClick,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Remove sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = paginatedData.map(item => item[rowKey]);
      onSelectionChange([...new Set([...selectedRows, ...allIds])]);
    } else {
      const currentPageIds = paginatedData.map(item => item[rowKey]);
      onSelectionChange(selectedRows.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, id]);
    } else {
      onSelectionChange(selectedRows.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(item => selectedRows.includes(item[rowKey]));
  
  const isIndeterminate = paginatedData.some(item => selectedRows.includes(item[rowKey])) && 
    !isAllSelected;

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ChevronUpDownIcon className="w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-600' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={item[rowKey]}
                  className={`hover:bg-slate-700 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item[rowKey])}
                        onChange={(e) => handleSelectRow(item[rowKey], e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, data.length)} trong {data.length} kết quả
            </span>
            
            {pagination.showSizeChanger && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-700 text-white rounded px-3 py-1 text-sm border border-slate-600"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
              </select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                
                // Show first page, last page, current page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        isCurrentPage
                          ? 'bg-yellow-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

