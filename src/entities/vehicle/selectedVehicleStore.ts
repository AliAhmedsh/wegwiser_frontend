import { create } from 'zustand';

interface SelectedVehicleStore {
  selectedVehicleId: number | null;
  setSelectedVehicleId: (id: number | null) => void;
}

export const useSelectedVehicleStore = create<SelectedVehicleStore>((set) => ({
  selectedVehicleId: null,
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
}));


