import { useState, useMemo } from "react";
import { removeAccents } from "../components/utils/utils";

export interface ShowtimeFilters {
  search: string;
  dateFilter: string;
  customDate: string;
  statusFilter: "all" | "scheduled" | "hidden";
}

export interface Showtime {
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Room_Name: string;
  Show_Date: string;
  Start_Time: string;
  End_Time: string;
  Status: string;
  Rooms: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  Movies?: {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
  };
}

const useShowtimeFilters = (showtimes: Showtime[]) => {
  const [filters, setFilters] = useState<ShowtimeFilters>({
    search: "",
    dateFilter: "all",
    customDate: "",
    statusFilter: "scheduled",
  });

  // Date calculation helpers
  const getDateRanges = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));

    const nextWeekStart = new Date(thisWeekEnd);
    nextWeekStart.setDate(thisWeekEnd.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    return {
      now,
      today,
      tomorrow,
      thisWeekEnd,
      nextWeekStart,
      nextWeekEnd,
      thisMonthStart,
      thisMonthEnd,
      nextMonthStart,
      nextMonthEnd,
    };
  };

  // Filter functions
  const filterBySearch = (showtime: Showtime, searchTerm: string): boolean => {
    if (!searchTerm) return true;

    const searchLower = removeAccents(searchTerm.toLowerCase());
    return (
      removeAccents(showtime.Room_Name?.toLowerCase() || "").includes(searchLower) ||
      removeAccents(showtime.Rooms?.Room_Name?.toLowerCase() || "").includes(searchLower) ||
      removeAccents(showtime.Movies?.Movie_Name?.toLowerCase() || "").includes(searchLower)
    );
  };

  const filterByStatus = (showtime: Showtime, statusFilter: string): boolean => {
    if (statusFilter === "all") return true;
    if (statusFilter === "scheduled") return showtime.Status === "Scheduled";
    if (statusFilter === "hidden") return showtime.Status === "Hidden";
    return true;
  };

  const filterByDate = (showtime: Showtime, dateFilter: string, customDate: string): boolean => {
    const showtimeDate = new Date(showtime.Show_Date);
    const ranges = getDateRanges();

    switch (dateFilter) {
      case "all":
        return true;
      case "today":
        return showtimeDate.toDateString() === ranges.today.toDateString();
      case "tomorrow":
        return showtimeDate.toDateString() === ranges.tomorrow.toDateString();
      case "this-week":
        return showtimeDate >= ranges.today && showtimeDate <= ranges.thisWeekEnd;
      case "next-week":
        return showtimeDate >= ranges.nextWeekStart && showtimeDate <= ranges.nextWeekEnd;
      case "this-month":
        return showtimeDate >= ranges.thisMonthStart && showtimeDate <= ranges.thisMonthEnd;
      case "next-month":
        return showtimeDate >= ranges.nextMonthStart && showtimeDate <= ranges.nextMonthEnd;
      case "custom-date":
        if (!customDate) return true;
        const selectedDate = new Date(customDate);
        return showtimeDate.toDateString() === selectedDate.toDateString();
      case "upcoming":
        return showtimeDate >= ranges.today;
      case "past":
        return showtimeDate < ranges.today;
      case "expired": {
        const showtimeDateTime = new Date(`${showtime.Show_Date} ${showtime.End_Time || showtime.Start_Time}`);
        return showtimeDateTime < ranges.now;
      }
      case "active": {
        const showtimeStart = new Date(`${showtime.Show_Date} ${showtime.Start_Time}`);
        const showtimeEnd = new Date(`${showtime.Show_Date} ${showtime.End_Time || showtime.Start_Time}`);
        return ranges.now >= showtimeStart && ranges.now <= showtimeEnd;
      }
      default:
        return true;
    }
  };

  // Memoized filtered results
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((showtime) => {
      return (
        filterBySearch(showtime, filters.search) &&
        filterByStatus(showtime, filters.statusFilter) &&
        filterByDate(showtime, filters.dateFilter, filters.customDate)
      );
    });
  }, [showtimes, filters]);

  // Filter update functions
  const updateSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const updateDateFilter = (dateFilter: string) => {
    setFilters((prev) => ({
      ...prev,
      dateFilter,
      customDate: dateFilter !== "custom-date" ? "" : prev.customDate,
    }));
  };

  const updateCustomDate = (customDate: string) => {
    setFilters((prev) => ({ ...prev, customDate }));
  };

  const updateStatusFilter = (statusFilter: "all" | "scheduled" | "hidden") => {
    setFilters((prev) => ({ ...prev, statusFilter }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      dateFilter: "all",
      customDate: "",
      statusFilter: "scheduled",
    });
  };

  const clearDateFilter = () => {
    setFilters((prev) => ({
      ...prev,
      dateFilter: "all",
      customDate: "",
    }));
  };

  // Statistics
  const filterStats = useMemo(() => {
    const total = showtimes.length;
    const scheduled = showtimes.filter((s) => s.Status === "Scheduled").length;
    const hidden = showtimes.filter((s) => s.Status === "Hidden").length;
    const filtered = filteredShowtimes.length;

    return { total, scheduled, hidden, filtered };
  }, [showtimes, filteredShowtimes]);

  return {
    filters,
    filteredShowtimes,
    filterStats,
    updateSearch,
    updateDateFilter,
    updateCustomDate,
    updateStatusFilter,
    clearFilters,
    clearDateFilter,
  };
};

export default useShowtimeFilters;
