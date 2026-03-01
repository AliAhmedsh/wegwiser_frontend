import { API_CONFIG, getCookie } from '@/lib/config/api';
import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';

const authApi = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/auth`,
  timeout: 90000, // 90 seconds for login (increased for Render.com cold starts)
  headers: API_CONFIG.HEADERS,
});

authApi.interceptors.request.use((config) => {
  // Try both cookie names to handle the mismatch
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
    }
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  jobTitle?: string;
  position?: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
    role?: string;
    jobTitle?: string;
    position?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  tokens?: {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
    role?: string;
    createdAt?: string | Date;
  };
}

export interface CheckVerificationRequest {
  email: string;
}

export interface CheckVerificationResponse {
  verified: boolean;
  message: string;
}

export interface SetFinalPasswordRequest {
  email: string;
  password: string;
}

export interface SetFinalPasswordResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

// Retry helper function with smart exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 4,
  baseDelay: number = 500 // Fast first retry: 500ms for immediate retry
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      if (error.response?.status === 401) {
        throw error;
      }
      
      const shouldRetry = 
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('canceled') ||
        error.message?.includes('Request aborted') ||
        error.response?.status === 503 ||
        error.response?.status === 502 ||
        error.response?.status === 504 ||
        error.response?.status === 408 || // Request timeout
        (error.response === undefined && error.message); // Network errors without response
      
      if (!shouldRetry || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Login attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`, error.message || error.code || 'Unknown error');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

class AuthService {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await authApi.post<SignupResponse>('/signup', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return retryRequest(
      () =>
        authApi.post<LoginResponse>('/login', data).then((res) => {
          const payload = res.data;
          // Normalize backend shape: some responses return tokens.access_token.
          if (!payload.access_token && payload.tokens?.access_token) {
            return {
              ...payload,
              access_token: payload.tokens.access_token,
              expires_in: payload.expires_in ?? payload.tokens.expires_in,
            };
          }
          return payload;
        }),
      4,
      500 // fast first retry: 500ms for immediate retry on cold start
    );
  }

  async updateVerification(email: string): Promise<void> {
    await authApi.post('/update-verification', { email });
  }

  async checkVerification(data: CheckVerificationRequest): Promise<CheckVerificationResponse> {
    const response = await authApi.post<CheckVerificationResponse>('/check-verification', data);
    return response.data;
  }

  async setFinalPassword(data: SetFinalPasswordRequest): Promise<SetFinalPasswordResponse> {
    const response = await authApi.post<SetFinalPasswordResponse>('/set-password', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await authApi.post('/logout');
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await authApi.post<ForgotPasswordResponse>('/forgot-password', data);
    return response.data;
  }
}

export const authService = new AuthService();
