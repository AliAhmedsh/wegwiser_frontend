'use client';

import Image from 'next/image';
import { useCreationVehicleStore } from '../../store';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { BLOCK_WIDTH_WV } from '../constants';
import { useState, useEffect } from 'react';
import { VehicleListProps } from '@/entities/vehicle/types';
import useVehicleStore from '@/entities/vehicle/api/mock/vehicleStore';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { useProductStore } from '@/entities/product/store';
import { useVehicleReview, useFinalizeVehicleMutation } from '@/lib/api/hooks/useVehicle';
import { useVehiclePersistMutation, useEvaluateVehicleMutation, useImpactAnalyzeVehicleMutation } from '@/lib/api/hooks/useFastApi';
import { vehicleService } from '@/lib/api/services/vehicleService';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { Open_Sans } from 'next/font/google';
import TipButton from './ui/tipButton';
import VehicleSimulation from '@/entities/vehicle/vehicleSimulating';
import SimulationCreatedModal from '../../ui/SimulationCreatedModal';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import { showToast } from '@/lib/utils/toast';

const openSans = Open_Sans({
  weight: ['600'],
  subsets: ['cyrillic'],
});

const openSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

export default function ReviewInformation() {
  const { decrimentStep, featureTags, vehicleMembers, vehicleData, date, vehicleId, setVehicleId } =
    useCreationVehicleStore();
  const { addVehicleToUsers } = useUserStore();
  const { addVehicle, vehicles } = useVehicleStore();
  const { chosenProduct } = useProductStore();
  const [showDashboard, setShowDashboard] = useState(false);
  const [simulationWasCreated, setSimulationWasCreated] = useState(false);
  const { simulationCreated, setSimulationCreated } = useModalWindowStore();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating vehicle simulation...');
  const [step3VehicleData, setStep3VehicleData] = useState<any>(null);

  const getCorrectVehicleId = () => {
    const step3VehicleId = localStorage.getItem('step3_vehicle_id');
    if (step3VehicleId) {
      const parsedId = parseInt(step3VehicleId, 10);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }
    return vehicleId;
  };
  
  const [currentVehicleId, setCurrentVehicleId] = useState<number | null>(getCorrectVehicleId());

  const { data: reviewData, isLoading: isLoadingReview } = useVehicleReview(currentVehicleId || 0);
  const finalizeVehicleMutation = useFinalizeVehicleMutation();
  const evaluateVehicleMutation = useEvaluateVehicleMutation();
  const impactAnalyzeMutation = useImpactAnalyzeVehicleMutation();

  const [finalizedVehicleData, setFinalizedVehicleData] = useState<any>(null);
  const [impactAnalysisData, setImpactAnalysisData] = useState<any>(null);

  useEffect(() => {
    try {
      const step3ResultStr = localStorage.getItem('step3_result');
      if (step3ResultStr) {
        const step3Result = JSON.parse(step3ResultStr);
        
        let vehicleDataFromStep3 = null;
        if (step3Result?.vehicles && Array.isArray(step3Result.vehicles) && step3Result.vehicles.length > 0) {
          vehicleDataFromStep3 = step3Result.vehicles[0];
        } else if (step3Result?.vehicle) {
          vehicleDataFromStep3 = step3Result.vehicle;
        }
        
        if (vehicleDataFromStep3) {
          setStep3VehicleData(vehicleDataFromStep3);
        }
      }
    } catch (error) {
      console.error('[ReviewInformation] Error loading step3_result:', error);
    }
  }, []);

  const onAdd = async () => {
    const vehicleIdToUse = currentVehicleId || vehicleId;
    if (!vehicleIdToUse) {
      console.error('[ReviewInformation] No vehicle ID available for finalize');
      return;
    }

    setIsFinalizing(true);
    setLoadingMessage('Creating vehicle simulation...');
    
    try {
      setLoadingMessage('Finalizing vehicle configuration...');
      const finalizeResult = await finalizeVehicleMutation.mutateAsync(vehicleIdToUse);
      
      const finalizedVehicleId = finalizeResult?.vehicle?.id;
      
      if (!finalizedVehicleId) {
        console.error('[ReviewInformation] Vehicle ID not found in finalize result. Full result:', finalizeResult);
        throw new Error('Vehicle ID not found in finalize result');
      }

      setCurrentVehicleId(finalizedVehicleId);
      setVehicleId(finalizedVehicleId);

      const vehicleIdForAnalysis = Number(finalizedVehicleId);
      
      try {
        setLoadingMessage('Analyzing vehicle impact...');
        await fastApiService.analyzeVehicleImpact([vehicleIdForAnalysis]);
      } catch (impactError: any) {
        console.error('[ReviewInformation] Error calling impact analyze API (non-blocking):', impactError);
      }

      try {
        setLoadingMessage('Fetching vehicle data with impact report...');
        const vehiclesData = await fastApiService.getVehiclesByIds([vehicleIdForAnalysis]);
        
        if (vehiclesData && Array.isArray(vehiclesData) && vehiclesData.length > 0) {
          const vehicleWithImpact = vehiclesData[0];
          setFinalizedVehicleData(vehicleWithImpact);
          
          if (vehicleWithImpact.impact_report) {
            setImpactAnalysisData(vehicleWithImpact.impact_report);
          }
        } else {
          setFinalizedVehicleData(finalizeResult.vehicle);
        }
      } catch (fetchError) {
        console.error('[ReviewInformation] Error fetching vehicle data (non-blocking):', fetchError);
        setFinalizedVehicleData(finalizeResult.vehicle);
      }

      setLoadingMessage('Setting up vehicle workspace...');
      addVehicle(vehicle);
      addVehicleToUsers(
        {
          vehicleID: vehicles.length.toString(),
          vehicleName: vehicleData.name,
        },
        Array.isArray(vehicleMembers) ? vehicleMembers.map((u) => u.id) : []
      );
      
      setLoadingMessage('Vehicle simulation created successfully!');
      
      setSimulationWasCreated(true);
      setSimulationCreated(true);
      setShowDashboard(true);
    } catch (error) {
      console.error('[ReviewInformation] Error in onAdd:', error);
      setLoadingMessage('Failed to create vehicle simulation');
      showToast.error(error instanceof Error ? error.message : 'Failed to create vehicle simulation');
    } finally {
      setIsFinalizing(false);
    }
  };

  useEffect(() => {
    if (simulationWasCreated && !showDashboard) {
      if (!simulationCreated) {
        setShowDashboard(true);
        return;
      }
      
      const timer = setTimeout(() => {
      setShowDashboard(true);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [simulationCreated, simulationWasCreated, showDashboard]);

  const [vehicle] = useState<VehicleListProps>({
    id: vehicles.length - 1,
    productId: chosenProduct?.id || 0,
    composite: 10,
    doneFor: 0,
    size: 'medium',
    efficiencyCharts: {
      quality: 0,
      speed: 33,
      efficiency: 66,
    },
    workers: [],
    vehicleInfo: {
      name: vehicleData.name,
      Description: vehicleData.description,
      dateCreated: new Date(),
      estimatedCompletion: date || new Date(),
      owner: Array.isArray(vehicleMembers) && vehicleMembers.length > 0 && vehicleMembers[0]?.name ? vehicleMembers[0].name : 'John D.',
    },
    relatedProducts: [''],
  });

  return (
    <>
      {simulationCreated && <SimulationCreatedModal />}
      {(showDashboard || simulationWasCreated) && (
        <div className="fixed inset-0 bg-[#EAEDF2] flex items-center justify-center z-50 p-8">
          <div className="flex flex-col items-center justify-center w-full h-full">
            {(() => {
              const vehicleIdForSimulation = currentVehicleId || finalizedVehicleData?.id || undefined;
              
              return (
            <VehicleSimulation 
              vehicleData={{
                name: finalizedVehicleData?.name || vehicleData.name,
                description: finalizedVehicleData?.description || vehicleData.description,
                owner: finalizedVehicleData?.creator_name || 
                       finalizedVehicleData?.creator?.name || 
                       finalizedVehicleData?.members?.find((m: any) => m.role === 'OWNER')?.user?.name || 
                       finalizedVehicleData?.members?.[0]?.user?.name || 
                       vehicleMembers[0]?.name || 'John D.',
                productName: finalizedVehicleData?.product?.name || chosenProduct?.name,
                    members: (finalizedVehicleData?.members && Array.isArray(finalizedVehicleData.members) 
                      ? finalizedVehicleData.members.map((m: any) => ({
                          id: m.user?.id || m.id,
                          name: m.user?.name || m.name,
                          role: m.role || m.position,
                          position: m.role || m.position,
                          avatar: m.user?.avatar || m.avatar || '/Ellipse 5.svg',
                          email: m.user?.email || m.email
                        }))
                      : (Array.isArray(vehicleMembers) ? vehicleMembers : [])),
                featureTags: featureTags,
                date: date || undefined,
                    id: vehicleIdForSimulation
              }}
              impactAnalysisData={impactAnalysisData}
            />
              );
            })()}
          </div>
        </div>
      )}
      <div className="bg-[#EAEDF2] px-13 h-[100vh] font-poppins flex flex-col  items-center">
        <div className="flex justify-center mt-5.5">
          <Image
            alt="step visualisation"
            src={'/creation-vehicle-steps/fiveth-step.svg'}
            width={430}
            height={25}
          />
        </div>
      <div
        className="bg-white max-h-[80vh] rounded-[36px] flex flex-col pl-20 mt-9 pb-6"
        style={{
          boxShadow: '2px 2px 2px 0px #A7B1C499',
          height: '100%',
          width: BLOCK_WIDTH_WV,
        }}
      >
        <h2 className="font-bold text-[16px] mt-7.5">
          5 Review & Confirmation
        </h2>

        <div className="overflow-y-auto flex-1 mt-12.5 pr-2 custom-scrollbar">
          <div className="flex">
            <div className={`w-[200px] ${openSans.className}`}>
              Vehicle Name
            </div>
            <div className={`ml-15 text-[14px] ${openSans400.className} `}>
              {step3VehicleData?.vehicle_name || step3VehicleData?.name || reviewData?.success ? reviewData.review.vehicleName : vehicleData.name || 'Vehicle Name'}
            </div>
          </div>

          <div className="flex mt-7.5">
            <div className={`w-[200px] ${openSans.className}`}>
              Feature List preview
            </div>
            <div className={`ml-15 text-[14px] ${openSans400.className}`}>
              {step3VehicleData?.feature_list_preview && Array.isArray(step3VehicleData.feature_list_preview) ? (
                step3VehicleData.feature_list_preview.map((feature: string, index: number) => (
                  <span key={index}>
                    {feature}
                    {index < step3VehicleData.feature_list_preview.length - 1 ? ', ' : ''}
                  </span>
                ))
              ) : reviewData?.success && reviewData.review.featureList && reviewData.review.featureList.length > 0 ? (
                reviewData.review.featureList.map((tag: string, index: number) => (
                  <span key={index}>{tag}</span>
                ))
              ) : featureTags.trim() ? (
                featureTags
                  .split(' ')
                  .map((tag, index) => <span key={index}>{tag}</span>)
              ) : (
                <span>
                  FeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelist
                  FeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelistFeaturelist
                  FeaturelistFeaturelistFeaturelist
                </span>
              )}
            </div>
          </div>

          <div className="flex mt-10">
            <div className={`w-[200px] ${openSans.className}`}>
              Metrics overview
            </div>
            <div
              className={`min-h-[75px] text-[14px] ml-15 ${openSans400.className}`}
            >
              {step3VehicleData?.success_metrics && Array.isArray(step3VehicleData.success_metrics) ? (
                <ul className="list-disc list-inside">
                  {step3VehicleData.success_metrics.map((metric: string, index: number) => (
                    <li key={index}>{metric}</li>
                  ))}
                </ul>
              ) : reviewData?.success ? (reviewData.review.successMetrics || reviewData.review.metrics || 'Metrics') : 'Metrics'}
            </div>
          </div>

          <div className="flex mt-10">
            <div className={`w-[200px] ${openSans.className}`}>
              Team Members added
            </div>
            <div className={` ${openSans400.className} ml-15 text-[14px] flex items-center`}>
              <div className="relative flex items-center">
                {step3VehicleData?.suggested_members && Array.isArray(step3VehicleData.suggested_members) && step3VehicleData.suggested_members.length > 0 ? (
                  <>
                    {step3VehicleData.suggested_members.slice(0, 3).map((member: any, index: number) => (
                      <div
                        key={index}
                        className={`size-[34px] rounded-full overflow-hidden border-2 border-white ${
                          index > 0 ? '-ml-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 10 - index 
                        }}
                        title={member.role || 'Team Member'}
                      >
                        <Image
                          src="/Ellipse 5.svg"
                          alt={`${member.role || 'Team Member'} image`}
                          width={34}
                          height={34}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {step3VehicleData.suggested_members.length > 3 && (
                      <div 
                        className="size-[34px] rounded-full border-2 border-white -ml-2 flex items-center justify-center text-xs font-medium text-gray-600"
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 1 
                        }}
                      >
                        +{step3VehicleData.suggested_members.length - 3}
                      </div>
                    )}
                  </>
                ) : reviewData?.success && reviewData.review.teamMembersDetailed && reviewData.review.teamMembersDetailed.length > 0 ? (
                  <>
                    {reviewData.review.teamMembersDetailed.slice(0, 3).map((member: any, index: number) => (
                        <div
                        key={member.id}
                        className={`size-[34px] rounded-full overflow-hidden border-2 border-white ${
                            index > 0 ? '-ml-2' : ''
                          }`}
                          style={{ 
                            backgroundColor: '#f0f0f0',
                            zIndex: 10 - index 
                          }}
                        >
                          <Image
                          src="/Ellipse 5.svg"
                          alt={`${member.name} image`}
                            width={34}
                            height={34}
                            className="w-full h-full object-cover"
                          />
                        </div>
                    ))}
                    {reviewData.review.teamMembersDetailed.length > 3 && (
                      <div 
                        className="size-[34px] rounded-full border-2 border-white -ml-2 flex items-center justify-center text-xs font-medium text-gray-600"
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 1 
                        }}
                      >
                        +{reviewData.review.teamMembersDetailed.length - 3}
                      </div>
                    )}
                  </>
                ) : reviewData?.success && reviewData.review.teamMembers && reviewData.review.teamMembers.length > 0 ? (
                  <>
                    {reviewData.review.teamMembers.slice(0, 3).map((memberName: string, index: number) => (
                      <div
                        key={index}
                        className={`size-[34px] rounded-full overflow-hidden border-2 border-white ${
                          index > 0 ? '-ml-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 10 - index 
                        }}
                      >
                        <Image
                          src="/Ellipse 5.svg"
                          alt={`${memberName} image`}
                          width={34}
                          height={34}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {reviewData.review.teamMembers.length > 3 && (
                      <div 
                        className="size-[34px] rounded-full border-2 border-white -ml-2 flex items-center justify-center text-xs font-medium text-gray-600"
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 1 
                        }}
                      >
                        +{reviewData.review.teamMembers.length - 3}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {Array.isArray(vehicleMembers) && vehicleMembers.length > 0 && vehicleMembers.slice(0, 3).map((item, index) => (
                      item && (
                        <div
                          key={item.id || index}
                          className={`size-[34px] rounded-full overflow-hidden border-2 border-white ${
                            index > 0 ? '-ml-2' : ''
                          }`}
                          style={{ 
                            backgroundColor: '#f0f0f0',
                            zIndex: 10 - index 
                          }}
                        >
                          <Image
                            src={item.image || '/Ellipse 5.svg'}
                            alt="User image"
                            width={34}
                            height={34}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    ))}
                    {Array.isArray(vehicleMembers) && vehicleMembers.length > 3 && (
                      <div 
                        className="size-[34px] rounded-full border-2 border-white -ml-2 flex items-center justify-center text-xs font-medium text-gray-600"
                        style={{ 
                          backgroundColor: '#f0f0f0',
                          zIndex: 1 
                        }}
                      >
                        +{vehicleMembers.length - 3}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pr-10">
          <div
            onClick={() => decrimentStep()}
            className="hover:underline cursor-pointer font-semibold hover:scale-90 active:scale-80 transition-all"
          >
            Back
          </div>
          
          <div className="w-[280px] relative text-[14px]">
            <TipButton />
            <ConfirmBtn
              onClick={() => {
                onAdd();
              }}
              className="h-[45px] w-[215px]"
              text={isFinalizing ? loadingMessage : "Create Vehicle Simulation"}
              isInActive={isFinalizing}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
