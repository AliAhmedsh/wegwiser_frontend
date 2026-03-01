import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const swotFileApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/swot-files`,
  timeout: 60000,
  headers: API_CONFIG.HEADERS,
});

swotFileApi.interceptors.request.use((config) => {
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

swotFileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface SwotFile {
  id: number;
  title: string;
  content: string;
  productId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwotFileRequest {
  title: string;
  productId: number;
}

export interface CreateSwotFileResponse {
  success: boolean;
  message: string;
  file: SwotFile;
}

export interface GetSwotFilesResponse {
  success: boolean;
  files: SwotFile[];
}

export interface UpdateSwotFileRequest {
  title?: string;
  content?: any;
}

export interface UpdateSwotFileResponse {
  success: boolean;
  message: string;
  file: SwotFile;
}

export interface DeleteSwotFileResponse {
  success: boolean;
  message: string;
}

export const swotFileService = {
  createFile: async (data: CreateSwotFileRequest): Promise<CreateSwotFileResponse> => {
    const response = await swotFileApi.post('/', data);
    return response.data;
  },

  getFiles: async (productId: number): Promise<GetSwotFilesResponse> => {
    const response = await swotFileApi.get(`/product/${productId}`);
    return response.data;
  },

  getFileById: async (productId: number, fileId: number): Promise<{ success: boolean; file: SwotFile }> => {
    const response = await swotFileApi.get(`/product/${productId}/files/${fileId}`);
    return response.data;
  },

  updateFile: async (fileId: number, data: UpdateSwotFileRequest): Promise<UpdateSwotFileResponse> => {
    const response = await swotFileApi.put(`/${fileId}`, data);
    return response.data;
  },

  deleteFile: async (fileId: number): Promise<DeleteSwotFileResponse> => {
    const response = await swotFileApi.delete(`/${fileId}`);
    return response.data;
  }
};

export default swotFileService;
