import { API_CONFIG } from '@/lib/config/api';
import axios from '@/lib/config/axiosConfig';
import { fastApiService, ExternalAPIRequest } from '@/lib/api/services/fastApiService';
import {
    AddMemberDto,
    AnalyticsResponse,
    CreatePRDDto,
    CreateProductDto,
    CreateTaskDto,
    MembersResponse,
    PRDResponse,
    ProductMember,
    ProductPRD,
    ProductResponse,
    ProductsResponse,
    ProductTask,
    TasksResponse,
    UpdateProductDto,
    UpdateTaskDto
} from '../model/types';

class ProductApiService {
  private static _instance: ProductApiService | null = null;
  private baseURL = `${API_CONFIG.BASE_URL}/products`;

  private constructor() {}

  static getInstance(): ProductApiService {
    if (!ProductApiService._instance) {
      ProductApiService._instance = new ProductApiService();
    }
    return ProductApiService._instance;
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> {
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }

  async getById(id: number): Promise<ProductResponse> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateProductDto | FormData): Promise<ProductResponse> {
    try {
      const response = await axios.post(this.baseURL, data, {
        headers: data instanceof FormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        error.suppressConsoleError = true;
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateProductDto): Promise<ProductResponse> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${this.baseURL}/${id}`);
    return response.data;
  }

  async getMembers(productId: number): Promise<MembersResponse> {
    const response = await axios.get(`${this.baseURL}/${productId}/members`);
    return response.data;
  }

  async addMember(productId: number, data: AddMemberDto): Promise<{
    success: boolean;
    message: string;
    member: ProductMember;
  }> {
    const response = await axios.post(`${this.baseURL}/${productId}/members`, data);
    return response.data;
  }

  async removeMember(productId: number, memberId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await axios.delete(`${this.baseURL}/${productId}/members/${memberId}`);
    return response.data;
  }

  async getAnalytics(productId: number): Promise<AnalyticsResponse> {
    const response = await axios.get(`${this.baseURL}/${productId}/analytics`);
    return response.data;
  }

  async getPRD(productId: number): Promise<PRDResponse> {
    const response = await axios.get(`${this.baseURL}/${productId}/prd`);
    return response.data;
  }

  async upsertPRD(productId: number, data: CreatePRDDto): Promise<{
    success: boolean;
    prd: ProductPRD;
  }> {
    const response = await axios.put(`${this.baseURL}/${productId}/prd`, data);
    return response.data;
  }

  async getTasks(productId: number, vehicleId?: number): Promise<TasksResponse> {
    // vehicleId is required by backend
    if (!vehicleId) {
      throw new Error('vehicleId is required');
    }
    const response = await axios.get(`${this.baseURL}/${productId}/tasks`, {
      params: { vehicleId }
    });
    return response.data;
  }

  async createTask(productId: number, data: CreateTaskDto): Promise<{
    success: boolean;
    task: ProductTask;
  }> {
    const response = await axios.post(`${this.baseURL}/${productId}/tasks`, data);
    return response.data;
  }

  async updateTask(productId: number, taskId: number, data: UpdateTaskDto): Promise<{
    success: boolean;
    task: ProductTask;
  }> {
    const response = await axios.patch(`${this.baseURL}/${productId}/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(productId: number, taskId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await axios.delete(`${this.baseURL}/${productId}/tasks/${taskId}`);
    return response.data;
  }

  async refineDoc(productId: number): Promise<{
    success: boolean;
    data: any;
  }> {
    try {
    const response = await axios.post(`${this.baseURL}/${productId}/refine-doc`);
    return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        error.suppressAuthError = true;
      }
      throw error;
    }
  }

  async askDescription(productId: number): Promise<{
    success: boolean;
    data: any;
  }> {
    const response = await axios.post(`${this.baseURL}/${productId}/ask-description`);
    return response.data;
  }

  async proposeVehicle(productId: number): Promise<{
    success: boolean;
    data: any;
  }> {
    try {
    const response = await axios.post(`${this.baseURL}/${productId}/propose-vehicle`, {}, {
      timeout: 400000 
    });
    return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        error.suppressAuthError = true;
      }
      throw error;
    }
  }

  async getProposedVehicles(productId: number): Promise<{
    success: boolean;
    data: any[];
  }> {
    if (typeof window === 'undefined') {
      return {
        success: true,
        data: []
      };
    }

    const stored = localStorage.getItem(`proposed_vehicles_${productId}`);

    if (stored) {
      try {
        const vehicles = JSON.parse(stored);

        if (Array.isArray(vehicles)) {
          return {
            success: true,
            data: vehicles.map((vehicle: any, index: number) => ({
              vehicle_name: vehicle.vehicle_name || vehicle.name || `Vehicle ${index + 1}`,
              description: vehicle.description || '',
              id: vehicle.id || `proposed-${index}`
            }))
          };
        }
      } catch (error) {
        console.error('[getProposedVehicles] Failed to parse stored vehicles:', error);
      }
    }

    return {
      success: true,
      data: []
    };
  }

  async launchProposedVehicle(productId: number, proposedVehicleId: number): Promise<{
    success: boolean;
    message: string;
    vehicle: any;
  }> {
    const response = await axios.post(`${this.baseURL}/${productId}/proposed-vehicles/launch`, {
      proposedVehicleId
    });
    return response.data;
  }

  async extractPRDFileText(productId: number): Promise<{
    success: boolean;
    text?: string;
    filename?: string;
    error?: string;
  }> {
    const url = `${this.baseURL}/${productId}/extract-prd-text`;

    
    try {
      const response = await axios.get(url, {
        timeout: 60000
      });
      
      console.log(`[extractPRDFileText] ✅ API Response received:`, {
        success: response.data?.success,
        hasText: !!response.data?.text,
        textLength: response.data?.text?.length || 0,
        filename: response.data?.filename,
        error: response.data?.error,
        status: response.status,
        statusText: response.statusText
      });
      
      return response.data;
    } catch (error: any) {
      console.error('='.repeat(80));
      console.error(`[extractPRDFileText]  API Error for productId ${productId}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: url,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          timeout: error.config?.timeout
        }
      });
      console.error('='.repeat(80));
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to extract PRD file text'
      };
    }
  }

  async callExternalAPI(apiName: string, config: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
    timeout?: number;
  }) {
    return fastApiService.callExternalAPI({
      api_name: apiName,
      ...config,
    });
  }
}

export const productApiService = ProductApiService.getInstance();
