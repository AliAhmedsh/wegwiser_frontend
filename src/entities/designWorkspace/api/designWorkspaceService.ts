import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const designWorkspaceApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/design-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

const engineeringWorkspaceApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/engineering-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add interceptors to both APIs
[designWorkspaceApi, engineeringWorkspaceApi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    createAuthErrorInterceptor()
  );
});

// Types
export interface DesignLayer {
  id: number;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  pageId: number;
  parentId?: number;
  children?: DesignLayer[];
}

export interface DesignPage {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  workspaceId: number;
  layers: DesignLayer[];
}

export interface CreateLayerRequest {
  name: string;
  visible?: boolean;
  locked?: boolean;
  parentId?: number;
  vehicleId?: number;
}

export interface UpdateLayerRequest {
  name?: string;
  visible?: boolean;
  locked?: boolean;
  parentId?: number;
  vehicleId?: number;
  pageId?: number;
}

export interface ReorderLayersRequest {
  layerIds: number[];
}

export interface SaveCanvasStateRequest {
  canvasData: any; // The canvas instances/layers data
  pageId?: number;
  layerId?: number;
}

export interface GetCanvasStateResponse {
  success: boolean;
  canvasData?: any;
  error?: string;
}

export interface CreatePageRequest {
  name: string;
  vehicleId?: number;
}

export interface UpdatePageRequest {
  name?: string;
  vehicleId?: number;
}

// Response Types
export interface GetPagesResponse {
  success: boolean;
  pages: DesignPage[];
  error?: string;
}

export interface GetPageResponse {
  success: boolean;
  page: DesignPage;
  error?: string;
}

export interface CreatePageResponse {
  success: boolean;
  page: DesignPage;
  error?: string;
}

export interface UpdatePageResponse {
  success: boolean;
  page: DesignPage;
  error?: string;
}

export interface CreateLayerResponse {
  success: boolean;
  layer: DesignLayer;
  error?: string;
}

export interface UpdateLayerResponse {
  success: boolean;
  layer: DesignLayer;
  error?: string;
}

export interface DeleteLayerResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ReorderLayersResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class DesignWorkspaceService {
  // Helper to get workspace ID from product (cached in memory)
  private workspaceIdCache: Map<number, number> = new Map();

  async getWorkspaceId(productId: number): Promise<number | null> {
    if (this.workspaceIdCache.has(productId)) {
      return this.workspaceIdCache.get(productId)!;
    }

    try {
      const response = await engineeringWorkspaceApi.get<{ success: boolean; designs: any[] }>(`/${productId}/designs`);
      
      if (response.data.success && response.data.designs.length > 0) {
        const workspaceId = response.data.designs[0].id;
        this.workspaceIdCache.set(productId, workspaceId);
        return workspaceId;
      } else {
        const createResponse = await this.createWorkspace(productId);
        if (createResponse.success && createResponse.workspace) {
          const workspaceId = createResponse.workspace.id;
          this.workspaceIdCache.set(productId, workspaceId);
          return workspaceId;
        }
      }
    } catch (error) {
      console.error('Error fetching workspace ID:', error);
    }
    return null;
  }

