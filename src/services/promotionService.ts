import api from '../config/api';
import type {
    Promotion,
    ApiPromotion,
    PromotionValidationResult,
    PromotionApplicationResult,
    PromotionRemovalResult,
    PromotionCategory
} from '../types/promotion';

// Helper để chuyển đổi key từ snake_case và PascalCase sang camelCase
const toCamel = (s: string): string => {
    const cameled = s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
    // Xử lý trường hợp PascalCase không có dấu gạch dưới (ví dụ: MovieID -> movieID)
    return cameled.charAt(0).toLowerCase() + cameled.slice(1);
};

const keysToCamel = (o: any): any => {
    if (Array.isArray(o)) {
        return o.map(v => keysToCamel(v));
    } else if (o !== null && typeof o === 'object') {
        return Object.keys(o).reduce((acc, key) => {
            const camelKey = toCamel(key);
            acc[camelKey] = keysToCamel(o[key]);
            return acc;
        }, {} as any);
    }
    return o;
};

// Map API promotion to frontend promotion model
const mapApiToPromotion = (apiPromotion: ApiPromotion): Promotion => {
    // Calculate discounted price based on discount type and value
    const originalPrice = 120000; // Giả lập giá gốc để demo
    let discountedPrice = originalPrice;
    let discountPercentage = 0;

    if (apiPromotion.Discount_Type === 'Percentage') {
        discountPercentage = apiPromotion.Discount_Value;
        discountedPrice = originalPrice * (1 - discountPercentage / 100);
    } else { // Fixed discount
        discountedPrice = Math.max(0, originalPrice - apiPromotion.Discount_Value);
        discountPercentage = Math.round((originalPrice - discountedPrice) / originalPrice * 100);
    }

    // Map badge based on promotion status
    let badge: 'HOT' | 'NEW' | 'LIMITED' | null = null;

    // Check if promotion has limited usage remaining
    if (apiPromotion.Usage_Remaining !== null && apiPromotion.Usage_Remaining < 10) {
        badge = 'LIMITED';
    } else if (apiPromotion.Discount_Value > 30 && apiPromotion.Discount_Type === 'Percentage') {
        badge = 'HOT';
    } else {
        // Default to NEW for active promotions
        badge = 'NEW';
    }

    // Get promotion category based on title
    let category: Promotion['category'] = 'special';
    const titleLower = apiPromotion.Title.toLowerCase();

    if (titleLower.includes('vip') || titleLower.includes('premium')) {
        category = 'premium';
    } else if (titleLower.includes('member')) {
        category = 'member';
    } else if (titleLower.includes('holiday') || titleLower.includes('festival')) {
        category = 'holiday';
    } else if (titleLower.includes('pack')) {
        category = 'movie-pack';
    } else if (titleLower.includes('subscription')) {
        category = 'subscription';
    } else if (titleLower.includes('package')) {
        category = 'package';
    }

    // Parse terms from Promotion_Detail and add additional conditions
    const baseTerms = apiPromotion.Promotion_Detail
        ? apiPromotion.Promotion_Detail.split('\n').filter(term => term.trim() !== '')
        : [];

    // Add standard terms based on API data, nhưng bỏ phần tử đầu tiên
    const terms = baseTerms.length > 1 ? baseTerms.slice(1) : [];

    // Thêm điều kiện về giá trị đơn hàng tối thiểu
    if (apiPromotion.Minimum_Purchase > 0) {
        terms.push(`Áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(apiPromotion.Minimum_Purchase)} trở lên`);
    }

    // Thêm điều kiện về giảm giá tối đa
    if (apiPromotion.Maximum_Discount) {
        terms.push(`Giảm giá tối đa ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(apiPromotion.Maximum_Discount)}`);
    }

    // Thêm điều kiện về đối tượng áp dụng (dựa vào title vì API không có Applicable_For)
    if (titleLower.includes('vip') || titleLower.includes('premium')) {
        terms.push('Chỉ áp dụng cho thành viên VIP');
    }

    // Fix cứng điều kiện mỗi người chỉ được sử dụng một lần
    terms.push('Mỗi người chỉ được sử dụng một lần');

    // Đảm bảo không có term trùng lặp
    const uniqueTerms = [...new Set(terms)];

    // Dựa vào ID của promotion, tạo hình ảnh ổn định thay vì random mỗi lần gọi API
    const imageIndex = apiPromotion.Promotion_ID % 6; // Mod với số lượng hình ảnh mẫu
    const imageSamples = [
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=400&fit=crop",
        "https://images.unsplash.com/photo-1617914309185-9e63b3badfca?w=800&h=400&fit=crop"
    ];

    return {
        id: apiPromotion.Promotion_ID,
        title: apiPromotion.Title,
        description: apiPromotion.Promotion_Detail,
        image: imageSamples[imageIndex],
        originalPrice,
        discountedPrice,
        discountPercentage,
        validUntil: apiPromotion.End_Date,
        category,
        badge,
        isActive: new Date(apiPromotion.End_Date) > new Date(), // Check if not expired
        terms: uniqueTerms,
        code: apiPromotion.Promotion_Code,
        usageLimit: apiPromotion.Usage_Remaining || 999, // Fallback nếu không có limit
        currentUsage: 0, // API không trả về current usage
        remainingUsage: apiPromotion.Usage_Remaining || 999,
        discountType: apiPromotion.Discount_Type,
        discountValue: apiPromotion.Discount_Value,
        minimumPurchase: apiPromotion.Minimum_Purchase
    };
};

