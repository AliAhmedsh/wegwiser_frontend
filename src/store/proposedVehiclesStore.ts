import { create } from 'zustand';

export interface ProposedVehicle {
  vehicle_name: string;
  description: string;
  fleet?: string;
  priority?: string;
  start_date?: string;
  estimated_completion_date?: string;
  timeline_reasoning?: string;
  success_metrics?: string[];
  suggested_members?: Array<{
    role: string;
    required_skills: string;
    rationale: string;
  }>;
  feature_list_preview?: string[];
  product_correlation?: string;
}

export interface ProposedVehiclesResponse {
  'step1-basics'?: {
    vehicles_basic?: Array<{
      vehicle_name: string;
      description: string;
    }>;
  };
  'step2-assumptions'?: {
    assumptions_text?: string;
  };
  'step3-finalize'?: {
    vehicles?: ProposedVehicle[];
  };
}

interface ProposedVehiclesStore {
  proposedVehiclesByProduct: Record<number, ProposedVehiclesResponse>;
  
  setProposedVehicles: (productId: number, response: ProposedVehiclesResponse) => void;
  
  getProposedVehicles: (productId: number) => ProposedVehiclesResponse | null;
  
  getFinalProposedVehicles: (productId: number) => ProposedVehicle[] | null;
  
  clearProposedVehicles: (productId: number) => void;
  
  clearAllProposedVehicles: () => void;
}

export const useProposedVehiclesStore = create<ProposedVehiclesStore>()((set, get) => ({
      proposedVehiclesByProduct: {},
      
      setProposedVehicles: (productId, response) => {
    console.warn('setProposedVehicles is deprecated. Data is now stored in database.');
      },
      
      getProposedVehicles: (productId) => {
    console.warn('getProposedVehicles is deprecated. Use useProposedVehiclesQuery hook instead.');
    return null;
      },
      
      getFinalProposedVehicles: (productId) => {
    console.warn('getFinalProposedVehicles is deprecated. Use useProposedVehiclesQuery hook instead.');
    return null;
      },
      
      clearProposedVehicles: (productId) => {
        set((state) => {
          const { [productId]: _, ...rest } = state.proposedVehiclesByProduct;
          return { proposedVehiclesByProduct: rest };
        });
      },
      
      clearAllProposedVehicles: () => {
        set({ proposedVehiclesByProduct: {} });
      },
}));

