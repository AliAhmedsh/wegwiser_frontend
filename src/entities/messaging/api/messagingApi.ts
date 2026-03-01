import { API_CONFIG } from '@/lib/config/api';
import axios from '@/lib/config/axiosConfig';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface Conversation {
  id: number;
  name?: string;
  isGroup: boolean;
  productId?: number;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  messages?: Message[];
}

export interface ConversationMember {
  id: number;
  userId: number;
  conversationId: number;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  conversationId: number;
  sender: User;
}

export interface CreateConversationRequest {
  name?: string;
  isGroup: boolean;
  memberIds: number[];
  productId?: number;
}

export interface SendMessageRequest {
  content: string;
  files?: File[];
}

export interface AddMembersRequest {
  newMemberIds: number[];
}

export const messagingApi = {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messaging/current-user`);
      return response.data.user;
    } catch (error) {
      console.error('Failed to get current user from API:', error);
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messaging/users`);
      return response.data.users;
    } catch (error) {
      console.error('Failed to get users from API:', error);
      throw error;
    }
  },

  async getConversations(productId?: number): Promise<Conversation[]> {
    try {
      const params = productId ? { productId: productId.toString() } : {};
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messaging/conversations`, { params });
      return response.data.conversations;
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/messaging/conversations`, data);
      return response.data.conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messaging/conversations/${conversationId}/messages`);
      return response.data.messages;
    } catch (error) {
      console.error('Failed to get messages from API:', error);
      throw error;
    }
  },

  async sendMessage(conversationId: number, data: SendMessageRequest): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      
      if (data.files && data.files.length > 0) {
        data.files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        formData.append('file_count', data.files.length.toString());
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL}/messaging/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  async addMembersToConversation(conversationId: number, data: AddMembersRequest): Promise<Conversation> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/messaging/conversations/${conversationId}/members`, data);
      return response.data.conversation;
    } catch (error) {
      console.error('Failed to add members to conversation:', error);
      throw error;
    }
  },

  async markMessagesAsRead(conversationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/messaging/conversations/${conversationId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  },

  async getUnreadCounts(): Promise<{ conversationId: number; unreadCount: number }[]> {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messaging/unread-counts`);
      return response.data.unreadCounts;
    } catch (error) {
      console.error('Failed to get unread counts:', error);
      throw error;
    }
  },
};