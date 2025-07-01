// Các types định nghĩa cho Promotion

// Enum cho trạng thái khuyến mãi
export enum PromotionStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    EXPIRED = 'Expired',
    DELETED = 'Deleted'
}

// Enum cho loại giảm giá
export enum DiscountType {
    PERCENTAGE = 'Percentage',
    FIXED = 'Fixed'
}

// Enum cho đối tượng áp dụng
export enum ApplicableFor {
    ALL_USERS = 'All Users',
    NEW_USERS = 'New Users',
    VIP_USERS = 'VIP Users'
}

// Interface cho Promotion
export interface Promotion {
    id: number;
    title: string;
    description: string;
    image: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    validUntil: string;
    category: 'subscription' | 'movie-pack' | 'premium' | 'special' | 'package' | 'member' | 'holiday';
    badge: 'HOT' | 'NEW' | 'LIMITED' | null;
    isActive: boolean;
    terms: string[];
    code?: string;
    usageLimit: number;
    currentUsage: number;
    remainingUsage: number;
    discountType?: string;
    discountValue?: number;
    minimumPurchase?: number;
    isUsed?: boolean;
}

// Interface cho API Promotion
export interface ApiPromotion {
    Promotion_ID: number;
    Title: string;
    Promotion_Code: string;
    Start_Date: string;
    End_Date: string;
    Discount_Type: DiscountType;
    Discount_Value: number;
    Minimum_Purchase: number;
    Maximum_Discount: number | null;
    Applicable_For: ApplicableFor;
    Usage_Limit: number;
    Current_Usage: number;
    Status: PromotionStatus;
    Promotion_Detail: string;
    Created_At: string;
    Created_By: string;
    Is_Expired: boolean;
    Is_Active: boolean;
}

// Interface cho chi tiết khuyến mãi bao gồm thống kê sử dụng
export interface PromotionDetail extends ApiPromotion {
    Usage_Statistics: {
        Total_Usage: number;
        Total_Discount: number;
        Average_Discount: number;
        Usage_By_Date: {
            Date: string;
            Count: number;
            Total_Discount: number;
        }[];
    };
}

// Interface cho kết quả kiểm tra mã khuyến mãi
export interface PromotionValidationResult {
    IsValid: boolean;
    Message: string;
    PromotionId: number | null;
    PromotionCode: string;
    Title: string;
    DiscountType: string;
    DiscountValue: number;
    DiscountAmount: number;
    FinalAmount: number;
    ExpiresOn: string | null;
}

// Interface cho kết quả áp dụng mã khuyến mãi
export interface PromotionApplicationResult {
    Success: boolean;
    Message: string;
    BookingId: number | null;
    PromotionId: number | null;
    PromotionCode: string;
    DiscountAmount: number;
    OriginalTotal: number;
    NewTotal: number;
}

// Interface cho kết quả xóa mã khuyến mãi
export interface PromotionRemovalResult {
    Success: boolean;
    Message: string;
    BookingId: number | null;
    NewTotal: number;
}

// Interface cho danh mục khuyến mãi
export interface PromotionCategory {
    id: string;
    name: string;
    icon: string;
    count: number;
    color: string;
} 