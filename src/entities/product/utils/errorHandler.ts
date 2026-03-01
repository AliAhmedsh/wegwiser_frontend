import { showToast } from '@/lib/utils/toast';

export interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
  suppressConsoleError?: boolean;
}

export const handleProductApiError = (error: ApiError, defaultMessage: string = 'An error occurred') => {
  try {
    const status = error.response?.status;
    
    if (status === 403) {
      const errorData = error.response?.data;
      if (errorData?.error) {
        showToast.error(errorData.error);
      } else {
        showToast.error('You do not have permission to perform this action. Only Product Managers can perform this operation.');
      }
    } else if (status === 400) {
      const errorData = error.response?.data;
      showToast.error(errorData?.error || errorData?.message || 'Invalid data provided. Please check your input.');
    } else if (status === 404) {
      showToast.error('The requested resource was not found.');
    } else if (status === 401) {
      showToast.error('Please log in to continue.');
    } else if (status && status >= 500) {
      showToast.error('Server error. Please try again later.');
    } else {
      showToast.error(error.message || defaultMessage);
    }
  } catch (handlerError) {
    showToast.error(defaultMessage);
  }
};

export const handleProductApiSuccess = (message: string) => {
  showToast.success(message);
};
