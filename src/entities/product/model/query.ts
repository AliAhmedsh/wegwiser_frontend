import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApiService } from '../api/api';
import {
    AddMemberDto,
    CreatePRDDto,
    CreateProductDto,
    CreateTaskDto,
    UpdateProductDto,
    UpdateTaskDto
} from './types';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';
import { showToast } from '@/lib/utils/toast';

export function useProductsQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApiService.getAll(params),
  });
}

export function useProductQuery(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApiService.getById(id),
    enabled: enabled && !!id,
  });
}

export function useProposedVehiclesQuery(productId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['proposedVehicles', productId],
    queryFn: () => productApiService.getProposedVehicles(productId),
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch too often
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount - only fetch once when enabled
    refetchOnReconnect: false, // Don't refetch on reconnect
    // NO automatic polling - only fetch when query is first enabled or manually invalidated
    refetchInterval: false, // Disable automatic polling completely
  });
}

export function useLaunchProposedVehicleMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, proposedVehicleId }: { productId: number; proposedVehicleId: number }) =>
      productApiService.launchProposedVehicle(productId, proposedVehicleId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposedVehicles', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehiclesByProduct', variables.productId] });
    },
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto | FormData) => productApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      productApiService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useProductMembersQuery(productId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product-members', productId],
    queryFn: () => productApiService.getMembers(productId),
    enabled: enabled && !!productId,
  });
}

export function useAddMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: AddMemberDto }) =>
      productApiService.addMember(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-members', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, memberId }: { productId: number; memberId: number }) =>
      productApiService.removeMember(productId, memberId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-members', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}

export function useProductAnalyticsQuery(productId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product-analytics', productId],
    queryFn: () => productApiService.getAnalytics(productId),
    enabled: enabled && !!productId,
  });
}

export function useProductPRDQuery(productId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product-prd', productId],
    queryFn: () => productApiService.getPRD(productId),
    enabled: enabled && !!productId,
  });
}

export function useUpsertPRDMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: CreatePRDDto }) =>
      productApiService.upsertPRD(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-prd', productId] });
    },
  });
}

export function useProductTasksQuery(productId: number, enabled: boolean = true, vehicleId?: number) {
  return useQuery({
    queryKey: ['product-tasks', productId, vehicleId],
    queryFn: () => productApiService.getTasks(productId, vehicleId),
    enabled: enabled && !!productId && !!vehicleId, // Only enable if vehicleId is provided
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();
  
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: CreateTaskDto }) => {
      // Automatically add vehicleId if not already present
      const taskData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      if (!taskData.vehicleId) {
        throw new Error('vehicleId is required to create a task.');
      }
      return productApiService.createTask(productId, taskData);
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-tasks'] }); // Invalidate all product tasks queries
      // Invalidate vehicles to refresh task completion percentages
      queryClient.invalidateQueries({ 
        queryKey: [...vehicleKeys.all, 'byProduct', productId] 
      });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to create task.');
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();
  
  return useMutation({
    mutationFn: ({ productId, taskId, data }: { productId: number; taskId: number; data: UpdateTaskDto }) => {
      // Automatically add vehicleId if not already present
      const updateData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return productApiService.updateTask(productId, taskId, updateData);
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-tasks'] }); // Invalidate all product tasks queries
      // Invalidate vehicles to refresh task completion percentages
      queryClient.invalidateQueries({ 
        queryKey: [...vehicleKeys.all, 'byProduct', productId] 
      });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, taskId }: { productId: number; taskId: number }) =>
      productApiService.deleteTask(productId, taskId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product-tasks', productId] });
    },
  });
}