class PromotionService {
    /**
     * Lấy danh sách tất cả khuyến mãi
     */
    async getAllPromotions(): Promise<Promotion[]> {
        try {
            // Try multiple endpoints in sequence
            const endpoints = ['/promotions', '/api/promotions', '/promotion/all'];
            let promotionsData = [];
            let success = false;

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying to fetch promotions from ${endpoint}`);
                    const response = await api.get(endpoint);
                    console.log(`Raw API response from ${endpoint}:`, response);

                    // Handle different API response formats
                    let data = response.data;

                    // Check if the response is wrapped in a data property
                    if (response.data && response.data.data) {
                        data = response.data.data;
                    }

                    // Check if it's an array
                    if (!Array.isArray(data)) {
                        console.warn(`Promotions data from ${endpoint} is not an array, trying to extract array`, data);
                        // Try to find an array in the response
                        for (const key in data) {
                            if (Array.isArray(data[key])) {
                                data = data[key];
                                break;
                            }
                        }
                    }

                    // If we found an array with items, use it
                    if (Array.isArray(data) && data.length > 0) {
                        promotionsData = data.filter(promo => promo != null);
                        console.log(`Successfully fetched ${promotionsData.length} promotions from ${endpoint}`);
                        success = true;
                        break;
                    }
                } catch (endpointError) {
                    console.warn(`Failed to fetch promotions from ${endpoint}:`, endpointError);
                    // Continue to the next endpoint
                }
            }

            if (!success) {
                console.error('Failed to fetch promotions from any endpoint, using mock data');
                // Return mock data if all API calls fail
                return this.getMockPromotions();
            }

            // Convert API promotions to frontend format
            return promotionsData.map((apiPromo: ApiPromotion) => mapApiToPromotion(apiPromo));
        } catch (error) {
            console.error('Error fetching promotions:', error);
            // Return mock data if API fails
            return this.getMockPromotions();
        }
    }

    /**
     * Lấy thông tin chi tiết của một khuyến mãi theo ID
     */
    async getPromotionById(id: number): Promise<Promotion | null> {
        try {
            // Try multiple endpoints
            const endpoints = [`/promotions/${id}`, `/api/promotions/${id}`];

            for (const endpoint of endpoints) {
                try {
                    const response = await api.get(endpoint);
                    if (response.data) {
                        return mapApiToPromotion(response.data);
                    }
                } catch (endpointError) {
                    console.warn(`Failed to fetch from ${endpoint}`, endpointError);
                }
            }

            // If all endpoints fail, find in mock data
            const mockPromotions = this.getMockPromotions();
            return mockPromotions.find(p => p.id === id) || null;
        } catch (error) {
            console.error(`Error fetching promotion with id ${id}:`, error);
            // Try to get from mock data
            const mockPromotions = this.getMockPromotions();
            return mockPromotions.find(p => p.id === id) || null;
        }
    }

    /**
     * Kiểm tra mã khuyến mãi có hợp lệ không
     */
    async validatePromotionCode(code: string, totalAmount: number = 0): Promise<PromotionValidationResult> {
        try {
            const response = await api.post('/promotions/validate', {
                promotionCode: code,
                totalAmount
            });
            return keysToCamel(response.data);
        } catch (error) {
            console.error('Error validating promotion code:', error);
            return {
                IsValid: false,
                Message: 'Có lỗi xảy ra khi kiểm tra mã khuyến mãi',
                PromotionId: null,
                PromotionCode: code,
                Title: '',
                DiscountType: '',
                DiscountValue: 0,
                DiscountAmount: 0,
                FinalAmount: totalAmount,
                ExpiresOn: null
            };
        }
    }

    /**
     * Áp dụng mã khuyến mãi vào đơn đặt vé
     */
    async applyPromotion(bookingId: number, promotionCode: string): Promise<PromotionApplicationResult> {
        try {
            const response = await api.post('/promotions/apply', {
                bookingId,
                promotionCode
            });
            return keysToCamel(response.data);
        } catch (error) {
            return {
                Success: false,
                Message: 'Có lỗi xảy ra khi áp dụng mã khuyến mãi',
                BookingId: bookingId,
                PromotionId: null,
                PromotionCode: promotionCode,
                DiscountAmount: 0,
                OriginalTotal: 0,
                NewTotal: 0
            };
        }
    }

    /**
     * Hủy áp dụng mã khuyến mãi
     */
    async removePromotion(bookingId: number): Promise<PromotionRemovalResult> {
        try {
            const response = await api.delete(`/promotions/remove/${bookingId}`);
            return keysToCamel(response.data);
        } catch (error) {
            return {
                Success: false,
                Message: 'Có lỗi xảy ra khi hủy mã khuyến mãi',
                BookingId: bookingId,
                NewTotal: 0
            };
        }
    }

    /**
     * Lấy các khuyến mãi hiện có cho người dùng
     */
    async getAvailablePromotions(): Promise<Promotion[]> {
        try {
            const response = await api.get('/promotions/available');
            if (response.data && Array.isArray(response.data)) {
                return response.data.map((apiPromo: ApiPromotion) => mapApiToPromotion(apiPromo));
            }
            return this.getMockPromotions();
        } catch (error) {
            console.error('Error fetching available promotions:', error);
            return this.getMockPromotions();
        }
    }

    /**
     * Lấy các danh mục khuyến mãi
     */
    async getPromotionCategories(): Promise<PromotionCategory[]> {
        // In a real implementation, this would fetch from an API
        // For now, we'll return mock data
        return [
            {
                id: "special",
                name: "Ưu Đãi Đặc Biệt",
                icon: "🎁",
                count: 12,
                color: "from-amber-500 to-amber-700"
            },
            {
                id: "package",
                name: "Gói Combo",
                icon: "🍿",
                count: 8,
                color: "from-blue-500 to-blue-700"
            },
            {
                id: "member",
                name: "Ưu Đãi Thành Viên",
                icon: "🏆",
                count: 6,
                color: "from-purple-500 to-purple-700"
            },
            {
                id: "holiday",
                name: "Khuyến Mãi Lễ Hội",
                icon: "🎉",
                count: 5,
                color: "from-green-500 to-green-700"
            }
        ];
    }

    /**
     * Trả về dữ liệu mẫu nếu API gặp lỗi
     * @private
     */
    private getMockPromotions(): Promotion[] {
        return [
            {
                id: 1,
                title: "Happy Weekend - Giảm 30% Vé Cuối Tuần",
                description: "Thưởng thức các bộ phim bom tấn với giá ưu đãi vào ngày cuối tuần. Áp dụng cho tất cả các suất chiếu từ 10:00 - 13:00 thứ Bảy và Chủ Nhật.",
                image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
                originalPrice: 120000,
                discountedPrice: 84000,
                discountPercentage: 30,
                validUntil: "2023-12-31",
                category: "special",
                badge: "HOT",
                isActive: true,
                terms: [
                    "Áp dụng cho suất chiếu sáng cuối tuần (10:00 - 13:00)",
                    "Không áp dụng cho phim 3D và phim đặc biệt",
                    "Mỗi mã chỉ áp dụng cho 1 vé"
                ],
                code: "WEEKEND30",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Percentage",
                discountValue: 30,
                minimumPurchase: 0
            },
            {
                id: 2,
                title: "Student Deal - Ưu Đãi Học Sinh, Sinh Viên",
                description: "Giảm 25% giá vé cho học sinh, sinh viên khi đặt vé online. Chỉ cần nhập mã và xác thực thẻ học sinh/sinh viên khi nhận vé.",
                image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=400&fit=crop",
                originalPrice: 120000,
                discountedPrice: 90000,
                discountPercentage: 25,
                validUntil: "2023-11-30",
                category: "special",
                badge: "NEW",
                isActive: true,
                terms: [
                    "Bắt buộc xuất trình thẻ học sinh/sinh viên khi nhận vé",
                    "Áp dụng mọi ngày trong tuần",
                    "Không áp dụng cho phim 3D và phim đặc biệt"
                ],
                code: "STUDENT25",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Fixed",
                discountValue: 30000,
                minimumPurchase: 0
            },
            {
                id: 3,
                title: "Movie Tuesday - Thứ Ba Vui Vẻ",
                description: "Mọi thứ Ba trong tuần, đồng giá vé chỉ 60.000đ cho tất cả các suất chiếu. Cơ hội tuyệt vời để thưởng thức phim với giá cực kỳ ưu đãi.",
                image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=400&fit=crop",
                originalPrice: 120000,
                discountedPrice: 60000,
                discountPercentage: 50,
                validUntil: "2023-10-15",
                category: "special",
                badge: "LIMITED",
                isActive: true,
                terms: [
                    "Chỉ áp dụng vào thứ Ba hàng tuần",
                    "Không áp dụng cho phim 3D và phim đặc biệt",
                    "Số lượng vé giới hạn mỗi suất chiếu"
                ],
                code: "TUESDAY50",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Fixed",
                discountValue: 60000,
                minimumPurchase: 0
            },
            {
                id: 4,
                title: "Family Package - Gói Gia Đình (4 Vé)",
                description: "Gói vé gia đình tiết kiệm gồm 4 vé xem phim, 2 bắp lớn và 4 nước ngọt. Lựa chọn hoàn hảo cho buổi xem phim gia đình.",
                image: "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&h=400&fit=crop",
                originalPrice: 600000,
                discountedPrice: 450000,
                discountPercentage: 25,
                validUntil: "2023-12-31",
                category: "package",
                badge: "HOT",
                isActive: true,
                terms: [
                    "Áp dụng cho 4 người, ngồi liền kề",
                    "Bao gồm 2 bắp lớn và 4 nước ngọt",
                    "Đặt trước ít nhất 24 giờ"
                ],
                code: "FAMILY4",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Percentage",
                discountValue: 25,
                minimumPurchase: 0
            },
            {
                id: 5,
                title: "Ưu Đãi Ngày Đầu Công Chiếu",
                description: "Giảm 20% cho khách hàng đặt vé suất chiếu đầu tiên của các phim mới. Cơ hội trải nghiệm những bộ phim đình đám sớm nhất với giá ưu đãi.",
                image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=400&fit=crop",
                originalPrice: 150000,
                discountedPrice: 120000,
                discountPercentage: 20,
                validUntil: "2023-12-31",
                category: "special",
                badge: null,
                isActive: true,
                terms: [
                    "Chỉ áp dụng cho suất chiếu đầu tiên của phim mới",
                    "Đặt vé trước tối thiểu 48 giờ",
                    "Số lượng giới hạn mỗi suất chiếu"
                ],
                code: "PREMIERE20",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Percentage",
                discountValue: 20,
                minimumPurchase: 0
            },
            {
                id: 6,
                title: "Member Monday - Thứ Hai Cho Thành Viên",
                description: "Thành viên của rạp được giảm 40% giá vé vào mọi thứ Hai. Cùng khởi đầu tuần mới với một bộ phim tuyệt vời!",
                image: "https://images.unsplash.com/photo-1617914309185-9e63b3badfca?w=800&h=400&fit=crop",
                originalPrice: 120000,
                discountedPrice: 72000,
                discountPercentage: 40,
                validUntil: "2023-11-30",
                category: "member",
                badge: "NEW",
                isActive: true,
                terms: [
                    "Chỉ áp dụng cho thành viên đã đăng ký",
                    "Áp dụng vào thứ Hai hàng tuần",
                    "Mỗi thành viên được mua tối đa 2 vé/ngày"
                ],
                code: "MEMBER40",
                usageLimit: 100,
                currentUsage: 0,
                remainingUsage: 100,
                discountType: "Percentage",
                discountValue: 40,
                minimumPurchase: 0
            }
        ];
    }

    /**
     * Lấy danh sách các khuyến mãi mà người dùng đã sử dụng
     */
    async getUsedPromotions(): Promise<number[]> {
        try {
            console.log('Fetching used promotions from API...');
            const response = await api.get('/promotions/customer/used-promotions');

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                console.log('Used promotions received:', response.data.data);
                // API trả về mảng các object chứa thông tin chi tiết, lấy ra Promotion_ID
                return response.data.data.map((item: any) => item.Promotion_ID);
            }

            console.log('No used promotions found or invalid response format');
            return [];
        } catch (error) {
            console.error('Error fetching used promotions:', error);
            // Trả về mảng rỗng nếu API gặp lỗi
            return [];
        }
    }

    /**
     * Lấy các khuyến mãi khả dụng cho booking cụ thể (chưa sử dụng)
     * Gọi API endpoint: GET /api/promotions/available/{bookingId}
     */
    async getAvailablePromotionsForBooking(bookingId: number, totalAmount: number = 0): Promise<Promotion[]> {
        try {
            // Gọi API endpoint đúng như server đã implement
            const response = await api.get(`/promotions/available/${bookingId}`);

            // Xử lý response data
            let promotionsData = [];
            if (response.data && response.data.success && Array.isArray(response.data.promotions)) {
                promotionsData = response.data.promotions;
            } else {
                return [];
            }

            // Convert API promotions to frontend format
            const availablePromotions = promotionsData.map((apiPromo: ApiPromotion) => {
                return mapApiToPromotion(apiPromo);
            });

            // Sắp xếp theo mức độ ưu tiên (giảm giá cao nhất trước)
            return availablePromotions.sort((a, b) => {
                // Ưu tiên khuyến mãi có badge HOT
                if (a.badge === 'HOT' && b.badge !== 'HOT') return -1;
                if (b.badge === 'HOT' && a.badge !== 'HOT') return 1;

                // Sau đó sắp xếp theo % giảm giá
                return b.discountPercentage - a.discountPercentage;
            });

        } catch (error) {

            // Fallback: trả về mock data nếu API lỗi
            const mockPromotions = this.getMockPromotions();
            return mockPromotions.filter(p => p.isActive && p.remainingUsage > 0).slice(0, 3);
        }
    }
}

export const promotionService = new PromotionService(); 