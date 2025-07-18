// src/pages/admin/promotions/PromotionsList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusIcon,
  FunnelIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  TicketIcon,
  SparklesIcon,
  PercentBadgeIcon,
  BanknotesIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import FullScreenLoader from "../../../components/FullScreenLoader";
import toast from "react-hot-toast";
import { deletePromotion, getAllPromotions } from "../../../services/admin/promotionManagementServices";
import type { Promotion } from "../../../services/admin/promotionManagementServices";
import { useAuth } from "../../../contexts/SimpleAuthContext";

// Define the promotion type based on the screenshot
interface PromotionUI extends Promotion {
  applicableMovies?: string[];
  applicableCinemas?: string[];
  banner?: string;
}

const PromotionsList: React.FC = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<PromotionUI[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<PromotionUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllPromotions();

      // Map API response to UI format if needed
      const formattedPromotions: PromotionUI[] = data.map((promo) => ({
        ...promo,
        applicableMovies: ["all"], // Default value
        applicableCinemas: ["all"], // Default value
      }));

      setPromotions(formattedPromotions);
      setFilteredPromotions(formattedPromotions);
    } catch (err: any) {
      console.error("Error fetching promotions:", err);
      setError(err.message || "Không thể tải danh sách khuyến mãi");
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = promotions;

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "inactive") {
        result = result.filter(
          (promo) => promo.Status.toLowerCase() === "inactive" || promo.Status.toLowerCase() === "deleted"
        );
      } else {
        result = result.filter((promo) => promo.Status.toLowerCase() === statusFilter);
      }
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((promo) => promo.Discount_Type.toLowerCase() === typeFilter);
    }

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (promo) =>
          promo.Title?.toLowerCase().includes(lowercasedSearch) ||
          promo.Promotion_Code?.toLowerCase().includes(lowercasedSearch) ||
          promo.Promotion_Detail?.toLowerCase().includes(lowercasedSearch)
      );
    }

    setFilteredPromotions(result);
  }, [promotions, statusFilter, typeFilter, searchTerm]);

  const handleDeletePromotion = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn ngừng hoạt động khuyến mãi này?")) return;

    try {
      // Instead of deleting, we update the status to Inactive
      const promotion = promotions.find((p) => p.Promotion_ID === id);
      if (promotion) {
        // Update the promotion status to Inactive
        await deletePromotion(id.toString());

        const updatedPromotion = { ...promotion, Status: "Inactive" };

        // Update local state
        setPromotions(promotions.map((promo) => (promo.Promotion_ID === id ? updatedPromotion : promo)));

        toast.success("Khuyến mãi đã được ngừng hoạt động");
      }
    } catch (err: any) {
      console.error("Error updating promotion status:", err);
      toast.error("Không thể ngừng hoạt động khuyến mãi");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "expired":
        return <XCircleIcon className="w-4 h-4" />;
      case "scheduled":
        return <CalendarDaysIcon className="w-4 h-4" />;
      case "draft":
        return <DocumentTextIcon className="w-4 h-4" />;
      case "inactive":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "expired":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "draft":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return "Đang hoạt động";
      case "expired":
        return "Đã hết hạn";
      case "scheduled":
        return "Đã lên lịch";
      case "deleted":
        return "Ngừng hoạt động";
      case "inactive":
        return "Ngừng hoạt động";
      default:
        return status;
    }
  };

  const getDiscountIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "percentage":
      case "percent":
        return <PercentBadgeIcon className="w-5 h-5" />;
      case "fixed":
      case "fix":
        return <BanknotesIcon className="w-5 h-5" />;
      case "combo":
        return <CubeIcon className="w-5 h-5" />;
      default:
        return <TicketIcon className="w-5 h-5" />;
    }
  };

  const getDiscountText = (promotion: PromotionUI) => {
    const discountType = promotion.Discount_Type.toLowerCase();

    if (discountType === "percentage" || discountType === "percent") {
      return `${promotion.Discount_Value}%`;
    } else {
      return `${promotion.Discount_Value.toLocaleString("vi-VN")}đ`;
    }
  };

  const getDiscountTypeText = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "percentage":
      case "percent":
        return "Phần trăm";
      case "fixed":
      case "fix":
        return "Số tiền cố định";
      case "combo":
        return "Combo";
      default:
        return type;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
              <SparklesIcon className="w-8 h-8 text-[#FFD875] mr-3" />
              Quản lý khuyến mãi
            </h1>
            <p className="text-gray-400">Quản lý các chương trình khuyến mãi và ưu đãi của bạn</p>
          </div>
          {user?.role === "Admin" && (
            <Link
              to="/admin/promotions/add"
              className="mt-4 md:mt-0 flex items-center bg-[#FFD875] hover:bg-[#e5c368] text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)]"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tạo khuyến mãi
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="expired">Đã hết hạn</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300"
            >
              <option value="all">Tất cả loại</option>
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Số tiền cố định</option>
            </select>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FullScreenLoader size="large" />
          </div>
        ) : error ? (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPromotions}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Thử lại
            </button>
          </motion.div>
        ) : (
          <>
            {/* Results Count */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <p className="text-gray-400">
                Tìm thấy <span className="text-[#FFD875] font-semibold">{filteredPromotions.length}</span> khuyến mãi
              </p>
            </motion.div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promotion, index) => (
                <motion.div
                  key={promotion.Promotion_ID}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-[#FFD875]/50 transition-all duration-300 hover:shadow-[0_0_25px_0_rgba(255,216,117,0.3)] group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Promotion Header */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-4 flex flex-col justify-between">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD875] rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FFD875] rounded-full blur-2xl"></div>
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusBadgeClass(
                          promotion.Status
                        )}`}
                      >
                        {getStatusIcon(promotion.Status)}
                        {getStatusText(promotion.Status)}
                      </span>

                      <div className="flex gap-2">
                        {user?.role === "Admin" ? (
                          <>
                            <Link
                              to={`/admin/promotions/${promotion.Promotion_ID}`}
                              className="p-2 rounded-lg bg-slate-700/50 hover:bg-[#FFD875]/20 text-gray-400 hover:text-[#FFD875] transition-all duration-300 hover:shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeletePromotion(promotion.Promotion_ID)}
                              className="p-2 rounded-lg bg-slate-700/50 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 transition-all duration-300 hover:shadow-[0_0_10px_0_rgba(245,158,11,0.4)]"
                              title="Ngừng hoạt động"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="text-gray-500 text-sm px-2 py-1">Chỉ xem</div>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FFD875] transition-colors duration-300">
                        {promotion.Title}
                      </h3>
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 text-[#FFD875] mr-1.5" />
                        <span className="text-sm text-[#FFD875] font-mono bg-[#FFD875]/10 px-2 py-0.5 rounded">
                          {promotion.Promotion_Code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promotion Details */}
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 line-clamp-2">{promotion.Promotion_Detail}</p>
                    </div>

                    <div
                      className={`grid ${
                        promotion.Minimum_Purchase != null && promotion.Minimum_Purchase > 0
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      } gap-3 mb-4`}
                    >
                      <motion.div
                        className="bg-gradient-to-br from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/30 rounded-lg p-3 text-center group/discount"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex justify-center mb-1 text-[#FFD875]">
                          {getDiscountIcon(promotion.Discount_Type)}
                        </div>
                        <p className="text-[#FFD875] text-lg font-bold">{getDiscountText(promotion)}</p>
                        <p className="text-xs text-gray-400">{getDiscountTypeText(promotion.Discount_Type)}</p>
                      </motion.div>

                      {promotion.Minimum_Purchase != null && promotion.Minimum_Purchase > 0 && (
                        <motion.div
                          className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600"
                          whileHover={{ scale: 1.05 }}
                        >
                          <BanknotesIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-white text-lg font-bold">
                            {promotion.Minimum_Purchase.toLocaleString("vi-VN")}đ
                          </p>
                          <p className="text-xs text-gray-400">Đơn tối thiểu</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#FFD875]" />
                        <span>
                          {formatDate(promotion.Start_Date)} - {formatDate(promotion.End_Date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <ClockIcon className="w-4 h-4 mr-2 text-[#FFD875]" />
                          <span>Đã dùng:</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-white font-medium">{promotion.Current_Usage}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-400">
                            {promotion.Usage_Limit > 0 ? promotion.Usage_Limit : "∞"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPromotions.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <FunnelIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400">Không tìm thấy khuyến mãi nào</p>
                <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PromotionsList;
