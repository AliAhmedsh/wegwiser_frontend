import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dependenciesService, CreateDependencyRequest, UpdateDependencyRequest } from './dependenciesService';
import { showToast } from '@/lib/utils/toast';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

export const dependenciesKeys = {
  all: ['dependencies'] as const,
  lists: () => [...dependenciesKeys.all, 'list'] as const,
  list: (productId: number, vehicleId?: number) => [...dependenciesKeys.lists(), productId, vehicleId] as const,
  detail: (id: number) => [...dependenciesKeys.all, 'detail', id] as const,
};

export function useDependenciesQuery(productId: number, enabled: boolean = true, vehicleId?: number) {
  return useQuery({
    queryKey: dependenciesKeys.list(productId, vehicleId),
    queryFn: () => dependenciesService.getDependencies(productId, vehicleId),
    enabled: enabled && !!productId && !!vehicleId, // Only enable if vehicleId is provided
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCreateDependencyMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: CreateDependencyRequest }) => {
      // Automatically add vehicleId if not already present
      const createData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return dependenciesService.createDependency(productId, createData);
    },
    onSuccess: (response, { productId }) => {
      queryClient.invalidateQueries({ queryKey: dependenciesKeys.list(productId, selectedVehicleId || undefined) });
      showToast.success(response.message || 'Dependency created successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to create dependency');
    },
  });
}

export function useUpdateDependencyMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();

  return useMutation({
    mutationFn: ({ dependencyId, data }: { dependencyId: number; data: UpdateDependencyRequest }) => {
      // Automatically add vehicleId if not already present
      const updateData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return dependenciesService.updateDependency(dependencyId, updateData);
    },
    onSuccess: (response, { dependencyId }) => {
      queryClient.invalidateQueries({ queryKey: dependenciesKeys.detail(dependencyId) });
      queryClient.invalidateQueries({ queryKey: dependenciesKeys.lists() });
      showToast.success(response.message || 'Dependency updated successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to update dependency');
    },
  });
}

export function useDeleteDependencyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dependencyId: number) => dependenciesService.deleteDependency(dependencyId),
    onSuccess: (response, dependencyId) => {
      queryClient.invalidateQueries({ queryKey: dependenciesKeys.detail(dependencyId) });
      queryClient.invalidateQueries({ queryKey: dependenciesKeys.lists() });
      showToast.success(response.message || 'Dependency deleted successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to delete dependency');
    },
  });
}
