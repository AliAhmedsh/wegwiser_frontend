import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usageInsightsApiService, UsageInsightsResponse } from './api';

export function useUsageInsightsQuery(productId: number, enabled: boolean = true) {
  return useQuery<UsageInsightsResponse>({
    queryKey: ['usageInsights', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      return usageInsightsApiService.getUsageInsights(productId);
    },
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useInvalidateUsageInsights() {
  const queryClient = useQueryClient();
  
  return (productId: number) => {
    queryClient.invalidateQueries({
      queryKey: ['usageInsights', productId]
    });
  };
}
