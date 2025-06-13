import api from "./axios";

// Get sales report overview (Admin/Staff/Manager only)
const getSalesReportOverview = async (period: number = 30) => {
  try {
    const response = await api.get(`sales-report/overview?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales report overview:", error);
    throw error;
  }
};

// Generate sales report (Admin/Staff/Manager only)
const getSalesReport = async (startDate: string, endDate: string, period: string = "daily") => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      period,
    });

    const response = await api.get(`sales-report?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error generating sales report:", error);
    throw error;
  }
};

// Generate daily sales report
const getDailySalesReport = async (startDate: string, endDate: string) => {
  try {
    const response = await getSalesReport(startDate, endDate, "daily");
    return response;
  } catch (error) {
    console.error("Error generating daily sales report:", error);
    throw error;
  }
};

// Generate weekly sales report
const getWeeklySalesReport = async (startDate: string, endDate: string) => {
  try {
    const response = await getSalesReport(startDate, endDate, "weekly");
    return response;
  } catch (error) {
    console.error("Error generating weekly sales report:", error);
    throw error;
  }
};

// Generate monthly sales report
const getMonthlySalesReport = async (startDate: string, endDate: string) => {
  try {
    const response = await getSalesReport(startDate, endDate, "monthly");
    return response;
  } catch (error) {
    console.error("Error generating monthly sales report:", error);
    throw error;
  }
};

// Generate sales report for current month
const getCurrentMonthSalesReport = async () => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const response = await getSalesReport(startDate, endDate, "daily");
    return response;
  } catch (error) {
    console.error("Error generating current month sales report:", error);
    throw error;
  }
};

// Generate sales report for current week
const getCurrentWeekSalesReport = async () => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));

    const startDate = startOfWeek.toISOString().split("T")[0];
    const endDate = endOfWeek.toISOString().split("T")[0];

    const response = await getSalesReport(startDate, endDate, "daily");
    return response;
  } catch (error) {
    console.error("Error generating current week sales report:", error);
    throw error;
  }
};

// Generate sales report for today
const getTodaySalesReport = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const response = await getSalesReport(today, today, "daily");
    return response;
  } catch (error) {
    console.error("Error generating today's sales report:", error);
    throw error;
  }
};

// Get realtime sales data (Admin/Staff/Manager only)
const getRealtimeSalesReport = async () => {
  try {
    const response = await api.get("sales-report/realtime");
    return response.data;
  } catch (error) {
    console.error("Error fetching realtime sales report:", error);
    throw error;
  }
};

// Get movie sales report (Admin/Staff/Manager only)
const getMovieSalesReport = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`sales-report/movies?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie sales report:", error);
    throw error;
  }
};

// Get cinema sales report (Admin/Staff/Manager only)
const getCinemaSalesReport = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`sales-report/cinemas?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cinema sales report:", error);
    throw error;
  }
};

// Export sales report (Admin/Staff/Manager only)
const exportSalesReport = async (
  startDate: string,
  endDate: string,
  period: string = "daily",
  format: string = "json"
) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      period,
      format,
    });

    const response = await api.get(`sales-report/export?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error exporting sales report:", error);
    throw error;
  }
};

export {
  getRealtimeSalesReport,
  getSalesReportOverview,
  getSalesReport,
  getMovieSalesReport,
  getCinemaSalesReport,
  exportSalesReport,
  getDailySalesReport,
  getWeeklySalesReport,
  getMonthlySalesReport,
  getCurrentMonthSalesReport,
  getCurrentWeekSalesReport,
  getTodaySalesReport,
};
