import { showToast } from '@/lib/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTicketRequest, TicketActionRequest, ticketsService, UpdateTicketRequest } from './ticketsService';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';
import { useProductStore } from '@/entities/product';
import fastApiService from '@/lib/api/services/fastApiService';

export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (productId: number, filters: Record<string, any>) => [...ticketsKeys.lists(), productId, { filters }] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (ticketId: string) => [...ticketsKeys.details(), ticketId] as const,
  analytics: (productId: number, filters?: Record<string, any>) => [...ticketsKeys.all, 'analytics', productId, { filters }] as const,
};

export function useTicketsQuery(productId: number, params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  vehicleId?: number;
}) {
  return useQuery({
    queryKey: ticketsKeys.list(productId, params || {}),
    queryFn: () => ticketsService.getTickets(productId, params),
    enabled: !!productId && !!params?.vehicleId, // Only enable if vehicleId is provided
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: any) => {

      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: any) => {
 
      if (error?.response?.status !== 404) {
        showToast.error(error.response?.data?.error || error.message || 'Failed to fetch tickets');
      }
    },
  });
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { chosenProduct } = useProductStore();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: CreateTicketRequest }) => {
      // Automatically add vehicleId if not already present
      const createData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return ticketsService.createTicket(productId, createData);
    },
    onSuccess: (response, { productId, data }) => {
      // Invalidate all ticket list queries (React Query does prefix matching by default)
      queryClient.invalidateQueries({ 
        queryKey: ticketsKeys.lists()
      });
      // Also invalidate analytics
      queryClient.invalidateQueries({ queryKey: ticketsKeys.analytics(productId) });
      // Invalidate vehicles to refresh task completion percentages
      const productIdToUse = productId || chosenProduct?.id;
      if (productIdToUse) {
        queryClient.invalidateQueries({ 
          queryKey: [...vehicleKeys.all, 'byProduct', productIdToUse] 
        });
      }
      showToast.success(response.message || 'Ticket created successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to create ticket');
    },
  });
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { chosenProduct } = useProductStore();

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: UpdateTicketRequest }) => {
      // Automatically add vehicleId if not already present
      const updateData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return ticketsService.updateTicket(ticketId, updateData);
    },
    onSuccess: (response, { ticketId, data }) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      // Invalidate vehicles to refresh task completion percentages
      if (chosenProduct?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [...vehicleKeys.all, 'byProduct', chosenProduct.id] 
        });
      }

      // Trigger evaluation when ticket is completed
      if (data.status === 'completed' && selectedVehicleId) {
        fastApiService.evaluateVehicle({
          code: [],
          role: 'frontend',
          time_range: { startTime: Date.now() - 86400000, endTime: Date.now() },
          user_id: 1, // TODO: get from auth store
          vehicle_id: Number(selectedVehicleId),
        }).then(result => {
          console.log('Evaluation triggered on ticket completion:', result);
          queryClient.invalidateQueries({ queryKey: ['fastApi'] });
        }).catch(err => {
          console.error('Evaluation failed (non-blocking):', err);
        });
      }

      showToast.success(response.message || 'Ticket updated successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to update ticket');
    },
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => ticketsService.deleteTicket(ticketId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      showToast.success(response.message || 'Ticket deleted successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to delete ticket');
    },
  });
}

export function useTicketActionMutation() {
  const queryClient = useQueryClient();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { chosenProduct } = useProductStore();

  return useMutation({
    mutationFn: ({ productId, ticketId, data }: { productId: number; ticketId: string; data: TicketActionRequest }) => {
      // Automatically add vehicleId if not already present
      const actionData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      return ticketsService.performTicketAction(productId, ticketId, actionData);
    },
    onSuccess: (response, { productId, ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(ticketId) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.analytics(productId) });
      // Invalidate vehicles to refresh task completion percentages
      const productIdToUse = productId || chosenProduct?.id;
      if (productIdToUse) {
        queryClient.invalidateQueries({ 
          queryKey: [...vehicleKeys.all, 'byProduct', productIdToUse] 
        });
      }
      showToast.success(response.message || 'Ticket action performed successfully!');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error || error.message || 'Failed to perform ticket action');
    },
  });
}

export function useTicketAnalyticsQuery(productId: number, params?: {
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ticketsKeys.analytics(productId, params),
    queryFn: () => ticketsService.getTicketAnalytics(productId, params),
    enabled: !!productId,
  });
}

