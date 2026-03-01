import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const workspaceApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

workspaceApi.interceptors.request.use((config) => {
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

workspaceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface WorkspaceDocument {
  id: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  productId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  comments?: WorkspaceComment[];
}

export interface WorkspaceComment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  type?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  type?: string;
}

export interface AutoSaveRequest {
  content?: string;
  title?: string;
}

export interface AutoSaveResponse {
  success: boolean;
  message: string;
  document: {
    id: number;
    title: string;
    updatedAt: string;
  };
}

export interface GetDocumentsResponse {
  success: boolean;
  documents: WorkspaceDocument[];
}

export interface GetDocumentResponse {
  success: boolean;
  document: WorkspaceDocument;
}

export interface CreateDocumentResponse {
  success: boolean;
  document: WorkspaceDocument;
}

export interface UpdateDocumentResponse {
  success: boolean;
  document: WorkspaceDocument;
}

export interface DeleteDocumentResponse {
  success: boolean;
}

class WorkspaceDocumentService {
  async getDocuments(productId: number): Promise<GetDocumentsResponse> {
    const response = await workspaceApi.get(`/${productId}/documents`);
    return response.data;
  }

  async getDocument(documentId: number): Promise<GetDocumentResponse> {
    try {
      const response = await workspaceApi.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createDocument(
    productId: number,
    data: CreateDocumentRequest
  ): Promise<CreateDocumentResponse> {
    try {
      const response = await workspaceApi.post(`/${productId}/documents`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateDocument(
    documentId: number,
    data: UpdateDocumentRequest
  ): Promise<UpdateDocumentResponse> {
    const response = await workspaceApi.put(`/documents/${documentId}`, data);
    return response.data;
  }

  async autoSaveDocument(
    productId: number,
    documentId: number,
    data: AutoSaveRequest
  ): Promise<AutoSaveResponse> {
    try {
      const response = await workspaceApi.patch(`/${productId}/documents/${documentId}/autosave`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(documentId: number): Promise<DeleteDocumentResponse> {
    const response = await workspaceApi.delete(`/documents/${documentId}`);
    return response.data;
  }

  async getDocumentComments(productId: number, documentId: number): Promise<{
    success: boolean;
    comments: any[];
  }> {
    try {
      const response = await workspaceApi.get(`/${productId}/documents/${documentId}/comments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addDocumentComment(
    productId: number,
    documentId: number,
    content: string
  ): Promise<{
    success: boolean;
    message: string;
    comment: any;
  }> {
    try {
      const response = await workspaceApi.post(`/${productId}/documents/${documentId}/comments`, {
        content
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await workspaceApi.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

}

export const workspaceDocumentService = new WorkspaceDocumentService();
