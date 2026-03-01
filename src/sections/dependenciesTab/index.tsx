import { Dependency as ApiDependency, CreateDependencyRequest, useCreateDependencyMutation, useDependenciesQuery } from '@/entities/dependencies';
import { useDependenciesStore } from '@/entities/dependencies/model';
import { AddDependencyModal, DependencyCard } from '@/entities/dependencies/ui';
import { useProductStore } from '@/entities/product';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { useIsEngineer } from '@/lib/utils/userRole';
import Spinner from '@/shared/ui/Spinner';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useEffect, useState } from 'react';

export default function DependenciesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chosenProduct = useProductStore((state) => state.chosenProduct);
  const { selectedVehicleId } = useSelectedVehicleStore();
  const productId = chosenProduct?.id;
  const setDependencies = useDependenciesStore((state) => state.setDependencies);
  const { user } = useLoginStore();
  const canManageDependencies = useIsEngineer();

  const { data: dependenciesResponse, isLoading } = useDependenciesQuery(productId || 0, !!productId, selectedVehicleId || undefined);
  const createMutation = useCreateDependencyMutation();

  useEffect(() => {
    if (dependenciesResponse?.dependencies) {
      const transformedDependencies = dependenciesResponse.dependencies.map((apiDep: ApiDependency) => ({
        id: apiDep.id.toString(),
        title: apiDep.name,
        description: apiDep.description,
        status: apiDep.status === 'active' ? 'On track' as const : 'At risk' as const,
        progress: apiDep.status === 'active' ? 0.7 : 0.4,
      }));
      setDependencies(transformedDependencies);
    }
  }, [dependenciesResponse, setDependencies]);

  const dependencies = useDependenciesStore((state) => state.dependencies);

  const handleAddNew = () => {
    if (!chosenProduct) {
      return; // Don't show modal if no product selected
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreateDependency = async (data: CreateDependencyRequest) => {
    if (productId) {
      try {
        // vehicleId will be automatically added by useCreateDependencyMutation hook
        await createMutation.mutateAsync({
          productId,
          data,
        });
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to create dependency:', error);
      }
    }
  };

  return (
    <div className="w-[98%] h-[99%] overflow-y-scroll overflow-hidden custom-scrollbar-second">
      <div className="h-full flex flex-col gap-4">
        {chosenProduct && canManageDependencies && (
          <div className="flex justify-start">
            <button
              onClick={handleAddNew}
              className="text-base text-black font-semibold mb-5 cursor-pointer px-5 h-[35px] border-1 border-[#627899] rounded-xl hover:bg-gray-50 transition-colors"
            >
              Add New
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col gap-4 w-full mx-auto">
          {isLoading && dependencies.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 flex items-center">
                <Spinner size="sm" className="mr-2" />
                Loading dependencies...
              </p>
            </div>
          ) : !chosenProduct ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-sm font-medium mb-1">No product selected</p>
                <p className="text-xs">Please select a product to view dependencies</p>
              </div>
            </div>
          ) : dependencies.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-center">No dependencies found. Click "Add New" to create your first dependency.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full mx-auto">
              {dependencies.map((dep, index) => (
                <div className="ml-2" key={index}>
                  <DependencyCard key={dep.id} dependency={dep} />
                </div>
              ))}
              {isLoading && (
                <div className="w-full flex justify-center py-4">
                  <Spinner size="sm" className="text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddDependencyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateDependency}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
