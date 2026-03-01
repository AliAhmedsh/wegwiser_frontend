import { handleProductApiError, handleProductApiSuccess } from '@/entities/product/utils/errorHandler';
import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import { showToast } from '@/lib/utils/toast';
import axios from 'axios';

const makeRequest = async (method: string, url: string, data?: any) => {
  try {
    const token = getCookie('access_token');
    const fullUrl = `${API_CONFIG.BASE_URL}/design-bar${url}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    const config: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      return {
        data: null,
        status: response.status,
        statusText: response.statusText,
        isError: true,
        error: {
          response: {
            status: response.status,
            data: errorData
          },
          message: `HTTP ${response.status}: ${response.statusText}`,
          suppressConsoleError: false
        }
      };
    }
    
    const responseData = await response.json();
    
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      isError: false
    };
  } catch (error: any) {
    return {
      data: null,
      status: 0,
      statusText: 'Network Error',
      isError: true,
      error: {
        message: error.message || 'Network error occurred',
        response: {
          status: 0,
          data: { error: 'Network error occurred' }
        },
        suppressConsoleError: false
      }
    };
  }
};


const engineeringApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/engineering-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});


engineeringApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

engineeringApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface DesignFileVehicle {
  id: number;
  vehicleId: number;
  createdAt: string;
  vehicle: {
    id: number;
    name: string;
  };
}

export interface DesignFile {
  id: number;
  name: string;
  subtitle?: string;
  ready: boolean;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
  vehicles?: DesignFileVehicle[];
}

export interface CreateDesignFileRequest {
  name: string;
  subtitle?: string;
  ready?: boolean;
  vehicleIds?: number[];
}

export interface UpdateDesignFileRequest {
  name?: string;
  subtitle?: string;
  ready?: boolean;
}

interface GetDesignFilesResponse {
  success: boolean;
  files: DesignFile[];
  workspace?: {
    id: number;
    name: string;
  };
  error?: string;
}

interface CreateDesignFileResponse {
  success: boolean;
  file: DesignFile;
  message?: string;
  error?: string;
}

interface UpdateDesignFileResponse {
  success: boolean;
  file: DesignFile;
  message?: string;
  error?: string;
}

interface DeleteDesignFileResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class DesignFilesService {
  async getDesignFiles(workspaceId: number, vehicleId?: number): Promise<GetDesignFilesResponse> {
    // vehicleId is required by backend, so always include it in the URL
    if (!vehicleId) {
      return {
        success: false,
        files: [],
        workspace: { id: workspaceId, name: 'Unknown' },
        error: 'vehicleId is required'
      };
    }
    const url = `/${workspaceId}/files?vehicleId=${vehicleId}`;
    const response = await makeRequest('get', url);
    
    if (response.isError && response.error) {
      try {
        handleProductApiError(response.error, 'Failed to fetch design files');
      } catch (error) {
        showToast.error('Failed to fetch design files');
      }
      if (response.error.response?.status === 401) {
        try {
          const authErrorHandler = createAuthErrorInterceptor();
          authErrorHandler(response.error);
        } catch (authError) {
          // Silent fallback
        }
        return {
          success: false,
          files: [],
          workspace: { id: workspaceId, name: 'Unknown' },
          error: 'Authentication required'
        };
      }
      
      return {
        success: false,
        files: [],
        workspace: { id: workspaceId, name: 'Unknown' },
        error: response.error.response?.data?.error || response.error.message || 'Failed to fetch design files'
      };
    }
    
    return response.data;
  }

  async getDesignFilesByProduct(productId: number, vehicleId?: number): Promise<GetDesignFilesResponse> {
    // vehicleId is required by backend, so always include it in the URL
    if (!vehicleId) {
      return {
        success: false,
        files: [],
        workspace: { id: 0, name: 'Unknown' },
        error: 'vehicleId is required'
      };
    }
    const url = `/products/${productId}/files?vehicleId=${vehicleId}`;
    const response = await makeRequest('get', url);

    if (response.isError && response.error) {
      try {
        handleProductApiError(response.error, 'Failed to fetch design files');
      } catch (handlerError) {
        showToast.error('Failed to fetch design files');
      }

      return {
        success: false,
        files: [],
        workspace: { id: 0, name: 'Unknown' },
        error: response.error.response?.data?.error || response.error.message || 'Failed to fetch design files'
      };
    }

    return response.data;
  }

  async createDesignFile(workspaceId: number, data: CreateDesignFileRequest): Promise<CreateDesignFileResponse> {
    const response = await makeRequest('post', `/${workspaceId}/files`, data);
    if (response.isError && response.error) {
      if (response.error.response?.status === 401) {
        try {
          const authErrorHandler = createAuthErrorInterceptor();
          authErrorHandler(response.error);
        } catch (authError) {
          // Silent fallback
        }
        return {
          success: false,
          file: {} as DesignFile,
          error: 'Authentication required'
        };
      }
      
      const errorToPass = response.error || {
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        },
        message: 'Failed to create design file',
        suppressConsoleError: false
      };
      
      try {
        handleProductApiError(errorToPass, 'Failed to create design file');
      } catch (error) {
        showToast.error('Failed to create design file');
      }
      return {
        success: false,
        file: {} as DesignFile,
        error: response.error.response?.data?.error || response.error.message || 'Failed to create design file'
      };
    }
    
    if (response.data.success) {
      handleProductApiSuccess('Design file created successfully!');
    }
    
    return response.data;
  }

  async createDesignFileByProduct(productId: number, data: CreateDesignFileRequest): Promise<CreateDesignFileResponse> {
    const response = await makeRequest('post', `/products/${productId}/files`, data);
    if (response.isError && response.error) {
      if (response.error.response?.status === 401) {
        try {
          const authErrorHandler = createAuthErrorInterceptor();
          authErrorHandler(response.error);
        } catch (authError) {
          // Silent fallback
        }
        return {
          success: false,
          file: {} as DesignFile,
          error: 'Authentication required'
        };
      }
      
      const errorToPass = response.error || {
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        },
        message: 'Failed to create design file',
        suppressConsoleError: false
      };
      
      try {
        handleProductApiError(errorToPass, 'Failed to create design file');
      } catch (error) {
        showToast.error('Failed to create design file');
      }
      return {
        success: false,
        file: {} as DesignFile,
        error: response.error.response?.data?.error || response.error.message || 'Failed to create design file'
      };
    }
    
    if (response.data.success) {
      handleProductApiSuccess('Design file created successfully!');
    }
    
    return response.data;
  }

  async updateDesignFile(fileId: number, data: UpdateDesignFileRequest): Promise<UpdateDesignFileResponse> {
    const response = await makeRequest('patch', `/files/${fileId}`, data);
    
    if (response.isError && response.error) {
      try {
        handleProductApiError(response.error, 'Failed to update design file');
      } catch (error) {
        showToast.error('Failed to update design file');
      }
      return {
        success: false,
        file: {} as DesignFile,
        error: response.error.response?.data?.error || response.error.message || 'Failed to update design file'
      };
    }
    
    return response.data;
  }

  async deleteDesignFile(fileId: number): Promise<DeleteDesignFileResponse> {
    const response = await makeRequest('delete', `/files/${fileId}`);
    
    if (response.isError && response.error) {
      try {
        handleProductApiError(response.error, 'Failed to delete design file');
      } catch (error) {
        showToast.error('Failed to delete design file');
      }
      return {
        success: false,
        error: response.error.response?.data?.error || response.error.message || 'Failed to delete design file'
      };
    }
    
    return response.data;
  }
}

export const designFilesService = new DesignFilesService();
