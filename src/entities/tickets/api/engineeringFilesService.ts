import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const engineeringFilesApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/engineering-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

engineeringFilesApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

engineeringFilesApi.interceptors.response.use(
  (response) => response,
  createAuthErrorInterceptor()
);

export interface EngineeringFile {
  id: number;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  createdAt: string;
  updatedAt: string;
  productId: number;
  vehicleId?: number;
}

export interface GetEngineeringFilesResponse {
  success: boolean;
  files: EngineeringFile[];
  error?: string;
}

export interface GetEngineeringWorkspaceResponse {
  success: boolean;
  workspace: {
    id: number;
    productId: number;
    fileStructure: EngineeringFile[];
    teamMembers: any[];
    settings: any;
  };
  error?: string;
}

export interface CreateFileRequest {
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  content?: string;
  vehicleId: number;
}

export interface CreateFileResponse {
  success: boolean;
  file: EngineeringFile;
  error?: string;
}

export interface UpdateFileRequest {
  content?: string;
  name?: string;
  vehicleId: number;
}

export interface UpdateFileResponse {
  success: boolean;
  file: EngineeringFile;
  error?: string;
}

export interface DeleteFileRequest {
  vehicleId: number;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface GenerateAIRequest {
  prompt: string;
  type: 'testcase' | 'code' | 'deps' | 'version';
  context?: string;
  language?: string;
  framework?: string;
}

export interface GenerateAIResponse {
  success: boolean;
  result: string;
  type: string;
  error?: string;
  details?: string;
}

export interface AILog {
  id: number;
  prompt: string;
  type: string;
  result: string;
  context: string;
  createdAt: string;
  productId: number;
  generatedBy: number;
  generator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GetAILogsResponse {
  success: boolean;
  logs: AILog[];
  error?: string;
}

class EngineeringFilesService {
  async getEngineeringFiles(productId: number, vehicleId?: number): Promise<GetEngineeringFilesResponse> {
    // vehicleId is required by backend
    if (!vehicleId) {
      console.warn('getEngineeringFiles called without vehicleId, returning early');
      return {
        success: false,
        files: [],
        error: 'vehicleId is required'
      };
    }

    try {
      // Use files endpoint with vehicleId
      const response = await engineeringFilesApi.get<GetEngineeringFilesResponse>(`/${productId}/files`, {
        params: { vehicleId }
      });
      return response.data;
    } catch (error: any) {
      console.error('Files endpoint failed:', error);
      
      // Return empty files if endpoint fails
      return {
        success: false,
        files: [],
        error: error?.response?.data?.error || 'Failed to fetch files'
      };
    }
  }

  async createFile(productId: number, data: CreateFileRequest): Promise<CreateFileResponse> {
    try {
      const response = await engineeringFilesApi.post<CreateFileResponse>(`/${productId}/files`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        file: {} as EngineeringFile,
        error: error?.response?.data?.error || error.message || 'Failed to create file'
      };
    }
  }

  async updateFile(fileId: number, data: UpdateFileRequest): Promise<UpdateFileResponse> {
    try {
      const response = await engineeringFilesApi.put<UpdateFileResponse>(`/files/${fileId}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        file: {} as EngineeringFile,
        error: error?.response?.data?.error || error.message || 'Failed to update file'
      };
    }
  }

  async deleteFile(fileId: number, vehicleId: number): Promise<DeleteFileResponse> {
    try {
      const response = await engineeringFilesApi.delete<DeleteFileResponse>(`/files/${fileId}`, {
        data: { vehicleId }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: '',
        error: error?.response?.data?.error || error.message || 'Failed to delete file'
      };
    }
  }

  async getFileContent(fileId: number, vehicleId: number): Promise<{ success: boolean; file?: EngineeringFile; error?: string }> {
    if (!vehicleId) {
      return {
        success: false,
        error: 'vehicleId is required'
      };
    }

    try {
      const response = await engineeringFilesApi.get<{ success: boolean; file: EngineeringFile }>(`/files/${fileId}`, {
        params: { vehicleId }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error.message || 'Failed to fetch file content'
      };
    }
  }

  async generateAI(productId: number, data: GenerateAIRequest): Promise<GenerateAIResponse> {
    try {
      const response = await engineeringFilesApi.post<GenerateAIResponse>(`/${productId}/ai/generate`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        result: '',
        type: data.type,
        error: error?.response?.data?.error || error?.response?.data?.details || error.message || 'Failed to generate AI content',
        details: error?.response?.data?.details
      };
    }
  }

  async getAILogs(productId: number, type?: 'testcase' | 'code' | 'deps' | 'version'): Promise<GetAILogsResponse> {
    try {
      const params = type ? { type } : {};
      const response = await engineeringFilesApi.get<GetAILogsResponse>(`/${productId}/ai/logs`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        logs: [],
        error: error?.response?.data?.error || error.message || 'Failed to fetch AI logs'
      };
    }
  }
}

export const engineeringFilesService = new EngineeringFilesService();
