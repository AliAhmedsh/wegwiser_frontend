import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const notesApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/notes`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

notesApi.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

notesApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

interface Note {
  id: string;
  title: string;
  text: string;
  x: number;
  y: number;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  vehicleId?: number;
  productId?: number;
  canvasArea: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'design' | 'development' | 'feedback' | 'bug' | 'feature';
  color: string;
  isPrivate: boolean;
  mentions?: Mention[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Mention {
  userId: string;
  username: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetNotesResponse {
  success: boolean;
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

interface CreateNoteRequest {
  title: string;
  text: string;
  x: number;
  y: number;
  vehicleId?: number;
  productId?: number;
  canvasArea?: string;
  mentions?: Mention[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'general' | 'design' | 'development' | 'feedback' | 'bug' | 'feature';
  color?: string;
  isPrivate?: boolean;
}

interface CreateNoteResponse {
  success: boolean;
  note: Note;
  message?: string;
  error?: string;
}

interface GetNoteByIdResponse {
  success: boolean;
  note: Note;
}

interface UpdateNoteRequest {
  title?: string;
  text?: string;
  x?: number;
  y?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'general' | 'design' | 'development' | 'feedback' | 'bug' | 'feature';
  color?: string;
  isPrivate?: boolean;
  mentions?: Mention[];
  vehicleId?: number;
}

interface UpdateNoteResponse {
  success: boolean;
  note: Note;
  message?: string;
  error?: string;
}

interface UpdateNotePositionRequest {
  x: number;
  y: number;
}

interface UpdateNotePositionResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface AddMentionsRequest {
  mentions: Array<{ userId?: string; username?: string; email: string }>;
}

interface AddMentionsResponse {
  success: boolean;
  message: string;
  note: Note;
}

interface GetNoteCommentsResponse {
  success: boolean;
  comments: Comment[];
}

interface AddNoteCommentRequest {
  content: string;
  parentId?: string;
}

interface AddNoteCommentResponse {
  success: boolean;
  message: string;
  comment: Comment;
}

interface EnhanceNoteTextRequest {
  text: string;
  action: 'polish' | 'fix_grammar' | 'expand' | 'summarize';
  noteId?: string;
  context?: string;
}

interface EnhanceNoteTextResponse {
  success: boolean;
  originalText: string;
  enhancedText: string;
  action: string;
  suggestions: string[];
}

interface SearchUsersForMentionResponse {
  success: boolean;
  users: Array<{ id: string; name: string; email: string; username?: string; avatar?: string; position?: string; role?: string; isOnline?: boolean }>;
}

interface SyncCanvasPositionsRequest {
  canvasArea?: string;
  scale?: number;
  offset?: { x: number; y: number };
  updates: Array<{ id: string; x: number; y: number; timestamp?: string }>;
}

interface SyncCanvasPositionsResponse {
  success: boolean;
  message: string;
  updated: number;
  failed: Array<{ id: string; error: string }>;
}

interface GetCanvasAreaNotesResponse {
  success: boolean;
  notes: Note[];
  area: string;
  viewport?: string;
  count: number;
}

interface GetNotesAnalyticsResponse {
  success: boolean;
  summary: {
    totalNotes: number;
    byCategory: { [key: string]: number };
    byPriority: { [key: string]: number };
    byOwner: { [key: string]: number };
    recentActivity: number;
    mostMentioned: Array<{ userId: string; username: string; count: number }>;
  };
}

interface ClearAllNotesResponse {
  success: boolean;
  message: string;
  deletedCount: number;
  error?: string;
}

interface DeleteNoteResponse {
  success: boolean;
  message: string;
  error?: string;
}

class NotesService {
  async getNotes(params?: any): Promise<GetNotesResponse> {
    try {

      
      const response = await notesApi.get<GetNotesResponse>('/', { 
        params,
        timeout: 15000 // Increase timeout to 15 seconds
      });
      
 
      return response.data;
    } catch (error: any) {
 
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch notes');
    }
  }

  async createNote(data: CreateNoteRequest): Promise<CreateNoteResponse> {
    const response = await notesApi.post<CreateNoteResponse>('/', data);
    return response.data;
  }

  async getNoteById(id: string): Promise<GetNoteByIdResponse> {
    const response = await notesApi.get<GetNoteByIdResponse>(`/${id}`);
    return response.data;
  }

  async updateNote(id: string, data: UpdateNoteRequest): Promise<UpdateNoteResponse> {
    const response = await notesApi.put<UpdateNoteResponse>(`/${id}`, data);
    return response.data;
  }

  async deleteNote(id: string, productId?: number, taskId?: number): Promise<DeleteNoteResponse> {
    // vehicleId removed - notes are only linked to products
    const params: any = {};
    if (productId) params.productId = productId;
    if (taskId) params.taskId = taskId;
    
    const response = await notesApi.delete<DeleteNoteResponse>(`/${id}`, { params });
    return response.data;
  }

  async updateNotePosition(id: string, data: UpdateNotePositionRequest): Promise<UpdateNotePositionResponse> {
    const response = await notesApi.patch<UpdateNotePositionResponse>(`/${id}/position`, data);
    return response.data;
  }

  async addMentions(id: string, data: AddMentionsRequest): Promise<AddMentionsResponse> {
    const response = await notesApi.post<AddMentionsResponse>(`/${id}/mention`, data);
    return response.data;
  }

  async getNoteComments(id: string): Promise<GetNoteCommentsResponse> {
    const response = await notesApi.get<GetNoteCommentsResponse>(`/${id}/comments`);
    return response.data;
  }

  async addNoteComment(id: string, data: AddNoteCommentRequest): Promise<AddNoteCommentResponse> {
    const response = await notesApi.post<AddNoteCommentResponse>(`/${id}/comments`, data);
    return response.data;
  }

  async enhanceNoteText(data: EnhanceNoteTextRequest): Promise<EnhanceNoteTextResponse> {
    const response = await notesApi.post<EnhanceNoteTextResponse>('/ai/enhance', data);
    return response.data;
  }

  async searchUsersForMention(params: { q?: string; productId?: number; limit?: number }): Promise<SearchUsersForMentionResponse> {
    const response = await notesApi.get<SearchUsersForMentionResponse>('/search/users', { params });
    return response.data;
  }

  async syncCanvasPositions(data: SyncCanvasPositionsRequest): Promise<SyncCanvasPositionsResponse> {
    const response = await notesApi.post<SyncCanvasPositionsResponse>('/canvas/sync', data);
    return response.data;
  }

  async getCanvasAreaNotes(area: string, params?: { viewport?: string; includePrivate?: boolean }): Promise<GetCanvasAreaNotesResponse> {
    const response = await notesApi.get<GetCanvasAreaNotesResponse>(`/canvas/area/${area}`, { params });
    return response.data;
  }

  async getNotesAnalytics(params?: { productId?: number; timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' }): Promise<GetNotesAnalyticsResponse> {
    const response = await notesApi.get<GetNotesAnalyticsResponse>('/analytics/summary', { params });
    return response.data;
  }

  async clearAllNotes(productId?: number): Promise<ClearAllNotesResponse> {
    // vehicleId removed - notes are only linked to products
    const token = getCookie('access_token');
   
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    try {
      const params: any = {};
      if (productId) params.productId = productId;
      
      const response = await notesApi.delete<ClearAllNotesResponse>('/clear-all', { params });

      return response.data;
    } catch (error: any) {
 
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw error;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = getCookie('access_token');
      if (!token) {
        return false;
      }
      
      // Try to make a simple authenticated request to test the token
      const response = await notesApi.get('/', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log(' testConnection: Testing backend connectivity...');
      
      // Simple ping request with short timeout
      const response = await notesApi.get('/', { 
        timeout: 5000,
        params: { test: 'ping' }
      });
      
      console.log(' testConnection: Backend is reachable');
      return true;
    } catch (error: any) {
      console.error('testConnection: Backend connectivity test failed:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('testConnection: Backend timeout - server may be overloaded');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('testConnection: Network error - check if backend is running');
      }
      
      return false;
    }
  }
}

export const notesService = new NotesService();
