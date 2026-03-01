import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const invitationApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/invitations`,
  timeout: 15000,
});

invitationApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

invitationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface ProductInvitation {
  productId: number;
  email: string;
  name?: string;
  role: string;
}

export interface BulkProductInvitation {
  productId: number;
  invitations: Array<{
    email: string;
    name?: string;
    role: string;
  }>;
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  data: {
    productId: number;
    productName: string;
    inviteeEmail: string;
    inviteeName?: string;
    role: string;
    messageId: string;
  };
}

export interface BulkInvitationResponse {
  success: boolean;
  message: string;
  data: {
    productId: number;
    productName: string;
    successful: Array<{
      success: boolean;
      email: string;
      name?: string;
      role: string;
      messageId: string;
    }>;
    failed: Array<{
      success: boolean;
      email: string;
      name?: string;
      role: string;
      error: string;
    }>;
  };
}

export interface EmailCheckResponse {
  success: boolean;
  exists: boolean;
  message: string;
}

export interface FacilitatorInvitation {
  vehicleId: number;
  productId: number;
  email: string;
  name?: string;
}

export interface FacilitatorInvitationResponse {
  success: boolean;
  message: string;
  data: {
    vehicleId: number;
    productId: number;
    vehicleName: string;
    productName: string;
    inviteeEmail: string;
    inviteeName?: string;
    messageId: string;
  };
}

export interface AcceptFacilitatorInvitationRequest {
  vehicleId: number;
  productId: number;
  email: string;
}

export interface AcceptFacilitatorInvitationResponse {
  success: boolean;
  message: string;
  data: {
    facilitator: any;
    addedToProduct: boolean;
  };
}

class InvitationService {
  async sendProductInvitation(invitation: ProductInvitation): Promise<InvitationResponse> {
    try {
      const response = await invitationApi.post<InvitationResponse>('/product', invitation);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send invitation');
    }
  }

  async sendProductInvitationViaAuth0(invitation: ProductInvitation): Promise<InvitationResponse> {
    try {
      const response = await invitationApi.post<InvitationResponse>('/product/auth0', invitation);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send invitation via Auth0');
    }
  }

  async sendBulkProductInvitations(invitation: BulkProductInvitation): Promise<BulkInvitationResponse> {
    try {
      const response = await invitationApi.post<BulkInvitationResponse>('/product/bulk', invitation);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send bulk invitations');
    }
  }

  async checkEmailExists(email: string): Promise<EmailCheckResponse> {
    try {
      const response = await invitationApi.post<EmailCheckResponse>('/check-email', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to check email existence');
    }
  }

  async sendFacilitatorInvitation(invitation: FacilitatorInvitation): Promise<FacilitatorInvitationResponse> {
    try {
      const response = await invitationApi.post<FacilitatorInvitationResponse>('/facilitator', invitation);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send facilitator invitation');
    }
  }

  async acceptFacilitatorInvitation(request: AcceptFacilitatorInvitationRequest): Promise<AcceptFacilitatorInvitationResponse> {
    try {
      const response = await invitationApi.post<AcceptFacilitatorInvitationResponse>('/facilitator/accept', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to accept facilitator invitation');
    }
  }
}

export const invitationService = new InvitationService();