  async createWorkspace(productId: number): Promise<{ success: boolean; workspace?: any; error?: string }> {
    try {
      const response = await designWorkspaceApi.post('/', {
        name: `Design Workspace`,
        productId: productId
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create workspace'
      };
    }
  }

  // Page operations
  async getPages(productId: number, vehicleId?: number, pageId?: number): Promise<GetPagesResponse & { workspaceId?: number }> {
    // vehicleId is required by backend - return early without making API call
    if (!vehicleId) {
      console.warn('getPages called without vehicleId, returning early');
      return {
        success: false,
        pages: [],
        error: 'vehicleId is required'
      };
    }
    try {
      // Use design workspace endpoint instead of engineering workspace
      const params: { vehicleId: number; pageId?: number } = { vehicleId };
      if (pageId) {
        params.pageId = pageId;
      }
      const response = await designWorkspaceApi.get<{ success: boolean; designs: any[]; pages: any[]; workspaceId?: number }>(`/products/${productId}/pages`, {
        params
      });
      if (response.data.success) {
        // Design workspace endpoint directly returns pages and workspaceId
        if (response.data.pages && response.data.pages.length > 0) {
          if (response.data.workspaceId) {
            this.workspaceIdCache.set(productId, response.data.workspaceId);
          }
          return {
            success: true,
            pages: response.data.pages,
            workspaceId: response.data.workspaceId
          };
        }
        
        return {
          success: true,
          pages: [],
          workspaceId: response.data.workspaceId
        };
      }
      return {
        success: false,
        pages: [],
        error: 'Failed to fetch pages'
      };
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      return {
        success: false,
        pages: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch pages'
      };
    }
  }

  async getPage(productId: number, pageId: number, vehicleId?: number): Promise<GetPageResponse> {
    // vehicleId is required by backend - return early without making API call
    if (!vehicleId) {
      console.warn('getPage called without vehicleId, returning early');
      return {
        success: false,
        page: {} as DesignPage,
        error: 'vehicleId is required'
      };
    }
    try {
      // Use design workspace endpoint instead of engineering workspace
      const response = await designWorkspaceApi.get<{ success: boolean; designs: any[]; pages: any[] }>(`/products/${productId}/pages`, {
        params: { vehicleId }
      });
      if (response.data.success) {
        // First try to find in pages array (direct response)
        if (response.data.pages) {
          const page = response.data.pages.find((p: any) => p.id === pageId);
          if (page) {
            return {
              success: true,
              page
            };
          }
        }
        // Fallback: search in designs array
        if (response.data.designs) {
          for (const workspace of response.data.designs) {
            if (workspace.pages) {
              const page = workspace.pages.find((p: any) => p.id === pageId);
              if (page) {
                return {
                  success: true,
                  page
                };
              }
            }
          }
        }
      }
      return {
        success: false,
        page: {} as DesignPage,
        error: 'Page not found'
      };
    } catch (error: any) {
      return {
        success: false,
        page: {} as DesignPage,
        error: error.response?.data?.error || error.message || 'Failed to fetch page'
      };
    }
  }

  async createPage(productId: number, data: CreatePageRequest): Promise<CreatePageResponse> {
    try {
      const response = await designWorkspaceApi.post<CreatePageResponse>(`/products/${productId}/pages`, data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return {
        success: false,
        page: {} as DesignPage,
        error: error.response?.data?.error || error.message || 'Failed to create page'
      };
    }
  }

  async updatePage(pageId: number, data: UpdatePageRequest): Promise<UpdatePageResponse> {
    try {
      const response = await designWorkspaceApi.put<UpdatePageResponse>(`/pages/${pageId}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        page: {} as DesignPage,
        error: error.response?.data?.error || error.message || 'Failed to update page'
      };
    }
  }

  // Layer operations
  async createLayer(pageId: number, data: CreateLayerRequest): Promise<CreateLayerResponse> {
    try {
      console.log(`createLayer called - Sending POST to /api/design-workspace/pages/${pageId}/layers`);
      const response = await designWorkspaceApi.post<CreateLayerResponse>(`/pages/${pageId}/layers`, data);
      console.log('POST request successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return {
        success: false,
        layer: {} as DesignLayer,
        error: error.response?.data?.error || error.message || 'Failed to create layer'
      };
    }
  }

  async updateLayer(layerId: number, data: UpdateLayerRequest): Promise<UpdateLayerResponse> {
    try {
      const response = await designWorkspaceApi.put<UpdateLayerResponse>(`/layers/${layerId}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        layer: {} as DesignLayer,
        error: error.response?.data?.error || error.message || 'Failed to update layer'
      };
    }
  }

  async deleteLayer(layerId: number): Promise<DeleteLayerResponse> {
    try {
      const response = await designWorkspaceApi.delete<DeleteLayerResponse>(`/layers/${layerId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete layer'
      };
    }
  }

  async reorderLayers(pageId: number, data: ReorderLayersRequest): Promise<ReorderLayersResponse> {
    try {
      const response = await designWorkspaceApi.post<ReorderLayersResponse>(`/pages/${pageId}/layers/reorder`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to reorder layers'
      };
    }
  }

  async createDesignElement(layerId: number, elementData: any): Promise<{ success: boolean; element?: any; error?: string }> {
    try {
      const response = await designWorkspaceApi.post(`/layers/${layerId}/elements`, elementData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create design element'
      };
    }
  }

  async updateDesignElement(elementId: number, elementData: any): Promise<{ success: boolean; element?: any; error?: string }> {
    try {
      const response = await designWorkspaceApi.put(`/elements/${elementId}`, elementData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update design element'
      };
    }
  }

  async deleteDesignElement(elementId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await designWorkspaceApi.delete(`/elements/${elementId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete design element'
      };
    }
  }

  async getLayerElements(layerId: number, vehicleId?: number): Promise<{ success: boolean; elements?: any[]; error?: string }> {
    try {
      // vehicleId is required by backend
      if (!vehicleId) {
        return {
          success: false,
          elements: [],
          error: 'vehicleId is required'
        };
      }
      const response = await designWorkspaceApi.get(`/layers/${layerId}/elements`, {
        params: { vehicleId }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        elements: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch layer elements'
      };
    }
  }

  async getPageAllLayersElements(pageId: number): Promise<{ success: boolean; elements?: any[]; error?: string }> {
    try {
      const response = await designWorkspaceApi.get(`/pages/${pageId}/all-elements`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch page elements:', error);
      return {
        success: false,
        elements: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch page elements'
      };
    }
  }
}

export const designWorkspaceService = new DesignWorkspaceService();
