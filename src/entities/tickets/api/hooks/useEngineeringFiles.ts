import { useQuery } from '@tanstack/react-query';
import { engineeringFilesService } from '../engineeringFilesService';

import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

export const useEngineeringFilesQuery = (productId: number, enabled: boolean = true) => {
  const { selectedVehicleId } = useSelectedVehicleStore();
  
  return useQuery({
    queryKey: ['engineeringFiles', productId, selectedVehicleId],
    queryFn: () => engineeringFilesService.getEngineeringFiles(productId, selectedVehicleId || undefined),
    enabled: enabled && !!productId && !!selectedVehicleId, // Only enable if vehicleId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
