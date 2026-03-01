import { showToast } from '@/lib/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { designFilesService, type CreateDesignFileRequest, type UpdateDesignFileRequest } from '../api';

export const designFilesKeys = {
  all: ['designFiles'] as const,
  lists: () => [...designFilesKeys.all, 'list'] as const,
  list: (productId: number) => [...designFilesKeys.lists(), productId] as const,
};

export function useDesignFilesQuery(productId: number) {
  return useQuery({
    queryKey: designFilesKeys.list(productId),
    queryFn: () => designFilesService.getDesignFiles(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
    
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: any) => {
 
      if (error?.response?.status !== 404) {
        showToast.error(error.response?.data?.error || error.message || 'Failed to fetch design files');
      }
    },
  });
}

export function useCreateDesignFileMutation(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDesignFileRequest) => 
      designFilesService.createDesignFile(productId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: designFilesKeys.list(productId) });
        showToast.success('Design file created successfully');
      } else {
        showToast.error(response.error || 'Failed to create design file');
      }
    },
    onError: (error: any) => {
      showToast.error(error.message || 'Failed to create design file');
    },
  });
}

export function useUpdateDesignFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, data }: { fileId: number; data: UpdateDesignFileRequest }) =>
      designFilesService.updateDesignFile(fileId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: designFilesKeys.all });
        showToast.success('Design file updated successfully');
      } else {
        showToast.error(response.error || 'Failed to update design file');
      }
    },
    onError: (error: any) => {
      showToast.error(error.message || 'Failed to update design file');
    },
  });
}

export function useDeleteDesignFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: number) => designFilesService.deleteDesignFile(fileId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: designFilesKeys.all });
        showToast.success('Design file deleted successfully');
      } else {
        showToast.error(response.error || 'Failed to delete design file');
      }
    },
    onError: (error: any) => {
      showToast.error(error.message || 'Failed to delete design file');
    },
  });
}

export function useDesignFilesWithReactQuery(productId: number) {
  const { data, isLoading, error, refetch } = useDesignFilesQuery(productId);
  const createMutation = useCreateDesignFileMutation(productId);
  const updateMutation = useUpdateDesignFileMutation();
  const deleteMutation = useDeleteDesignFileMutation();

  return {
    files: data?.files || [],
    workspace: data?.workspace,
    isLoading,
    error,
    refetch,
    createFile: createMutation.mutate,
    updateFile: updateMutation.mutate,
    deleteFile: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
