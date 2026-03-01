import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';
import { fastApiService } from './fastApiService';

const vehicleApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/vehicles`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

vehicleApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

vehicleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);


export interface VehicleFormData {
  product: {
    id: number;
    name: string;
    description: string;
  };
  vehicleTypes: string[];
  fileTypes: string[];
  maxFileSize: number;
}

export interface BasicInfoRequest {
  productId: number;
  vehicleName: string;
  vehicleType: string;
  shortDescription?: string;
  aiElaboratedDescription?: string;
}

export interface BasicInfoResponse {
  success: boolean;
  message: string;
  vehicle: {
    id: number;
    name: string;
    type: string;
    description: string;
  };
}

export interface ProductRelationshipRequest {
  productRelationship: string;
  voiceInput?: string;
  supportingFiles?: any[];
}

export interface VehicleOutlineRequest {
  featureTags: string;
  startDate: string;
  priority: string;
  involvedTeam: string;
  successMetrics: string;
}

export interface TeamMemberRequest {
  userId: number;
  role: string;
}

export interface TeamMemberResponse {
  success: boolean;
  message: string;
  membership: {
    id: number;
    vehicleId: number;
    userId: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface SuggestedMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  avatar?: string;
  phoneNumber?: string;
  vehicleCount?: number;
  completionRate: number;
  totalTickets: number;
  completedTickets: number;
  completedTasks: number; // Number of completed tasks/tickets
  totalTasks: number; // Total number of tasks/tickets
}

export interface SuggestedMembersResponse {
  success: boolean;
  data: {
    engineers: SuggestedMember[];
    designers: SuggestedMember[];
    pms: SuggestedMember[];
  };
}

export interface TeamMembersResponse {
  success: boolean;
  data: {
    suggested: Array<{
      id: number;
      name: string;
      email: string;
    }>;
    all: Array<{
      id: number;
      name: string;
      email: string;
    }>;
    added: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
    }>;
    facilitators: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
    }>;
  };
}

export interface VehicleReviewResponse {
  success: boolean;
  review: {
    vehicleName: string;
    vehicleType: string;
    description: string;
    shortDescription: string;
    productRelationship: string;
    voiceInput: string;
    supportingFiles: any[];
    featureTags: string;
    featureList: string[];
    startDate: string;
    priority: string;
    involvedTeam: string;
    successMetrics: string;
    metrics: string;
    teamMembers: string[];
    teamMembersDetailed: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      userRole: string;
    }>;
    status: string;
    progress: number;
    product: {
      id: number;
      name: string;
      owner: {
        id: number;
        name: string;
        email: string;
      };
    };
    id: number;
    productId: number;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    vehicleId: number;
    composite: number;
    doneFor: number;
  };
}

export interface AIElaborateRequest {
  description: string;
  productId?: number;
  vehicleName?: string;
  vehicleType?: string;
}

export interface AIElaborateResponse {
  success: boolean;
  elaboratedDescription: string;
}

export interface VehicleFile {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface VehicleFilesResponse {
  success: boolean;
  files: VehicleFile[];
}

export interface CreateCompleteVehicleRequest {
  productId: number;
  vehicleName: string;
  shortDescription?: string;
  relationship?: string;
  features?: string[];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  priority?: 'low' | 'medium' | 'high';
  quality?: number;
  speed?: number;
  efficiency?: number;
  teamMembers?: Array<{
    userId: number;
    role: string;
  }>;
  files?: File[];
  selectedVehicleId?: number;
}

export interface Vehicle {
  id: number;
  name: string;
  type: string;
  description: string;
  status: string;
  productId: number;
  product: {
    id: number;
    name: string;
  };
  teamMembers: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    userRole?: string;
    invitedAt?: string;
  }>;
  facilitators: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    userRole?: string;
    invitedAt?: string;
  }>;
  files: VehicleFile[];
  createdAt: string;
  updatedAt: string;
  doneFor?: number; // Task completion percentage (0-100) for horizontal positioning
  progress?: number; // Vehicle progress percentage
  vehicleType?: string; // Vehicle type
  members?: Array<{
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }>;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCompleteVehicleResponse {
  success: boolean;
  message: string;
  vehicle: Vehicle;
  backendVehicle: Vehicle;
}

export interface GetAllVehiclesResponse {
  success: boolean;
  vehicles: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  meta: {
    showing: string;
  };
}

export interface GetVehicleResponse {
  success: boolean;
  vehicle: Vehicle;
}

export interface DeleteVehicleResponse {
  success: boolean;
  message: string;
}

class VehicleService {
  
  async getVehicleFormData(productId: number): Promise<{ success: boolean; formData: VehicleFormData }> {
    // Add cache-busting parameter to prevent 304 responses
    const timestamp = Date.now();
    const response = await vehicleApi.get<{ success: boolean; formData: VehicleFormData }>(`/form-data/${productId}?_t=${timestamp}`);
    return response.data;
  }

 
  async saveBasicInfo(data: BasicInfoRequest): Promise<BasicInfoResponse> {
    const response = await vehicleApi.post<BasicInfoResponse>('/basic-info', data);
    return response.data;
  }

 
  async saveProductRelationship(vehicleId: number, data: ProductRelationshipRequest): Promise<{ success: boolean; message: string; vehicle: Vehicle }> {
    const response = await vehicleApi.post<{ success: boolean; message: string; vehicle: Vehicle }>(`/${vehicleId}/product-relationship`, data);
    return response.data;
  }

 
  async saveVehicleOutline(vehicleId: number, data: VehicleOutlineRequest): Promise<{ success: boolean; message: string; vehicle: Vehicle }> {
    const response = await vehicleApi.post<{ success: boolean; message: string; vehicle: Vehicle }>(`/${vehicleId}/outline`, data);
    return response.data;
  }


  async getTeamMembersForInvitation(vehicleId: number, search?: string, productId?: number): Promise<TeamMembersResponse> {
    const params: any = {};
    if (search) params.search = search;
    if (productId) params.productId = productId;
    
    const response = await vehicleApi.get<TeamMembersResponse>(`/${vehicleId}/team-members`, { params });
    return response.data;
  }

  async getSuggestedMembersByCompletionRate(productId: number): Promise<SuggestedMembersResponse> {
    const response = await vehicleApi.get<SuggestedMembersResponse>(`/suggested-members/${productId}`);
    return response.data;
  }

  
  async addTeamMember(vehicleId: number, data: TeamMemberRequest): Promise<TeamMemberResponse> {
    const response = await vehicleApi.post<TeamMemberResponse>(`/${vehicleId}/team-members`, data);
    return response.data;
  }

  async addTeamMembersBatch(vehicleId: number, members: Array<{ userId: number; role: string }>): Promise<{ success: boolean; message: string; memberships: any[] }> {
    const response = await vehicleApi.post(`/${vehicleId}/team-members/batch`, { members });
    return response.data;
  }


  async removeTeamMember(vehicleId: number, memberId: number): Promise<{ success: boolean; message: string }> {
    const response = await vehicleApi.delete<{ success: boolean; message: string }>(`/${vehicleId}/team-members/${memberId}`);
    return response.data;
  }

  
  async getVehicleReview(vehicleId: number): Promise<VehicleReviewResponse> {
    const response = await vehicleApi.get<VehicleReviewResponse>(`/${vehicleId}/review`);
    return response.data;
  }

 
  async finalizeVehicle(vehicleId: number): Promise<{ success: boolean; message: string; vehicle: Vehicle }> {
   
    const response = await vehicleApi.post<{ success: boolean; message: string; vehicle: Vehicle }>(`/${vehicleId}/finalize`, {}, {
      timeout: 90000 // 90 seconds timeout for FastAPI call
    });
    return response.data;
  }

  async getImpactAnalysis(vehicleId: number): Promise<{ success: boolean; data: any }> {
 
    const response = await vehicleApi.post<{ success: boolean; data: any }>(`/${vehicleId}/impact-analysis`, {}, {
      timeout: 200000 // 200 seconds timeout for FastAPI call
    });
    return response.data;
  }


  async aiElaborateDescription(data: AIElaborateRequest): Promise<AIElaborateResponse> {
    const response = await vehicleApi.post<AIElaborateResponse>('/ai-elaborate', data);
    return response.data;
  }

 
  async uploadVehicleFiles(vehicleId: number, files: File[]): Promise<{ success: boolean; message: string; files: VehicleFile[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await vehicleApi.post<{ success: boolean; message: string; files: VehicleFile[] }>(`/${vehicleId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  
  async getVehicleFiles(vehicleId: number): Promise<VehicleFilesResponse> {
    const response = await vehicleApi.get<VehicleFilesResponse>(`/${vehicleId}/files`);
    return response.data;
  }


  async createCompleteVehicle(data: CreateCompleteVehicleRequest): Promise<CreateCompleteVehicleResponse> {
    const response = await vehicleApi.post<CreateCompleteVehicleResponse>('/', data);
    return response.data;
  }

  
  async getVehiclesByProduct(productId: number, page: number = 1, pageSize: number = 5): Promise<{
    success: boolean;
    vehicles: Vehicle[];
    count: number;
  }> {
    try {
      const fastApiResponse = await fastApiService.getVehiclesByProduct(productId, page, pageSize);
      
      let vehicles: any[] = [];
      let totalCount = 0;
      
      if (fastApiResponse && Array.isArray(fastApiResponse)) {
        vehicles = fastApiResponse;
        totalCount = fastApiResponse.length;
      } else if (fastApiResponse?.items && Array.isArray(fastApiResponse.items)) {
        vehicles = fastApiResponse.items;
        totalCount = fastApiResponse.total || fastApiResponse.items.length;
      } else if (fastApiResponse?.vehicles && Array.isArray(fastApiResponse.vehicles)) {
        vehicles = fastApiResponse.vehicles;
        totalCount = fastApiResponse.total || fastApiResponse.vehicles.length;
      }
      
      const transformedVehicles = vehicles.map((vehicle: any) => ({
        ...vehicle,
        product: vehicle.product || { id: productId }
      }));
      
      return {
        success: true,
        vehicles: transformedVehicles,
        count: totalCount
      };
    } catch (error: any) {
      console.error('FastAPI getVehiclesByProduct error, using fallback:', error);
      
      // const timestamp = Date.now();
      // const response = await vehicleApi.get(`/product/${productId}?_t=${timestamp}`);
      // return response.data;
      
      throw error;
    }
  }

  async getAllVehicles(params?: {
    page?: number;
    limit?: number;
    productId?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetAllVehiclesResponse> {
  
    const timestamp = Date.now();
    const paramsWithCacheBust = { ...params, _t: timestamp };
    const response = await vehicleApi.get<GetAllVehiclesResponse>('/', { params: paramsWithCacheBust });
    return response.data;
  }

  
  async getVehicle(id: number): Promise<GetVehicleResponse> {
  
    const timestamp = Date.now();
    const response = await vehicleApi.get<GetVehicleResponse>(`/${id}?_t=${timestamp}`);
    return response.data;
  }


  async deleteVehicle(id: number): Promise<DeleteVehicleResponse> {
    const response = await vehicleApi.delete<DeleteVehicleResponse>(`/${id}`);
    return response.data;
  }

  async getUserTaskCompletion(userId: number | string, productId?: number, vehicleId?: number): Promise<{
    success: boolean;
    data: Array<{
      name: string;
      value: number;
      date: string;
    }>;
  }> {
    const params: any = {};
    if (productId) {
      params.productId = productId;
    }
    if (vehicleId) {
      params.vehicleId = vehicleId;
    }
    const response = await vehicleApi.get(`/user/${userId}/task-completion`, { params });
    return response.data;
  }

  async approveVehicle(vehicleId: number): Promise<{
    success: boolean;
    message: string;
    membership: any;
  }> {
    const response = await vehicleApi.post(`/${vehicleId}/approve`);
    return response.data;
  }

  async launchVehicle(vehicleId: number): Promise<{
    success: boolean;
    message: string;
    vehicle: any;
    error?: string;
  }> {
    const response = await vehicleApi.post(`/${vehicleId}/launch`);
    return response.data;
  }
}

export const vehicleService = new VehicleService();
