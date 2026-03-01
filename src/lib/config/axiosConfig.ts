import { createAuthErrorInterceptor } from '@/lib/utils/authErrorHandler';
import axios from 'axios';
import { getCookie } from './api';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const shouldSuppressAuth = 
        url.includes('/refine-doc') || 
        url.includes('/propose-vehicle') ||
        error.config?.suppressAuthError || 
        error.suppressAuthError;
      
      if (!shouldSuppressAuth) {
      const authErrorHandler = createAuthErrorInterceptor();
      return authErrorHandler(error);
      }
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
    }
    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
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
  (error) => Promise.reject(error)
);

export default axios;
