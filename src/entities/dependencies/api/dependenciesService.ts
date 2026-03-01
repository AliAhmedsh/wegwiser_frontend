import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const dependenciesApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/engineering-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

dependenciesApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

dependenciesApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface Dependency {
  id: number;
  name: string;
  description: string;
  type: 'library' | 'service' | 'api' | 'database';
  version?: string;
  status: 'active' | 'deprecated' | 'pending';
  createdAt: string;
  updatedAt: string;
  productId: number;
  createdBy: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDependencyRequest {
  name: string;
  description: string;
  type: 'library' | 'service' | 'api' | 'database';
  version?: string;
  status: 'active' | 'deprecated' | 'pending';
  vehicleId?: number;
}

export interface UpdateDependencyRequest {
  name?: string;
  description?: string;
  type?: 'library' | 'service' | 'api' | 'database';
  version?: string;
  status?: 'active' | 'deprecated' | 'pending';
  vehicleId?: number;
}

interface GetDependenciesResponse {
  success: boolean;
  dependencies: Dependency[];
  error?: string;
}

interface CreateDependencyResponse {
  success: boolean;
  dependency: Dependency;
  message?: string;
  error?: string;
}

interface UpdateDependencyResponse {
  success: boolean;
  dependency: Dependency;
  message?: string;
  error?: string;
}

interface DeleteDependencyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class DependenciesService {
  async getDependencies(productId: number, vehicleId?: number): Promise<GetDependenciesResponse> {
    const params: any = {};
    if (vehicleId) params.vehicleId = vehicleId;
    const response = await dependenciesApi.get<GetDependenciesResponse>(`/${productId}/dependencies`, { params });
    return response.data;
  }

  async createDependency(productId: number, data: CreateDependencyRequest): Promise<CreateDependencyResponse> {
    const response = await dependenciesApi.post<CreateDependencyResponse>(`/${productId}/dependencies`, data);
    return response.data;
  }

  async updateDependency(dependencyId: number, data: UpdateDependencyRequest): Promise<UpdateDependencyResponse> {
    const response = await dependenciesApi.put<UpdateDependencyResponse>(`/dependencies/${dependencyId}`, data);
    return response.data;
  }

  async deleteDependency(dependencyId: number): Promise<DeleteDependencyResponse> {
    const response = await dependenciesApi.delete<DeleteDependencyResponse>(`/dependencies/${dependencyId}`);
    return response.data;
  }
}

export const dependenciesService = new DependenciesService();
