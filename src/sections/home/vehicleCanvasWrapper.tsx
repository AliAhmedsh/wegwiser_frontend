import CreateNote from '@/entities/note/forms/CreateNote';
import Note from '@/entities/note/Note';
import { useNoteStore } from '@/entities/note/store';
import { useProductStore } from '@/entities/product/store';
import { VehicleListProps } from '@/entities/vehicle/types';
import VehicleFull from '@/entities/vehicle/vehicleFull';
import VehicleList from '@/entities/vehicle/vehicleList';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from './canvasStore';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { useVehicle, useVehiclesByProduct, vehicleKeys } from '@/lib/api/hooks/useVehicle';
import Spinner from '@/shared/ui/Spinner';
import { useQueryClient } from '@tanstack/react-query';
import { getCookie } from '@/lib/config/api';
import { useSliderStore } from '@/store/sliderStore';
import { ProposedVehicle } from '@/store/proposedVehiclesStore';
import { useRouter } from 'next/navigation';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { useProposedVehiclesQuery } from '@/entities/product/model/query';
import { vehicleService } from '@/lib/api/services/vehicleService';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { showToast } from '@/lib/utils/toast';

const VehicleCanvasWrapper = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { chosenProduct } = useProductStore();
  const { offset, setOffset } = useCanvasStore();
  const { selectedVehicleId, setSelectedVehicleId } = useSelectedVehicleStore();
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const queryClient = useQueryClient();
  const fetchNotes = useNoteStore((state) => state.fetchNotes);
  const isShowEngineering = useSliderStore((state) => state.isShowEngineering);
  const router = useRouter();
  const { resetAll: resetVehicleCreation, setVehicleData, setDate, setFeatureTags, setProductRelationship, setInvolvedTeam, setSuccessMetrics, setPriority, setProposedVehicleId } = useCreationVehicleStore();

  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError } = useVehiclesByProduct(chosenProduct?.id || 0);
  const { data: selectedVehicleData, isLoading: vehicleLoading, error: vehicleError } = useVehicle(selectedVehicleId || 0);
  
  const { data: proposedVehiclesData, isLoading: proposedVehiclesLoading } = useProposedVehiclesQuery(
    chosenProduct?.id || 0,
    !!chosenProduct?.id
  );

  const vehicles = vehiclesData?.vehicles || [];
  const proposedVehicles = proposedVehiclesData?.data || [];
  
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log('Frontend - Vehicles with doneFor:', vehicles.map(v => ({
        id: v.id,
        name: v.name,
        doneFor: v.doneFor,
        progress: v.progress
      })));
    }
  }, [vehicles]);

  useEffect(() => {
    setSelectedVehicleId(null);
  }, [chosenProduct?.id, setSelectedVehicleId]);

  useEffect(() => {
    if (!vehiclesLoading && !vehiclesError && vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
      setShowVehicleDetails(false);
    }
  }, [vehiclesLoading, vehiclesError, vehicles, selectedVehicleId, setShowVehicleDetails, setSelectedVehicleId]);

  useEffect(() => {
    if (!selectedVehicleId || !chosenProduct?.id) return;

    const token = getCookie('access_token');
    if (!token) return;

    queryClient.invalidateQueries({ queryKey: ['productTasks', chosenProduct.id] });
    queryClient.invalidateQueries({ queryKey: ['tickets', chosenProduct.id] });
    queryClient.invalidateQueries({ queryKey: ['dependencies', chosenProduct.id] });
    queryClient.invalidateQueries({ queryKey: ['designTasks'] });
    queryClient.invalidateQueries({ queryKey: ['designAssets'] });
    queryClient.invalidateQueries({ queryKey: ['usageInsights', chosenProduct.id] });
    queryClient.invalidateQueries({ queryKey: ['vehicles', chosenProduct.id] });
    
    fetchNotes(chosenProduct.id, selectedVehicleId);
  }, [selectedVehicleId, chosenProduct?.id]);

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


  const { isCreate, isShow } = useNoteStore();
  const notes = useNoteStore((state) => state.notes);

  const [entity, setEntity] = useState<number[]>([]);
  const layer = entity.length + 1;

  const isDraggingCanvas = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY > 0 && entity.length > 0) {
        e.preventDefault();
        setEntity((prev) => prev.slice(0, -1));
        setShowVehicleDetails(false);
      }
    },
    [entity]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingCanvas.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setOffset({ x: offset.x + dx, y: offset.y + dy });
    },
    [offset, setOffset]
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, handleMouseMove]);

  const handleClickEntity = (index: number) => {
  
    setSelectedVehicleId(index);
    setShowVehicleDetails(false);
  };

  const handleDoubleClickEntity = (index: number) => {
   
    const newEntity = [...entity, index];
    setEntity(newEntity);
    setSelectedVehicleId(index);
    setShowVehicleDetails(true);
  };

  const handleDraftVehicleClick = async (vehicleId: number) => {
    if (!chosenProduct?.id) {
      console.error('Missing productId');
      return;
    }

    try {
      resetVehicleCreation();
      
      // Fetch full vehicle data
      const vehicleResponse = await vehicleService.getVehicle(vehicleId);
      const vehicle = vehicleResponse?.vehicle;
      
      if (!vehicle) {
        console.error('Vehicle not found');
        return;
      }

      // Pre-fill vehicle data
      setVehicleData({
        name: vehicle.name || '',
        description: vehicle.description || '',
      });

      if (vehicle.productRelationship) {
        setProductRelationship(vehicle.productRelationship);
      }

      if (vehicle.startDate) {
        const startDate = new Date(vehicle.startDate);
        if (!isNaN(startDate.getTime())) {
          setDate(startDate);
        }
      }

      if (vehicle.featureTags) {
        setFeatureTags(vehicle.featureTags);
      }

      if (vehicle.priority) {
        const priorityLower = vehicle.priority.toLowerCase();
        setPriority(priorityLower === 'standard' ? 'standard' : priorityLower === 'asap' ? 'asap' : 'standard');
      }

      if (vehicle.involvedTeam) {
        setInvolvedTeam(vehicle.involvedTeam);
      }

      if (vehicle.successMetrics) {
        setSuccessMetrics(vehicle.successMetrics);
      }

      // Store vehicle ID for editing
      setProposedVehicleId(vehicleId);

      router.push('/vehicle-creation');
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  const handleProposedVehicleClick = async (proposedVehicle: ProposedVehicle & { id?: number }) => {
    if (!chosenProduct?.id) {
      console.error('Missing productId');
      return;
    }
   
    resetVehicleCreation();
    
    // Store the proposed vehicle ID from step1-basics
    if (proposedVehicle.id) {
      console.log('[handleProposedVehicleClick] Storing proposed vehicle ID:', proposedVehicle.id);
      setProposedVehicleId(proposedVehicle.id);
    }
    
    setVehicleData({
      name: proposedVehicle.vehicle_name,
      description: proposedVehicle.description || '',
    });
   
    if (proposedVehicle.product_correlation) {
      setProductRelationship(proposedVehicle.product_correlation);
    }
    
    if (proposedVehicle.start_date) {
      const startDate = new Date(proposedVehicle.start_date);
      if (!isNaN(startDate.getTime())) {
        setDate(startDate);
      }
    }

    if (proposedVehicle.feature_list_preview && proposedVehicle.feature_list_preview.length > 0) {
      const tagsString = proposedVehicle.feature_list_preview.join(', ');
      setFeatureTags(tagsString);
    }
   
    if (proposedVehicle.priority) {
      const priorityLower = proposedVehicle.priority.toLowerCase();
      setPriority(priorityLower === 'standard' ? 'standard' : priorityLower === 'asap' ? 'asap' : 'standard');
    }
    
    if (proposedVehicle.fleet) {
      setInvolvedTeam(proposedVehicle.fleet);
    }

    if (proposedVehicle.success_metrics && proposedVehicle.success_metrics.length > 0) {
      const metricsString = proposedVehicle.success_metrics.join(', ');
      setSuccessMetrics(metricsString);
    }

    router.push('/vehicle-creation');
  };

  return (
    <div ref={wrapperRef} className="w-[100vw] h-[100vh] relative">
      <div
        className="absolute top-0 left-0 border border-black"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: 'top left',
        }}
      >
        <div className="w-[100vw] h-[100vh] relative">
          <AnimatePresence>
            {showVehicleDetails && selectedVehicleId && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ scale: 0 }}
                className="absolute flex items-center justify-center w-full h-full"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowVehicleDetails(false);
                    setEntity(prev => prev.slice(0, -1));
                  }
                }}
              >
                {!selectedVehicleId ? null : vehicleLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <Spinner size="md" />
                  </div>
                ) : vehicleError ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-red-500">Error loading vehicle: {vehicleError instanceof Error ? vehicleError.message : 'Unknown error'}</div>
                  </div>
                ) : selectedVehicleData?.success && selectedVehicleData?.vehicle ? (
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
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-gray-500">Vehicle not found</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {layer === 1 && !isCreate && !isShow && (
            <div className="gap-y-5 relative h-full w-full overflow-y-scroll overflow-x-hidden pb-40 pt-5 custom-scrollbar">

              {vehiclesLoading ? null : vehiclesError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-500">Error loading vehicles: {vehiclesError.message}</div>
                </div>
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => {
                  const doneFor = vehicle.doneFor || 0;
                  const completionPercent = Math.min(Math.max(doneFor, 0), 100);
                  
                  const cardWidth = 250;
                  const engineeringPanelWidth = isShowEngineering ? 800 : 0;
                  const rightPadding = 35;
                  const leftPadding = 35;
                  
                  const cardMarginLeft = `calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px))`;
                  
                  const blueLineWidth = `max(50px, calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px)))`;
                  
                  const greyLineLeft = `calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px) + ${cardWidth}px)`;
                  const greyLineWidth = `calc(100vw - ${engineeringPanelWidth}px - (${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px) + ${cardWidth}px))`;
                  
                  return (
                  <motion.div
                    key={vehicle.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="relative w-full mb-5"
                    style={{ 
                      minHeight: '120px',  
                      overflowY: 'visible',
                      marginTop: index === 0 ? '60px' : '20px'
                    }}
                  >
                    <div
                      className="absolute top-1/2 z-0 border-[2px] border-[#BAC6D6]"
                      style={{ 
                        pointerEvents: 'none',
                        left: greyLineLeft,
                        width: greyLineWidth,
                        height: '4px',
                        transform: 'translateY(-50%)'
                      }}
                    />
                    <div
                      className="absolute top-1/2 z-0 border-[2px] border-blue-300 bg-blue-100"
                        style={{
                          pointerEvents: 'none',
                          left: '0px',
                          width: blueLineWidth,
                          height: '4px',
                          transform: 'translateY(-50%)'
                        }}
                    />

                    <div
                      className="relative z-10 select-none inline-block"
                      style={{ 
                        marginLeft: cardMarginLeft,
                        maxWidth: `${cardWidth}px`,
                        transition: 'margin-left 0.3s ease-out'
                      }}
                    >
                      <div
                        className="inline-block cursor-pointer select-none"
                        onClick={() => {
                          if (vehicle.status === 'WAITING_FOR_APPROVAL') {
                            router.push(`/vehicle-approval?vehicleId=${vehicle.id}&productId=${vehicle.productId}&autoOpenSimulation=true`);
                          } else if (vehicle.status === 'DRAFT') {
                            handleDraftVehicleClick(vehicle.id);
                          } else {
                            handleClickEntity(vehicle.id);
                          }
                        }}
                        onDoubleClick={() => {
                          if (vehicle.status !== 'DRAFT') {
                            handleDoubleClickEntity(vehicle.id);
                          }
                        }}
                      >
                        <VehicleList
                          id={vehicle.id}
                          productId={vehicle.productId}
                          vehicleInfo={{
                            name: vehicle.name,
                            Description: vehicle.description || '',
                            type: vehicle.type || '',
                            vehicleType: (vehicle as any).vehicleType || ''
                          }}
                          composite={(vehicle as any).progress || 0}
                          size="medium"
                          createdAt={vehicle.createdAt}
                          creator={(vehicle as any).creator}
                          members={(vehicle as any).members}
                          isSelected={selectedVehicleId === vehicle.id}
                          status={vehicle.status}
                          onDelete={handleDeleteVehicle}
                        />
                      </div>
                    </div>
                  </motion.div>
                  );
                })
              ) : null}
              
              {proposedVehicles && proposedVehicles.length > 0 && (
                <>
                  {proposedVehicles.map((proposedVehicle, index) => {
                    const cardWidth = 250;
                    const engineeringPanelWidth = isShowEngineering ? 800 : 0;
                    const rightPadding = 35;
                    const leftPadding = 35;
                    const completionPercent = 0;
                    
                    const cardMarginLeft = `calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px))`;
                    const blueLineWidth = `max(50px, calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px)))`;
                    const greyLineLeft = `calc(${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px) + ${cardWidth}px)`;
                    const greyLineWidth = `calc(100vw - ${engineeringPanelWidth}px - (${leftPadding}px + (${completionPercent} / 100) * (100vw - ${leftPadding}px - ${engineeringPanelWidth}px - ${rightPadding}px - ${cardWidth}px) + ${cardWidth}px))`;
                    
                    const hasExistingVehicles = vehicles.length > 0;
                    const topMargin = index === 0 
                      ? (hasExistingVehicles ? '40px' : '60px')
                      : '20px';
                    
                    return (
                      <motion.div
                        key={`proposed-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="relative w-full mb-5"
                        style={{ 
                          minHeight: '120px',
                          overflowY: 'visible',
                          marginTop: topMargin
                        }}
                      >
                        <div
                          className="absolute top-1/2 z-0 border-[2px] border-[#BAC6D6]"
                          style={{ 
                            pointerEvents: 'none',
                            left: greyLineLeft,
                            width: greyLineWidth,
                            height: '4px',
                            transform: 'translateY(-50%)'
                          }}
                        />
                        <div
                          className="absolute top-1/2 z-0 border-[2px] border-blue-300 bg-blue-100"
                          style={{
                            pointerEvents: 'none',
                            left: '0px',
                            width: blueLineWidth,
                            height: '4px',
                            transform: 'translateY(-50%)'
                          }}
                        />

                        <div
                          className="relative z-10 select-none inline-block"
                          style={{ 
                            marginLeft: cardMarginLeft,
                            maxWidth: `${cardWidth}px`,
                            transition: 'margin-left 0.3s ease-out'
                          }}
                        >
                          <div 
                            className="inline-block select-none cursor-pointer"
                            onClick={() => handleProposedVehicleClick(proposedVehicle)}
                          >
                            <VehicleList
                              id={0}
                              productId={chosenProduct?.id || 0}
                              vehicleInfo={{
                                name: proposedVehicle.vehicle_name,
                                Description: proposedVehicle.description || '',
                                type: '',
                                vehicleType: ''
                              }}
                              composite={0}
                              size="medium"
                              createdAt={new Date().toISOString()}
                              creator={null}
                              members={[]}
                              isSelected={false}
                              isProposed={true}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {isCreate && (
            <div data-draggable className="absolute z-50">
              <CreateNote />
            </div>
          )}
          {notes &&
            isShow &&
            notes.map((note, index) => <Note key={index} {...note} />)}
        </div>
      </div>
    </div>
  );
};

export default VehicleCanvasWrapper;
