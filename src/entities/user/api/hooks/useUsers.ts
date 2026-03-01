import { useQuery } from '@tanstack/react-query';
import { userService, User, UserProfile } from '../userService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useUsersForProduct(productId?: number) {
  return useQuery({
    queryKey: ['users', 'product', productId],
    queryFn: () => userService.getAllUsers(),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useUserProfile(enabled: boolean = true) {
  return useQuery<UserProfile>({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userService.getProfile();
      return response.profile;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - increased to match prefetch
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
