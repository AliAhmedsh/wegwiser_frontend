import { create } from 'zustand';
import { Ticket } from './api/ticketsService';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  isLoading: boolean;
  setTickets: (tickets: Ticket[]) => void;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setIsLoading: (loading: boolean) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  removeTicket: (ticketId: string) => void;
  clearTickets: () => void;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  isLoading: false,
  
  setTickets: (tickets) => set({ tickets }),
  
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addTicket: (ticket) => set((state) => ({ 
    tickets: [ticket, ...state.tickets] 
  })),
  
  updateTicket: (ticketId, updates) => set((state) => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ),
    selectedTicket: state.selectedTicket?.id === ticketId 
      ? { ...state.selectedTicket, ...updates }
      : state.selectedTicket
  })),
  
  removeTicket: (ticketId) => set((state) => ({
    tickets: state.tickets.filter(ticket => ticket.id !== ticketId),
    selectedTicket: state.selectedTicket?.id === ticketId ? null : state.selectedTicket
  })),
  
  clearTickets: () => set({ tickets: [], selectedTicket: null }),
}));
