import { API_CONFIG, getCookie } from '@/lib/config/api';
import axios, { AxiosError, AxiosResponse } from 'axios';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: false, // Disable credentials for CORS
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }
    
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
 
    return config;
  },
  (error) => {
      console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
  
    return response;
  },
  (error: AxiosError) => {
      const errorData = error.response?.data;
      const url = error.config?.url || '';
      const isPersonalAnalytics = url.includes('/personal-analytics');
      const hasMeaningfulData = !!errorData && Object.keys(errorData as object).length > 0;

      // Suppress noisy logs for empty personal analytics errors
      if (!isPersonalAnalytics || hasMeaningfulData) {
        if (hasMeaningfulData) {
          console.error('API Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            url,
            response: errorData,
          });
        } else {
          console.error('API Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            url,
          });
        }
      }

    // Handle specific connection errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('Connection Error - Check if backend is accessible:', {
        baseURL: API_CONFIG.BASE_URL,
        suggestion: 'Backend might be down or CORS not configured properly'
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
