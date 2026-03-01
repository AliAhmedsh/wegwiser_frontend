'use client';

import Image from 'next/image';
import { BLOCK_HEIGHT_VH, BLOCK_WIDTH_WV } from '../constants';
import { Inter } from 'next/font/google';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import BasicInfoForm from './forms/BasicInfoForm';

import { useCreationVehicleStore } from '../../store';
import { useProductStore } from '@/entities/product/store';
import { useSaveBasicInfoMutation } from '@/lib/api/hooks/useVehicle';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { showToast } from '@/lib/utils/toast';
import { useState } from 'react';

const Inter700 = Inter({
  weight: ['700'],
  subsets: ['cyrillic'],
});

export default function BasicInfo() {
  const { incrementStep, vehicleData, setVehicleId, setAssumptionsText, proposedVehicleId } = useCreationVehicleStore();
  const { chosenProduct } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveBasicInfoMutation = useSaveBasicInfoMutation();
  // const vehicleStep1Mutation = useVehicleStep1Mutation();
  // const vehicleStep2Mutation = useVehicleStep2Mutation();
  // const workflowSubmitMutation = useWorkflowSubmitMutation();

  const handleContinue = async () => {
    if (!chosenProduct?.id || !vehicleData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('user_id');
      const prdId = localStorage.getItem('prd_id');

      if (!userId || !prdId) {
        showToast.error('User ID or PRD ID not found. Please try again.');
        setIsSubmitting(false);
        return;
      }


      const result = await saveBasicInfoMutation.mutateAsync({
        productId: chosenProduct.id,
        vehicleName: vehicleData.name,
        shortDescription: vehicleData.description || undefined,
      });

      console.log('[BasicInfo] Vehicle creation result:', result);
      const createdVehicleId = result?.vehicle?.id;
      
      if (!createdVehicleId) {
        console.error('[BasicInfo] Vehicle ID not found in result:', result);
        showToast.error('Failed to create vehicle. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('[BasicInfo] Created vehicle ID:', createdVehicleId);
      setVehicleId(createdVehicleId);

      // Use proposedVehicleId from step1-basics if available, otherwise use newly created vehicle ID
      const vehicleIdForStep2 = proposedVehicleId || createdVehicleId;
      console.log('[BasicInfo] Using vehicle_id for step2:', vehicleIdForStep2, '(proposedVehicleId:', proposedVehicleId, ', createdVehicleId:', createdVehicleId, ')');

      try {
        console.log('[BasicInfo] Calling step2-assumptions with vehicle_id:', vehicleIdForStep2);
        const step2Response = await fastApiService.vehicleStep2Assumptions(userId, vehicleIdForStep2);
        if (step2Response?.assumptions_text) {
          setAssumptionsText(step2Response.assumptions_text);
        }
      } catch (step2Error: any) {
        console.error('Error calling Step 2 assumptions:', step2Error);
      }

      incrementStep();
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#EAEDF2] h-[92vh] font-poppins">
      <div className="flex justify-center">
        <Image
          alt="step visualisation"
          src={'/creation-vehicle-steps/first-step.svg'}
          width={500}
          height={50}
        />
      </div>
      <div className="flex px-13 justify-center h-[80vh] ">
        <div
          className={`bg-white rounded-4xl h-[550px] pt-10 pr-35 mt-10 flex flex-col`}
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C499',
            height: BLOCK_HEIGHT_VH,
            width: BLOCK_WIDTH_WV,
          }}
        >
          <h2
            className={`font-bold text-[16px] ml-[19.3%] ${Inter700.className}`}
          >
            Basic Info
          </h2>
          <div className="mt-10">
            <BasicInfoForm />
          </div>
          <div className="flex justify-end mt-auto pl-10 pb-6 mr-[-120px]">
            <div className="w-[280px]">
              <ConfirmBtn
                className="h-[45px]"
                text={isSubmitting ? "Saving..." : "Continue"}
                onClick={handleContinue}
                isInActive={isSubmitting || !vehicleData.name.trim() || !chosenProduct?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
