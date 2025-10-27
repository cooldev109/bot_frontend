import { apiClient, ApiResponse } from '../api-client';

export interface ShopifyConfig {
  store_url: string;
  access_token: string;
  api_version?: string;
}

export interface ShopifyConfigResponse {
  success: boolean;
  data?: {
    id: number;
    business_id: number;
    store_url: string;
    access_token?: string;
    api_version: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export const ShopifyService = {
  /**
   * Get Shopify configuration for a business
   */
  async getConfig(businessId: number): Promise<ShopifyConfigResponse> {
    return apiClient.get(`/shopify/config/${businessId}`);
  },

  /**
   * Save Shopify configuration
   */
  async saveConfig(businessId: number, config: ShopifyConfig): Promise<ShopifyConfigResponse> {
    return apiClient.post(`/shopify/config/${businessId}`, config);
  },

  /**
   * Delete Shopify configuration
   */
  async deleteConfig(businessId: number): Promise<{ success: boolean; error?: string }> {
    return apiClient.delete(`/shopify/config/${businessId}`);
  },

  /**
   * Test Shopify connection
   */
  async testConnection(businessId: number): Promise<{ success: boolean; error?: string; message?: string }> {
    return apiClient.get(`/shopify/test/${businessId}`);
  }
};
