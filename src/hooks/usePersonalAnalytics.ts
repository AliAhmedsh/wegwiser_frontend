import { fetchPersonalAnalytics, PersonalAnalytics } from '@/lib/api/personalAnalytics';
import { useQuery } from '@tanstack/react-query';

export const usePersonalAnalytics = (productId: number | null) => {
  return useQuery<PersonalAnalytics>({
    queryKey: ['personalAnalytics', productId],
    queryFn: () => fetchPersonalAnalytics(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
