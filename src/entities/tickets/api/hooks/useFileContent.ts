import { useQuery, useQueryClient } from '@tanstack/react-query';
import { engineeringFilesService, EngineeringFile } from '../engineeringFilesService';

export const fileContentKeys = {
  all: ['engineering-file-content'] as const,
  detail: (fileId: number, vehicleId: number) => [...fileContentKeys.all, 'detail', fileId, vehicleId] as const,
};

export function useFileContent(fileId: number | null, vehicleId: number | null, enabled: boolean = true) {
  return useQuery<{ success: boolean; file?: EngineeringFile; error?: string }>({
    queryKey: fileContentKeys.detail(fileId!, vehicleId!),
    queryFn: async () => {
      if (!fileId || !vehicleId) {
        throw new Error('fileId and vehicleId are required');
      }
      return engineeringFilesService.getFileContent(fileId, vehicleId);
    },
    enabled: enabled && !!fileId && !!vehicleId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePrefetchFileContent() {
  const queryClient = useQueryClient();

  return (fileId: number, vehicleId: number) => {
    queryClient.prefetchQuery({
      queryKey: fileContentKeys.detail(fileId, vehicleId),
      queryFn: async () => {
        return engineeringFilesService.getFileContent(fileId, vehicleId);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}


