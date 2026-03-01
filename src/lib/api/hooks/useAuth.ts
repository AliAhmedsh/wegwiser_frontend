import { showToast } from '@/lib/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, SignupRequest } from '../services/authService';

import { getCookie, removeCookie, setCookie } from '@/lib/config/api';

export function useSignupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      showToast.success('Account created successfully! Please check your email for verification.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Signup failed. Please try again.';
      showToast.error(message);
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      setCookie('access_token', data.access_token, 7);
      showToast.success('Login successful!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Login failed. Please check your credentials.';
      showToast.error(message);
    },
  });
}

export function useUpdateVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.updateVerification(email),
    onSuccess: () => {
      showToast.success('Verification email sent successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to send verification email.';
      showToast.error(message);
    },
  });
}

export function useCheckVerificationQuery(email: string | null, enabled: boolean = false) {
  return useQuery({
    queryKey: ['verification', email],
    queryFn: () => authService.checkVerification({ email: email! }),
    enabled: enabled && !!email,
    refetchInterval: enabled ? 2000 : false,
    refetchIntervalInBackground: false,
  });
}

export const getAccessToken = (): string | null => {
  return getCookie('access_token');
};

export const removeAccessToken = (): void => {
  removeCookie('access_token');
};
