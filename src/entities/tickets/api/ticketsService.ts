import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const ticketsApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/engineering-workspace`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});


ticketsApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ticketsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    if (error?.response?.status === 404) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export interface Ticket {
  id: number;
  file: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'qa_failed' | 'pending_feedback';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  createdBy: number;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  file: string;
  name: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'qa_failed' | 'pending_feedback';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  ticketType?: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: string;
  vehicleId?: number;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'qa_failed' | 'pending_feedback';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: string;
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  vehicleId?: number;
}

export interface TicketActionRequest {
  action: 'assign' | 'reassign' | 'take_action' | 'dismiss';
  assignedTo?: string;
  comment?: string;
  vehicleId?: number;
}

export interface TicketAnalytics {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    qa_failed: number;
    pending_feedback: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: {
    bug: number;
    feature: number;
    task: number;
    improvement: number;
  };
  byAssignee: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  averageResolutionTime: number;
  completionRate: number;
}

interface GetTicketsResponse {
  success: boolean;
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

interface CreateTicketResponse {
  success: boolean;
  ticket: Ticket;
  message?: string;
  error?: string;
}

interface UpdateTicketResponse {
  success: boolean;
  ticket: Ticket;
  message?: string;
  error?: string;
}

interface DeleteTicketResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface TicketActionResponse {
  success: boolean;
  ticket: Ticket;
  message?: string;
  error?: string;
}

interface TicketAnalyticsResponse {
  success: boolean;
  analytics: TicketAnalytics;
  error?: string;
}

class TicketsService {
  async getTickets(productId: number, params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    vehicleId?: number;
  }): Promise<GetTicketsResponse> {
    const response = await ticketsApi.get<GetTicketsResponse>(`/${productId}/tickets`, { params });
    return response.data;
  }

  async createTicket(productId: number, data: CreateTicketRequest): Promise<CreateTicketResponse> {

    try {
      const response = await ticketsApi.post<CreateTicketResponse>(`/${productId}/tickets`, data);
      
      return response.data;
    } catch (error: any) {
 
      throw error;
    }
  }

  async updateTicket(ticketId: string, data: UpdateTicketRequest): Promise<UpdateTicketResponse> {
    const response = await ticketsApi.put<UpdateTicketResponse>(`/tickets/${ticketId}`, data);
    return response.data;
  }

  async deleteTicket(ticketId: string): Promise<DeleteTicketResponse> {
    const response = await ticketsApi.delete<DeleteTicketResponse>(`/tickets/${ticketId}`);
    return response.data;
  }

  async performTicketAction(productId: number, ticketId: string, data: TicketActionRequest): Promise<TicketActionResponse> {
    const response = await ticketsApi.post<TicketActionResponse>(`/${productId}/tickets/${ticketId}/actions`, data);
    return response.data;
  }

  async getTicketAnalytics(productId: number, params?: {
    timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<TicketAnalyticsResponse> {
    const response = await ticketsApi.get<TicketAnalyticsResponse>(`/${productId}/tickets/analytics`, { params });
    return response.data;
  }
}

export const ticketsService = new TicketsService();
