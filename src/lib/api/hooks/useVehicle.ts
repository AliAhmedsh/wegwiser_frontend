import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleService, 
  BasicInfoRequest, 
  ProductRelationshipRequest, 
  VehicleOutlineRequest, 
  TeamMemberRequest, 
  AIElaborateRequest, 
  CreateCompleteVehicleRequest } from '../services/vehicleService';
import { fastApiService } from '../services/fastApiService';
import { showToast } from '@/lib/utils/toast';

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...vehicleKeys.lists(), { filters }] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: number) => [...vehicleKeys.details(), id] as const,
  formData: (productId: number) => [...vehicleKeys.all, 'formData', productId] as const,
  teamMembers: (vehicleId: number) => [...vehicleKeys.all, 'teamMembers', vehicleId] as const,
  review: (vehicleId: number) => [...vehicleKeys.all, 'review', vehicleId] as const,
  files: (vehicleId: number) => [...vehicleKeys.all, 'files', vehicleId] as const,
  taskCompletion: (userId: number | string, productId?: number, vehicleId?: number) => [...vehicleKeys.all, 'taskCompletion', userId, productId, vehicleId] as const,
};


export function useVehicleFormData(productId: number) {
  return useQuery({
    queryKey: vehicleKeys.formData(productId),
    queryFn: () => vehicleService.getVehicleFormData(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useVehiclesByProduct(productId: number) {
  return useQuery({
    queryKey: [...vehicleKeys.all, 'byProduct', productId],
    queryFn: () => vehicleService.getVehiclesByProduct(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAllVehicles(params?: {
  page?: number;
  limit?: number;
  productId?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: vehicleKeys.list(params || {}),
    queryFn: () => vehicleService.getAllVehicles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleService.getVehicle(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useTeamMembersForInvitation(vehicleId: number, search?: string, productId?: number) {
  return useQuery({
    queryKey: [...vehicleKeys.teamMembers(vehicleId), { search, productId }],
    queryFn: () => vehicleService.getTeamMembersForInvitation(vehicleId, search, productId),
    enabled: !!vehicleId || !!productId, // Enable if we have either vehicleId or productId
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    retryDelay: 1000,
  });
}

export function useSuggestedMembersByCompletionRate(productId?: number) {
  return useQuery({
    queryKey: [...vehicleKeys.all, 'suggestedMembers', productId],
    queryFn: () => vehicleService.getSuggestedMembersByCompletionRate(productId!),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useVehicleMemberSkillMatch(vehicleId?: number, order: 'asc' | 'desc' = 'desc') {
  return useQuery({
    queryKey: [...vehicleKeys.all, 'vehicleMemberSkillMatch', vehicleId, order],
    queryFn: () => fastApiService.getVehicleMemberSkillMatch(vehicleId!, order),
    enabled: !!vehicleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

export function useVehicleReview(vehicleId: number) {
  return useQuery({
    queryKey: vehicleKeys.review(vehicleId),
    queryFn: () => vehicleService.getVehicleReview(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useVehicleFiles(vehicleId: number) {
  return useQuery({
    queryKey: vehicleKeys.files(vehicleId),
    queryFn: () => vehicleService.getVehicleFiles(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useUserTaskCompletion(userId: number | string | null, productId?: number, enabled: boolean = true, vehicleId?: number) {
  return useQuery({
    queryKey: vehicleKeys.taskCompletion(userId || '', productId, vehicleId),
    queryFn: () => vehicleService.getUserTaskCompletion(userId!, productId, vehicleId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

// Mutations
export function useSaveBasicInfoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BasicInfoRequest) => vehicleService.saveBasicInfo(data),
    onSuccess: (data) => {
      showToast.success('Basic info saved successfully!');
      
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to save basic info.';
      showToast.error(message);
    },
  });
}

export function useSaveProductRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: number; data: ProductRelationshipRequest }) => 
      vehicleService.saveProductRelationship(vehicleId, data),
    onSuccess: (data, variables) => {
      showToast.success('Product relationship saved successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to save product relationship.';
      showToast.error(message);
    },
  });
}

export function useSaveVehicleOutlineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: number; data: VehicleOutlineRequest }) => 
      vehicleService.saveVehicleOutline(vehicleId, data),
    onSuccess: (data, variables) => {
      showToast.success('Vehicle outline saved successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to save vehicle outline.';
      showToast.error(message);
    },
  });
}

export function useAddTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: number; data: TeamMemberRequest }) => 
      vehicleService.addTeamMember(vehicleId, data),
    onMutate: async ({ vehicleId, data }) => {
     
      await queryClient.cancelQueries({ queryKey: vehicleKeys.teamMembers(vehicleId) });

      const previousData = queryClient.getQueryData(vehicleKeys.teamMembers(vehicleId));


      queryClient.setQueryData(vehicleKeys.teamMembers(vehicleId), (old: any) => {
        if (!old?.data) return old;
        
        const newMember = {
          id: Date.now(), // Temporary ID
          userId: data.userId,
          role: data.role,
          user: { id: data.userId, name: 'Loading...', email: 'loading@example.com' }
        };

        return {
          ...old,
          data: {
            ...old.data,
            added: [...old.data.added, newMember],
            all: old.data.all.filter((user: any) => user.id !== data.userId)
          }
        };
      });

      return { previousData };
    },
    onSuccess: (data, variables) => {
      showToast.success('Team member added successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.teamMembers(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
    },
    onError: (error: any, variables, context) => {
    
      if (context?.previousData) {
        queryClient.setQueryData(vehicleKeys.teamMembers(variables.vehicleId), context.previousData);
      }
      
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to add team member.';
      showToast.error(message);
    },
  });
}

export function useAddTeamMembersBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, members }: { vehicleId: number; members: Array<{ userId: number; role: string }> }) => 
      vehicleService.addTeamMembersBatch(vehicleId, members),
    onSuccess: (data, variables) => {
      showToast.success(data.message || `${variables.members.length} team members added successfully!`);
      queryClient.invalidateQueries({ queryKey: vehicleKeys.teamMembers(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
    },
    onError: (error: any, variables) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to add team members.';
      showToast.error(message);
    },
  });
}

export function useRemoveTeamMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, memberId }: { vehicleId: number; memberId: number }) => 
      vehicleService.removeTeamMember(vehicleId, memberId),
    onMutate: async ({ vehicleId, memberId }) => {
     
      await queryClient.cancelQueries({ queryKey: vehicleKeys.teamMembers(vehicleId) });

   
      const previousData = queryClient.getQueryData(vehicleKeys.teamMembers(vehicleId));

      queryClient.setQueryData(vehicleKeys.teamMembers(vehicleId), (old: any) => {
        if (!old?.data) return old;
        
        const removedMember = old.data.added.find((member: any) => member.id === memberId);
        
        return {
          ...old,
          data: {
            ...old.data,
            added: old.data.added.filter((member: any) => member.id !== memberId),
            all: removedMember ? [...old.data.all, removedMember.user] : old.data.all
          }
        };
      });

      return { previousData };
    },
    onSuccess: (data, variables) => {
      showToast.success('Team member removed successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.teamMembers(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
    },
    onError: (error: any, variables, context) => {
    
      if (context?.previousData) {
        queryClient.setQueryData(vehicleKeys.teamMembers(variables.vehicleId), context.previousData);
      }
      
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to remove team member.';
      showToast.error(message);
    },
  });
}

export function useFinalizeVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: number) => vehicleService.finalizeVehicle(vehicleId),
    onSuccess: (data, vehicleId) => {
      showToast.success('Vehicle created successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to finalize vehicle creation.';
      showToast.error(message);
    },
  });
}

export function useAIElaborateMutation() {
  return useMutation({
    mutationFn: (data: AIElaborateRequest) => vehicleService.aiElaborateDescription(data),
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to elaborate description.';
      showToast.error(message);
    },
  });
}

export function useUploadVehicleFilesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, files }: { vehicleId: number; files: File[] }) => 
      vehicleService.uploadVehicleFiles(vehicleId, files),
    onSuccess: (data, variables) => {
      showToast.success('Files uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.files(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.vehicleId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to upload files.';
      showToast.error(message);
    },
  });
}

export function useCreateCompleteVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompleteVehicleRequest) => vehicleService.createCompleteVehicle(data),
    onSuccess: () => {
      showToast.success('Vehicle created successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to create vehicle.';
      showToast.error(message);
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vehicleService.deleteVehicle(id),
    onSuccess: () => {
      showToast.success('Vehicle deleted successfully!');
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Failed to delete vehicle.';
      showToast.error(message);
    },
  });
}
