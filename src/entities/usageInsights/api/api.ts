import { API_CONFIG } from '@/lib/config/api';
import axios from '@/lib/config/axiosConfig';

interface UsageInsightsData {
  activeUsers: number;
  aiSuggestionsAccepted: number;
  avgTimeSaved: number;
  engagementOverTime: number;
  suggestionsMade: number;
  ticketsCreated: number;
  engagementData: Array<{
    date: string;
    value: number;
  }>;
  feedbackData: {
    positive: number;
    negative: number;
    neutral: number;
  };
  lastUpdated: string;
}

interface UsageInsightsResponse {
  success: boolean;
  data: UsageInsightsData;
}

class UsageInsightsApiService {
  private static _instance: UsageInsightsApiService | null = null;
  private baseURL = `${API_CONFIG.BASE_URL}/usage-insights`;

  static getInstance(): UsageInsightsApiService {
    if (!UsageInsightsApiService._instance) {
      UsageInsightsApiService._instance = new UsageInsightsApiService();
    }
    return UsageInsightsApiService._instance;
  }

  async getUsageInsights(productId: number): Promise<UsageInsightsResponse> {
    if (!productId || productId <= 0) {
      throw new Error('Valid product ID is required');
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/${productId}`, {
        timeout: 10000,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch usage insights');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          throw new Error('You do not have access to this product.');
        } else if (error.response?.status === 404) {
          throw new Error('Product not found.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
      }
      throw error;
    }
  }
}

export const usageInsightsApiService = UsageInsightsApiService.getInstance();
export type { UsageInsightsData, UsageInsightsResponse };
