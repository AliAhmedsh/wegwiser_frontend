import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddMemberPopup from '@/components/ui/AddMemberPopup';
import { getValidProducts, useProductsQuery } from '@/entities/product';
import { useProductStore } from '@/entities/product/store';
import { useUpdateProductMutation } from '@/entities/product/model/query';
import VehicleList from '@/entities/vehicle/vehicleList';
import VehicleFull from '@/entities/vehicle/vehicleFull';
import { useCreationProductStore } from '@/features/createProduct';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { useVehiclesByProduct, useVehicle, vehicleKeys } from '@/lib/api/hooks/useVehicle';
import { AnimatePresence, motion } from 'framer-motion';
import { isProductManager } from '@/lib/utils/userRole';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { showToast } from '@/lib/utils/toast';
import Loader from '@/shared/ui/Loader';
import Spinner from '@/shared/ui/Spinner';
import PeopleCardList from '@/shared/ui/peopleCardList';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useQueryClient } from '@tanstack/react-query';
import { Poppins } from 'next/font/google';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ui/ProductCard';

declare global {
  interface Window {
    descriptionSaveTimeout?: NodeJS.Timeout;
  }
}

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

interface ProductModalContentProps {
  onClose: () => void;
}

const ProductModalContent: React.FC<ProductModalContentProps> = ({
  onClose,
}) => {
  const [chosenProductId, setChosenProductId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isAddMemberPopupOpen, setIsAddMemberPopupOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: selectedVehicleData, isLoading: vehicleLoading, error: vehicleError } = useVehicle(selectedVehicleId || 0);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useLoginStore();
  const canManageProducts = isProductManager();

  const { data: productsResponse, isLoading } = useProductsQuery();
  const allProducts = productsResponse?.products || [];
  const products = getValidProducts(allProducts);

  const chosenProduct = useProductStore((state) => state.chosenProduct);
  const setChosenProduct = useProductStore((state) => state.setChosenProduct);
  const { resetAll: resetAllProdCreation } = useCreationProductStore();
  const { resetAll: resetAllVehCreation } = useCreationVehicleStore();

  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehiclesByProduct(chosenProduct?.id || 0);
  const updateProductMutation = useUpdateProductMutation();

  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      await fastApiService.deleteVehicle(vehicleId);
      showToast.success('Vehicle deleted successfully');
      
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'byProduct', chosenProduct?.id] });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      
      if (selectedVehicleId === vehicleId) {
        setSelectedVehicleId(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete vehicle';
      showToast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (chosenProduct?.id) {
      (async () => {
        try {
          const result = await fastApiService.getPrdByProduct(chosenProduct.id);
          if (result?.prd_id) {
            localStorage.setItem('prd_id', result.prd_id);
            console.log('[ProductModal] PRD ID saved to localStorage:', result.prd_id);
          } else if (result?.id) {
            localStorage.setItem('prd_id', result.id);
            console.log('[ProductModal] PRD ID saved to localStorage:', result.id);
          }
        } catch (error: any) {
          console.warn('[ProductModal] Failed to fetch PRD by product:', error.response?.data || error.message);
        }
      })();
    }
  }, [chosenProduct?.id]);

  const onProdCardClick = async (prodId: number) => {
    const latestProduct = products?.find((product) => product.id === prodId);
    if (!latestProduct) {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      return;
    }

    setChosenProductId(latestProduct.id);
    setChosenProduct(latestProduct);
  };

  const handleCreateProductClick = () => {
    resetAllProdCreation();
    router.push('/product-creation');
  };

  const handleCreateVehicleClick = () => {
    resetAllVehCreation();
    router.push('/vehicle-creation');
  };

  const handleInviteMembers = async (emails: string[]) => {
  };

  const autoSaveDescription = async (text: string) => {
    if (!chosenProduct?.id || isSaving) return;
    
    setIsSaving(true);
    try {
      await updateProductMutation.mutateAsync({
        id: chosenProduct.id,
        data: { description: text }
      });
      
      setChosenProduct({
        ...chosenProduct,
        description: text
      });
    } catch (error) {
      console.error('Failed to save description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescriptionText(text);
    
    if (window.descriptionSaveTimeout) {
      clearTimeout(window.descriptionSaveTimeout);
    }
    
    window.descriptionSaveTimeout = setTimeout(() => {
      autoSaveDescription(text);
    }, 1000);
  };

  const handleDescriptionClick = () => {
    if (!isEditingDescription) {
      setIsEditingDescription(true);
      setDescriptionText(chosenProduct?.description || '');
      setTimeout(() => {
        descriptionTextareaRef.current?.focus();
      }, 100);
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (descriptionText !== chosenProduct?.description) {
      autoSaveDescription(descriptionText);
    }
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  useEffect(() => {
    return () => {
      if (window.descriptionSaveTimeout) {
        clearTimeout(window.descriptionSaveTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const fromInvitation = sessionStorage.getItem('fromInvitation');
    if (fromInvitation && products && products.length > 0 && chosenProduct) {
      setChosenProductId(chosenProduct.id);
    }
  }, [products, chosenProduct, setChosenProductId]);

  useEffect(() => {
    if (!products) return;

    if (chosenProduct) {
      setChosenProductId(chosenProduct.id);
      
      // Sync chosenProduct with latest data from products list (to get updated description)
      const latestProduct = products.find(p => p.id === chosenProduct.id);
      if (latestProduct && latestProduct.description !== chosenProduct.description) {
        // Update store with latest product data (especially description)
        setChosenProduct(latestProduct);
        console.log('🔄 Synced chosenProduct with latest data from products list');
      }
    } else if (products && products.length > 0) {
      if (!chosenProductId) {
        const firstProduct = products[0];
        setChosenProductId(firstProduct.id);
        setChosenProduct(firstProduct);
      }
    }
  }, [chosenProduct, products, setChosenProduct, setChosenProductId, chosenProductId]);

  if (isLoading || !chosenProduct)
    return (
      <div className="bg-white w-[calc(100vw-40px)] h-[calc(100vh-240px)] max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden overflow-x-hidden">
        <Loader size="sm" text="Loading products..." className="h-full" />
      </div>
    );

  return (
    <div className="flex flex-col justify-center h-[100vh]">
      <div className="bg-white  w-[calc(100vw-40px)] h-112 max-w-[90vw] rounded-2xl shadow-2xl flex flex-col overflow-hidden overflow-x-hidden">
        <div className="flex justify-between items-center p-5 pl-10 h-[80px]">
          <div>
            <h2
              className={`text-2xl font-semibold text-black ${Poppins600.className}`}
            >
              {chosenProduct.name}
            </h2>
            <p className="text-xs text-black">
              Created by {chosenProduct.owner?.name || 'Unknown'} {new Date(chosenProduct.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {canManageProducts && (
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="rotate-90"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white p-2 shadow-lg rounded-lg z-[10001]">
                  <DropdownMenuItem
                    className="text-[#3D3D3D] cursor-pointer"
                    onSelect={() => handleCreateProductClick()}
                  >
                      Create a Product
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[#3D3D3D] cursor-pointer"
                    onSelect={() => handleCreateVehicleClick()}
                  >
                      Create a Vehicle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-11 overflow-auto min-w-0 bg-white">
          <div className="w-2/5 pl-10 min-w-0 mt-5">
            <div className="bg-[#D9D9D9] h-52 rounded-xl mb-4 p-3 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[#747474]">Description</p>
                {isSaving && (
                  <p className="text-[#747474] text-xs">Saving...</p>
                )}
              </div>
              
              {isEditingDescription ? (
                <textarea
                  ref={descriptionTextareaRef}
                  value={descriptionText}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  className="w-full h-full bg-transparent text-black text-sm leading-relaxed resize-none border-none outline-none"
                  placeholder="Enter product description..."
                  style={{ minHeight: '120px' }}
                />
              ) : (
                <div 
                  onClick={handleDescriptionClick}
                  className="cursor-pointer h-full"
                >
                  {chosenProduct?.description ? (
                    <p className="text-black text-sm leading-relaxed">
                      {chosenProduct.description}
                    </p>
                  ) : (
                    <p className="text-[#747474] text-sm italic">
                      Click to add description...
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="text-black font-semibold">Members</p>
                <button 
                  className="cursor-pointer"
                  onClick={() => setIsAddMemberPopupOpen(true)}
                >
                  <p>Add</p>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-6 overflow-hidden">
                  {/* Show owner first */}
                  {chosenProduct?.owner && (
                    <PeopleCardList
                      key={`owner-${chosenProduct.owner.id}`}
                      isProduct
                      id={chosenProduct.owner.id?.toString() || ''}
                      image={'/Ellipse 5.svg'}
                      shortName={chosenProduct.owner.name ? chosenProduct.owner.name.split(' ').map(n => n[0]).join('.') : 'U.U'}
                    />
                  )}
                  {/* Then show invited members */}
                  {chosenProduct?.members?.filter(member => member.user).slice(0, 3).map((member) => (
                    <PeopleCardList
                      key={member.id}
                      isProduct
                      id={member.user?.id?.toString() || ''}
                      image={'/Ellipse 5.svg'}
                      shortName={member.user?.name ? member.user.name.split(' ').map(n => n[0]).join('.') : 'U.U'}
                    />
                  ))}
                </div>
                {chosenProduct?.members && chosenProduct.members.filter(member => member.user).length > 3 ? (
                  <div className="text-sm font-normal flex flex-col justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-black">
                      <span>
                        +{chosenProduct.members.filter(member => member.user).length - 3}
                      </span>
                    </div>
                    <button className="text-black text-[14px]/[2] font-normal cursor-pointer">
                      <p>More</p>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1 pr-10 bg-white min-w-0 ">
            <h3 className="text-xl font-semibold mb-4 text-black">
              Vehicle List
            </h3>
            <div className="flex flex-row flex-wrap gap-4">
              {vehiclesLoading ? (
                <Loader size="sm" text="Loading vehicles..." className="w-full justify-center py-8" />
              ) : vehiclesData?.vehicles && vehiclesData.vehicles.length > 0 ? (
                // Filter out vehicles that are waiting for approval - they should only show after approval
                vehiclesData.vehicles
                  .filter((vehicle: any) => vehicle.status !== 'WAITING_FOR_APPROVAL')
                  .map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <VehicleList
                      id={vehicle.id}
                      vehicleInfo={{
                        name: vehicle.name,
                        Description: vehicle.description || '',
                        type: vehicle.type || '',
                        vehicleType: (vehicle as any).vehicleType || ''
                      }}
                      composite={(vehicle as any).progress || 0}
                      size="tiny"
                      productId={vehicle.product.id}
                      createdAt={vehicle.createdAt}
                      creator={(vehicle as any).creator}
                      members={(vehicle as any).members}
                      status={vehicle.status}
                      onDelete={handleDeleteVehicle}
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No vehicles found for this product</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedVehicleId && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute flex items-center justify-center w-full h-full"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedVehicleId(null);
              }
            }}
          >
            {!selectedVehicleId ? null : vehicleLoading ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex items-center gap-2 text-gray-500">
                  <Spinner size="md" />
                  <span>Loading vehicle data...</span>
                </div>
              </div>
              ) : vehicleError ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-red-500">Error loading vehicle: {vehicleError instanceof Error ? vehicleError.message : 'Unknown error'}</div>
                </div>
              ) : selectedVehicleData?.vehicle ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <VehicleFull data={{
                    id: selectedVehicleData.vehicle.id,
                    productId: selectedVehicleData.vehicle.productId,
                    composite: (selectedVehicleData.vehicle as any).progress || 0,
                    vehicleInfo: {
                      name: selectedVehicleData.vehicle.name,
                      owner: (selectedVehicleData.vehicle as any).product?.owner?.name || (selectedVehicleData.vehicle as any).createdBy?.toString() || 'Unknown',
                      dateCreated: selectedVehicleData.vehicle.createdAt ? new Date(selectedVehicleData.vehicle.createdAt) : new Date(),
                      estimatedCompletion: (selectedVehicleData.vehicle as any).estimatedCompletion ? new Date((selectedVehicleData.vehicle as any).estimatedCompletion) : new Date(),
                      Description: selectedVehicleData.vehicle.description || (selectedVehicleData.vehicle as any).shortDescription || 'No description',
                      type: selectedVehicleData.vehicle.type || (selectedVehicleData.vehicle as any).vehicleType || 'Unknown',
                      vehicleType: (selectedVehicleData.vehicle as any).vehicleType || selectedVehicleData.vehicle.type || 'Unknown'
                    },
                    efficiencyCharts: {
                      speed: (selectedVehicleData.vehicle as any).progress || 0,
                      efficiency: (selectedVehicleData.vehicle as any).progress || 0,
                      quality: (selectedVehicleData.vehicle as any).progress || 0
                    },
                    size: 'medium' as const,
                    members: (selectedVehicleData.vehicle as any).members || [],
                    workers: [],
                    relatedProducts: [],
                    teamMembers: (selectedVehicleData.vehicle as any).teamMembers || []
                  }} />
                </div>
              ) : selectedVehicleData && !selectedVehicleData.success ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-gray-500">Vehicle not found</div>
                </div>
              ) : selectedVehicleId && !vehicleLoading && !selectedVehicleData ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-gray-500">Vehicle not found</div>
                </div>
              ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white mt-2 w-[calc(100vw-40px)] p-2 h-[250px] max-w-[90vw] rounded-2xl shadow-2xl">
        <div className="flex flex-row items-start h-full pt-6 px-4 gap-1 bg-white overflow-auto">
          {products?.map((product) => {
            return (
              <ProductCard
                isActive={product.id === chosenProductId}
                name={
                  product.name.length > 14
                    ? product.name.slice(0, 14) + '...'
                    : product.name
                }
                key={product.id}
                onClick={() => onProdCardClick(product.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Add Member Popup */}
      <AddMemberPopup
        isOpen={isAddMemberPopupOpen}
        onClose={() => setIsAddMemberPopupOpen(false)}
        onInvite={handleInviteMembers}
        title="Invite team members"
      />
    </div>
  );
};

export default ProductModalContent;
