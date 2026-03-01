'use client';

import { showToast } from '@/lib/utils/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '@/lib/config/axiosConfig';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Global error handler for unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || 'Unknown error';
      const errorStack = event.error?.stack || '';
      
      // Ignore ResizeObserver errors - these are common browser warnings and not actual errors
      if (errorMessage && errorMessage.includes('ResizeObserver')) {
        // Silently ignore ResizeObserver loop errors
        return;
      }
      
      // Only log and show toast for real errors
      if (event.error || event.message) {
        console.error('Global error caught:', event.error || errorMessage, errorStack);
        showToast.error('An unexpected error occurred. Please refresh the page if issues persist.');
      }
    };

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      showToast.error('An unexpected error occurred. Please refresh the page if issues persist.');
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-[12px] shadow-lg font-poppins text-[14px]"
      />
    </QueryClientProvider>
  );
}
