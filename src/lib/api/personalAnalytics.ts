import { apiClient } from './client';

export interface PersonalAnalytics {
  performance: {
    speed: number;
    efficiency: number;
    quality: number;
  };
  metrics: {
    involvedProducts: number;
    unreadMessages: number;
    availableCapacity: number;
    involvedVehicles: number;
    mentions: number;
    operatingCapacity: number;
  };
  lastUpdated: string;
}

export const fetchPersonalAnalytics = async (productId: number): Promise<PersonalAnalytics> => {
  const response = await apiClient.get(`/personal-analytics/${productId}`);
  return response.data.analytics;
};

export interface UserAnalytics {
  performance: {
    speed: number;
    efficiency: number;
    quality: number;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgCompletionTime: number;
    involvedVehicles: number;
    notesCount: number;
    mentions: number;
    aiInteractions: number;
    involvedProducts: number;
  };
  lastUpdated: string;
}

export const fetchUserAnalytics = async (userId: number, productId?: number): Promise<UserAnalytics> => {
  const url = productId 
    ? `/personal-analytics/user/${userId}?productId=${productId}`
    : `/personal-analytics/user/${userId}`;
  const response = await apiClient.get(url);
  return response.data.analytics;
};
