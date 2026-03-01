export { ticketsService } from './api/ticketsService';
export type { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketActionRequest, 
  TicketAnalytics 
} from './api/ticketsService';

export {
  useTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useTicketActionMutation,
  useTicketAnalyticsQuery,
  ticketsKeys
} from './api/hooks';

export { useTicketsStore } from './model';