import { removeCookie } from '@/lib/config/api';
import useLoginStore from '@/store/TO_DELETE/loginStore';

export const handleAuthError = () => {
  removeCookie('access_token');
  removeCookie('token');
  
  const { logout } = useLoginStore.getState();
  logout();
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

export const createAuthErrorInterceptor = () => {
  return (error: any) => {
    if (error.response?.status === 401) {
      handleAuthError();
    }
    return Promise.reject(error);
  };
};
