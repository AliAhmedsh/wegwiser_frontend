import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const aiApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/ai`,
  timeout: 200000, // 200 seconds default (will be overridden per request for PRD generation)
  headers: API_CONFIG.HEADERS,
});

aiApi.interceptors.request.use((config) => {
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    return Promise.reject(error);
  }
);

export interface AskAIRequest {
  message: string;
  productId?: number;
  conversationId?: number;
}

export interface AskAIResponse {
  success: boolean;
  response: string;
  role: 'engineer' | 'product_manager' | 'designer' | 'general';
  endpoint: string;
  conversationId?: number;
  metadata: {
    userRole: string;
    timestamp: string;
  };
}

export interface ChatHistoryItem {
  id: number;
  message: string;
  response: string;
  roleType: string;
  endpoint: string;
  createdAt: string;
  metadata: any;
}

export interface ChatHistoryResponse {
  success: boolean;
  chatHistory: ChatHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AIAnalytics {
  success: boolean;
  analytics: {
    totalInteractions: number;
    roleBreakdown: Record<string, number>;
    recentActivity: number;
    mostUsedRole: string;
  };
}


export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  metadata: any;
  createdAt: string;
}

export interface ConversationMessagesResponse {
  success: boolean;
  conversation: {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: ChatMessage[];
}

export interface CreateConversationRequest {
  title?: string;
  productId?: number;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: {
    id: number;
    title: string;
    createdAt: string;
  };
}

export interface AddMessageRequest {
  conversationId: number;
  role: 'user' | 'ai';
  content: string;
  metadata?: any;
}

export interface AddMessageResponse {
  success: boolean;
  message: {
    id: number;
    role: 'user' | 'ai';
    content: string;
    createdAt: string;
  };
}

export interface LearningRequest {
  product_id: number;
  prompt: string;
  context?: string;
  tab?: 'Iconography' | 'Symbolism/Signs' | 'Semiotics' | 'general';
  k?: number;
}

export interface LearningResponse {
  success: boolean;
  response: string;
  bullets?: { bullet: string; source_id: string; metadata: Record<string, unknown> }[];
  prd_ref?: { prd_id: string; snippet: string } | null;
  explanation_mode?: string;
  metadata: {
    user_id?: string;
    timestamp?: string;
    tab: string;
  };
}

export interface SwotRequest {
  prompt: string;
  context?: string;
  tab?: 'swot';
}

export interface SwotResponse {
  success: boolean;
  response: any;
  metadata: {
    user_id: string;
    timestamp: string;
    tab: string;
  };
}

export const aiService = {
  // COMMENTED OUT: Old Node.js endpoints - replaced with FastAPI RAG endpoints
  // Ask AI chatbot with role-based routing
  // askAI: async (data: AskAIRequest | FormData): Promise<AskAIResponse> => {
  //   console.log('Data type:', data instanceof FormData ? 'FormData' : 'JSON');
  //   
  //   let response;
  //   if (data instanceof FormData) {
  //     console.log('📎 Sending FormData with files');
  //     
  //     // Check if this is a PRD generation request (has files and PRD-related message)
  //     const message = data.get('message')?.toString() || '';
  //     const hasFiles = data.has('file_0') || Array.from(data.keys()).some(key => key.startsWith('file_'));
  //     const isPRDGeneration = hasFiles && (
  //       message.toLowerCase().includes('prd') ||
  //       message.toLowerCase().includes('product requirements') ||
  //       (message.toLowerCase().includes('generate') && message.toLowerCase().includes('outline'))
  //     );
  //     
  //     // Use longer timeout for PRD generation (200 seconds to account for backend 180s + buffer)
  //     // FastAPI can take time to process large documents and generate comprehensive PRDs
  //     const requestTimeout = isPRDGeneration ? 200000 : 60000; // 200 seconds for PRD, 60 for regular
  //     
  //     console.log(`⏱️  Frontend timeout set to: ${requestTimeout}ms (PRD generation: ${isPRDGeneration})`);
  //     
  //     // Handle file uploads with FormData
  //     // Don't set Content-Type manually - let the browser set it with boundary
  //     response = await aiApi.post('/ask', data, {
  //       timeout: requestTimeout
  //     });
  //   } else {
  //     response = await aiApi.post('/ask', data);
  //   }
  //   
  // 
  //   return response.data;
  // },

  
  // getChatHistory: async (limit: number = 50, offset: number = 0): Promise<ChatHistoryResponse> => {
  //   const response = await aiApi.get('/chat-history', {
  //     params: { limit, offset }
  //   });
  //   return response.data;
  // },

  
  // clearChatHistory: async (): Promise<{ success: boolean; message: string }> => {
  //   const response = await aiApi.delete('/chat-history');
  //   return response.data;
  // },

 
  // getAnalytics: async (): Promise<AIAnalytics> => {
  //   const response = await aiApi.get('/analytics');
  //   return response.data;
  // },


  // getHealth: async (): Promise<any> => {
  //   const response = await aiApi.get('/health');
  //   return response.data;
  // },

  
  // createConversation: async (data: CreateConversationRequest): Promise<CreateConversationResponse> => {
  //   const response = await aiApi.post('/conversations', data);
  //   return response.data;
  // },

  // getConversations: async (limit: number = 20, offset: number = 0, productId?: number): Promise<ConversationsResponse> => {
  //   const params: any = { limit, offset };
  //   if (productId) {
  //     params.productId = productId;
  //   }
  //   const response = await aiApi.get('/conversations', { params });
  //   return response.data;
  // },

  // getConversationMessages: async (conversationId: number): Promise<ConversationMessagesResponse> => {
  //   const response = await aiApi.get(`/conversations/${conversationId}/messages`);
  //   return response.data;
  // },

  // addMessageToConversation: async (data: AddMessageRequest): Promise<AddMessageResponse> => {
  //   const response = await aiApi.post(`/conversations/${data.conversationId}/messages`, {
  //     role: data.role,
  //     content: data.content,
  //     metadata: data.metadata
  //   });
  //   return response.data;
  // },

  // deleteConversation: async (conversationId: number): Promise<{ success: boolean; message: string }> => {
  //   const response = await aiApi.delete(`/conversations/${conversationId}`);
  //   return response.data;
  // },

  // NEW: FastAPI RAG-based AI Partner Chat Endpoints
  aiPartnerChat: async (data: {
    message: string;
    conversation_id?: number;
    product_id?: number;
    vehicle_id?: number;
    context_mode?: 'full' | 'compact';
  }): Promise<{
    reply: string;
    conversation_id: number;
    context_mode_used: 'full' | 'compact';
  }> => {
    const { fastApiService } = await import('./fastApiService');
    return fastApiService.aiPartnerChat(data);
  },

  getAiPartnerConversations: async (limit: number = 50, offset: number = 0): Promise<any[]> => {
    const { fastApiService } = await import('./fastApiService');
    return fastApiService.getAiPartnerConversations(limit, offset);
  },

  getAiPartnerConversation: async (conversationId: number): Promise<any> => {
    const { fastApiService } = await import('./fastApiService');
    return fastApiService.getAiPartnerConversation(conversationId);
  },

  updateAiPartnerConversationTitle: async (conversationId: number, title: string): Promise<any> => {
    const { fastApiService } = await import('./fastApiService');
    return fastApiService.updateAiPartnerConversationTitle(conversationId, title);
  },

  deleteAiPartnerConversation: async (conversationId: number): Promise<{
    status: string;
    conversation_id: number;
    message: string;
  }> => {
    const { fastApiService } = await import('./fastApiService');
    return fastApiService.deleteAiPartnerConversation(conversationId);
  },

  learning: async (data: LearningRequest): Promise<LearningResponse> => {
    const { fastApiService } = await import('./fastApiService');
    const explanationMode = (() => {
      if (data.tab === 'Symbolism/Signs') return 'symbolism' as const;
      if (data.tab === 'Semiotics') return 'semiotics' as const;
      return 'iconography' as const;
    })();
    const res = await fastApiService.learningPsqlQuery({
      product_id: data.product_id,
      topic: data.prompt,
      context: data.context,
      k: data.k,
      explanation_mode: explanationMode,
    });
    return {
      success: true,
      response: res.note,
      bullets: res.bullets,
      prd_ref: res.prd_ref,
      explanation_mode: res.explanation_mode,
      metadata: { tab: data.tab || 'general' },
    };
  },

  // swot: async (data: SwotRequest): Promise<SwotResponse> => {
  //   const response = await aiApi.post('/swot', data);
  //   return response.data;
  // }
};

export default aiService;
