import { fetchUserAnalytics, UserAnalytics } from '@/lib/api/personalAnalytics';
import { useQuery } from '@tanstack/react-query';

export const useUserAnalytics = (userId: string | number | null, productId?: number | null) => {
  return useQuery<UserAnalytics>({
    queryKey: ['userAnalytics', userId, productId],
    queryFn: () => fetchUserAnalytics(Number(userId), productId || undefined),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

