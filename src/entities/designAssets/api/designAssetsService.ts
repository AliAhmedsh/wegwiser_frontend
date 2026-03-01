import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const designAssetsApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/design-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

designAssetsApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authErrorHandler = createAuthErrorInterceptor();

designAssetsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

 
export interface DesignAsset {
  id: number;
  name: string;
  type: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  workspaceId: number;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
  associatedVehicleCount: number;
  associatedVehicles: Array<{
    id: number;
    name: string;
  }>;
}

export interface GetDesignAssetsResponse {
  success: boolean;
  assets: DesignAsset[];
  error?: string;
}

export interface CreateDesignAssetRequest {
  name: string;
  file: File;
  vehicleId?: number;
}

export interface CreateDesignAssetResponse {
  success: boolean;
  asset: DesignAsset;
  error?: string;
}

export interface DeleteDesignAssetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AssociateAssetVehicleRequest {
  assetId: number;
  vehicleId: number;
}

export interface AssociateAssetVehicleResponse {
  success: boolean;
  association?: {
    id: number;
    assetId: number;
    vehicleId: number;
    createdAt: string;
    vehicle?: {
      id: number;
      name: string;
    };
  };
  message?: string;
  error?: string;
}

export interface DisassociateAssetVehicleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class DesignAssetsService {
  async getDesignAssets(workspaceId: number, filters?: { type?: string; search?: string; vehicleId?: number }): Promise<GetDesignAssetsResponse> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.vehicleId) params.append('vehicleId', String(filters.vehicleId));
    
    const queryString = params.toString();
    const url = `/${workspaceId}/assets${queryString ? `?${queryString}` : ''}`;
    
    const response = await designAssetsApi.get<GetDesignAssetsResponse>(url);
    return response.data;
  }

  async getDesignAssetsByProduct(productId: number, filters?: { type?: string; search?: string; vehicleId?: number }): Promise<GetDesignAssetsResponse> {
    // vehicleId is required by backend
    if (!filters?.vehicleId) {
      return {
        success: false,
        assets: [],
        error: 'vehicleId is required'
      };
    }
    
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    params.append('vehicleId', String(filters.vehicleId)); // Always include vehicleId
    
    const queryString = params.toString();
    const url = `/products/${productId}/assets?${queryString}`;
    
    const response = await designAssetsApi.get<GetDesignAssetsResponse>(url);
    return response.data;
  }

  async uploadDesignAsset(workspaceId: number, data: CreateDesignAssetRequest): Promise<CreateDesignAssetResponse> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);

    const response = await designAssetsApi.post<CreateDesignAssetResponse>(
      `/${workspaceId}/assets`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadDesignAssetByProduct(productId: number, data: CreateDesignAssetRequest): Promise<CreateDesignAssetResponse> {
    // vehicleId is required by backend
    if (!data.vehicleId) {
      return {
        success: false,
        asset: {} as any,
        error: 'vehicleId is required'
      };
    }
    
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('vehicleId', String(data.vehicleId)); // Always include vehicleId

    const response = await designAssetsApi.post<CreateDesignAssetResponse>(
      `/products/${productId}/assets`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteDesignAsset(assetId: number): Promise<DeleteDesignAssetResponse> {
    const response = await designAssetsApi.delete<DeleteDesignAssetResponse>(`/assets/${assetId}`);
    return response.data;
  }

  async associateAssetWithVehicle(data: AssociateAssetVehicleRequest): Promise<AssociateAssetVehicleResponse> {
    const response = await designAssetsApi.post<AssociateAssetVehicleResponse>('/assets/associate', data);
    return response.data;
  }

  async disassociateAssetFromVehicle(assetId: number, vehicleId: number): Promise<DisassociateAssetVehicleResponse> {
    const response = await designAssetsApi.delete<DisassociateAssetVehicleResponse>(
      `/assets/disassociate?assetId=${assetId}&vehicleId=${vehicleId}`
    );
    return response.data;
  }

}

export const designAssetsService = new DesignAssetsService();

