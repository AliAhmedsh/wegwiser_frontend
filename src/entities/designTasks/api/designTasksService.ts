import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const designTasksApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/design-bar`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

designTasksApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

designTasksApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface DesignTask {
  id: number;
  text: string;
  done: boolean;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  workspace?: {
    id: number;
    name: string;
    productId: number;
    product: {
      id: number;
      name: string;
    };
  };
}

export interface CreateDesignTaskRequest {
  text: string;
  productId?: number; // Optional product ID for validation
  vehicleId?: number; // Vehicle ID
}

export interface UpdateDesignTaskRequest {
  text?: string;
  done?: boolean;
  vehicleId?: number;
}

interface GetDesignTasksResponse {
  success: boolean;
  tasks: DesignTask[];
  workspace: {
    id: number;
    name: string;
    productId: number;
    updatedAt: string;
    product: {
      id: number;
      name: string;
    };
  };
  error?: string;
}

interface CreateDesignTaskResponse {
  success: boolean;
  task: DesignTask;
  workspace: {
    id: number;
    name: string;
    productId: number;
    updatedAt: string;
    product: {
      id: number;
      name: string;
    };
  };
  message?: string;
  error?: string;
}

interface UpdateDesignTaskResponse {
  success: boolean;
  task: DesignTask;
  message?: string;
  error?: string;
}

interface DeleteDesignTaskResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class DesignTasksService {
  async getDesignTasks(workspaceId: number | null, productId?: number, vehicleId?: number): Promise<GetDesignTasksResponse> {
    // If only productId is provided, use a placeholder workspaceId (0)
    // Backend will find workspace by productId from query params
    const effectiveWorkspaceId = workspaceId || 0;
    const params: any = {};
    if (productId) params.productId = productId;
    if (vehicleId) params.vehicleId = vehicleId;
    const response = await designTasksApi.get<GetDesignTasksResponse>(`/${effectiveWorkspaceId}/tasks`, { params });
    return response.data;
  }

  async createDesignTask(workspaceId: number | null, data: CreateDesignTaskRequest): Promise<CreateDesignTaskResponse> {
    // If only productId is provided, use a placeholder workspaceId (0)
    // Backend will find workspace by productId from request body
    const effectiveWorkspaceId = workspaceId || 0;
    const response = await designTasksApi.post<CreateDesignTaskResponse>(`/${effectiveWorkspaceId}/tasks`, data);
    return response.data;
  }

  async updateDesignTask(taskId: number, data: UpdateDesignTaskRequest): Promise<UpdateDesignTaskResponse> {
    const response = await designTasksApi.patch<UpdateDesignTaskResponse>(`/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteDesignTask(taskId: number): Promise<DeleteDesignTaskResponse> {
    const response = await designTasksApi.delete<DeleteDesignTaskResponse>(`/tasks/${taskId}`);
    return response.data;
  }
}

export const designTasksService = new DesignTasksService();
