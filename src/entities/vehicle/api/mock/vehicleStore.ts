import { create } from 'zustand';
import { VehicleListProps } from '../../types';
import { persist } from 'zustand/middleware';

interface useVehicleStoreProps {
  vehicles: VehicleListProps[];
  addVehicle: (newVehicle: VehicleListProps) => void;
  getVehicleByName: (vehicleName: string) => VehicleListProps | undefined;
  getVehiclesByProductId: (productId: number) => VehicleListProps[];
}

const useVehicleStore = create<useVehicleStoreProps>()(
  persist(
    (set, get) => ({
      vehicles: [],
      addVehicle: (newVehicle) =>
        set({
          vehicles: [
            ...get().vehicles,
            { ...newVehicle, id: get().vehicles.length },
          ],
        }),
      getVehicleByName: (vehicleName) => {
        return get().vehicles.find((v) => v.vehicleInfo.name === vehicleName);
      },
      getVehiclesByProductId: (productId) => {
        return get().vehicles.filter((v) => v.productId === productId);
      },
    }),
    {
      name: 'vehicle-store',
    }
  )
);

export default useVehicleStore;
