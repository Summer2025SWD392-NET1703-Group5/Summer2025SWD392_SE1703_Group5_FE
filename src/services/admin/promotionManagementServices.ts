import axios from 'axios';
import api from '../../config/api';

export interface Promotion {
    Promotion_ID: number;
    Title: string;
    Promotion_Code: string;
    Start_Date: string;
    End_Date: string;
    Discount_Type: string;
    Discount_Value: number;
    Minimum_Purchase: number;
    Maximum_Discount?: number;
    Applicable_For: string;
    Usage_Limit: number;
    Current_Usage: number;
    Status: string;
    Promotion_Detail?: string;
    Created_At: string;
    Created_By: string;
    Is_Expired: boolean;
    Is_Active: boolean;
}

export interface CreatePromotionDto {
    Title: string;
    Promotion_Code: string;
    Start_Date: string;
    End_Date: string;
    Discount_Type: string;
    Discount_Value: number;
    Minimum_Purchase: number;
    Maximum_Discount?: number;
    Applicable_For?: string;
    Usage_Limit: number;
    Status: string;
    Promotion_Detail?: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> { }

// Get all promotions
export const getAllPromotions = async () => {
    try {
        const response = await api.get<Promotion[]>('/promotions');
        return response.data;
    } catch (error) {
        console.error('Error fetching promotions:', error);
        throw error;
    }
};

// Get promotion details by ID
export const getPromotionById = async (id: string) => {
    try {
        const response = await api.get<Promotion>(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching promotion with id ${id}:`, error);
        throw error;
    }
};

// Create a new promotion
export const createPromotion = async (promotionData: CreatePromotionDto) => {
    try {
        const response = await api.post<Promotion>('/promotions', promotionData);
        return response.data;
    } catch (error) {
        console.error('Error creating promotion:', error);
        throw error;
    }
};

// Update an existing promotion
export const updatePromotion = async (id: string, updateData: UpdatePromotionDto) => {
    try {
        const response = await api.put<Promotion>(`/promotions/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error(`Error updating promotion with id ${id}:`, error);
        throw error;
    }
};

// Delete a promotion
export const deletePromotion = async (id: string) => {
    try {
        const response = await api.delete(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting promotion with id ${id}:`, error);
        throw error;
    }
};
