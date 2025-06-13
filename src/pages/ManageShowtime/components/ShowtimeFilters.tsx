import React from "react";
import type { ShowtimeFilters as IShowtimeFilters } from "../../../hooks/useShowtimeFilters";

interface ShowtimeFiltersProps {
  filters: IShowtimeFilters;
  filteredCount: number;
  onSearchChange: (search: string) => void;
  onDateFilterChange: (dateFilter: string) => void;
  onStatusFilterChange: (status: "all" | "scheduled" | "hidden") => void;
  onClearDateFilter: () => void;
}

const ShowtimeFilters: React.FC<ShowtimeFiltersProps> = ({
  filters,
  filteredCount,
  onSearchChange,
  onDateFilterChange,
  onStatusFilterChange,
}) => {
  return (
    <div className="showtime-filters">
      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên phim hoặc phòng chiếu..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status-filter">Trạng thái:</label>
          <select
            id="status-filter"
            value={filters.statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as "all" | "scheduled" | "hidden")}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="filter-group">
          <label htmlFor="date-filter">Thời gian:</label>
          <select
            id="date-filter"
            value={filters.dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả thời gian</option>
            <optgroup label="Thời gian cụ thể">
              <option value="today">Hôm nay</option>
              <option value="tomorrow">Ngày mai</option>
              <option value="this-week">Tuần này</option>
              <option value="next-week">Tuần sau</option>
              <option value="this-month">Tháng này</option>
              <option value="next-month">Tháng sau</option>
            </optgroup>
            <optgroup label="Trạng thái thời gian">
              <option value="upcoming">Sắp tới</option>
              <option value="active">Đang diễn ra</option>
              <option value="expired">Đã hết hạn</option>
              <option value="past">Đã qua</option>
            </optgroup>
          </select>
        </div>

        {/* Filter Info */}
        <div className="filter-info">
          <span className="filter-count">{filteredCount} kết quả</span>
        </div>
      </div>

      <style>{`
        .showtime-filters {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .search-section {
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background-color: #f8f9fa;
          color: #2c3e50;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
          background-color: white;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: end;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 180px;
        }

        .filter-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background-color: white;
          color: #2c3e50;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }

        .filter-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-left: auto;
        }

        .filter-count {
          font-size: 0.9rem;
          color: #7f8c8d;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
          text-align: center;
        }

        @media (max-width: 768px) {
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            min-width: auto;
          }

          .filter-info {
            margin-left: 0;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ShowtimeFilters;
