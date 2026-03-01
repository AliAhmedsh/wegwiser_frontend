import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const userApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/messaging`,
  timeout: 10000,
});

const profileApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/user`,
  timeout: 30000, // Increased timeout to 30 seconds
});

userApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

profileApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

profileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
  position?: string;
  isOnline?: boolean;
}

export interface GetAllUsersResponse {
  success: boolean;
  users: User[];
}

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  phone: string | null;
  address: string[] | null;
  status: string;
  timezone: string;
  currentTime: string;
  inProgressProducts: number;
  inProgressVehicles: number;
  createdAt: string;
  updatedAt: string;
  permissions: {
    canCreateProducts: boolean;
    canManageTeam: boolean;
    canAccessDesignTools: boolean;
    canAccessEngineering: boolean;
  };
}

export interface UserProfileResponse {
  success: boolean;
  profile: UserProfile;
}

class UserService {
  async getAllUsers(): Promise<GetAllUsersResponse> {
    try {
      const response = await userApi.get<GetAllUsersResponse>('/users');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  }

  async getProfile(): Promise<UserProfileResponse> {
    try {
      const response = await profileApi.get<UserProfileResponse>('/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
    }
  }
}

export const userService = new UserService();
