import api from '../config/api';
import type { MovieReferences } from '../types/movie';

export const referenceService = {
    /**
     * Lấy tất cả dữ liệu tham chiếu cho phim.
     */
    async getMovieReferences(): Promise<MovieReferences> {
        try {
            const response = await api.get('/references');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching movie references:', error);
            // Trả về một đối tượng trống để tránh lỗi ở phía client
            return {
                actors: [],
                productionCompanies: [],
                directors: [],
                languages: [],
                countries: [],
                genres: [],
                ratings: [],
                statuses: [],
            };
        }
    },

    /**
     * Lấy danh sách rating hợp lệ từ backend
     */
    async getValidRatings(): Promise<string[]> {
        try {
            const references = await this.getMovieReferences();
            return references.ratings || ['P', 'C13', 'C16', 'C18'];
        } catch (error) {
            console.error('Error fetching valid ratings:', error);
            // Trả về danh sách mặc định nếu lỗi
            return ['P', 'C13', 'C16', 'C18'];
        }
    }
}; 