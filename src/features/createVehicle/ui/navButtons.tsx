import { useState } from 'react';
import { useCreationVehicleStore } from '../store';
import { useSaveProductRelationshipMutation, useSaveVehicleOutlineMutation } from '@/lib/api/hooks/useVehicle';
import { useVehicleStep3Mutation } from '@/lib/api/hooks/useFastApi';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { showToast } from '@/lib/utils/toast';
import { useProductStore } from '@/entities/product/store';
import ConfirmBtn from '@/shared/ui/confirmBtn';

interface NavButtonsProps {
  onContinue?: () => void;
  step?: number;
}

export default function NavButtons({ onContinue, step }: NavButtonsProps) {
  const { decrimentStep, incrementStep, vehicleId, proposedVehicleId, date, featureTags, productRelationship, setAssumptionsText, step3Feedback, step3Files, vehicleData, assumptionConversationId, setAssumptionConversationId, assumptionConversationStatus, assumptionsText } = useCreationVehicleStore();
  const { chosenProduct } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProductRelationshipMutation = useSaveProductRelationshipMutation();
  const saveVehicleOutlineMutation = useSaveVehicleOutlineMutation();
  const vehicleStep3Mutation = useVehicleStep3Mutation();

  const handleContinue = async () => {
    console.log('Continue clicked. Step:', step, 'vehicleId:', vehicleId, 'date:', date);
    console.log('[NavButtons] assumptionConversationId:', assumptionConversationId);
    
    if (step === 2 && vehicleId) {
      
      // Use assumptionsText as fallback if productRelationship is not set (e.g., when status is PENDING)
      const relationshipText = productRelationship.trim() || assumptionsText?.trim() || '';
      
      if (!relationshipText) {
        alert('Please provide a product relationship description before continuing.');
        return;
      }
      
      setIsSubmitting(true);
      try {
        // Complete assumption conversation if there's an active conversation_id AND status is PENDING
        // If status is already COMPLETE, the conversation is already done on server side, no need to call /complete
        // This prevents memory leaks on RAG by clearing the conversation context
        if (assumptionConversationId && assumptionConversationStatus === 'PENDING') {
          console.log('[NavButtons Step2] Found PENDING assumptionConversationId, calling complete endpoint:', assumptionConversationId);
          try {
            const completeResponse = await fastApiService.vehicleAssumptionConversationComplete(assumptionConversationId);
            console.log('[NavButtons Step2] Assumption conversation completed successfully:', completeResponse);
            setAssumptionConversationId(null);
            console.log('[NavButtons Step2] Conversation ID cleared from store');
          } catch (error: any) {
            console.error('[NavButtons Step2] Error completing assumption conversation:', error);
            console.error('[NavButtons Step2] Error details:', error.response?.data || error.message);
            // Don't block the flow if this fails - just log the error
          }
        } else if (assumptionConversationId && assumptionConversationStatus === 'COMPLETE') {
          console.log('[NavButtons Step2] Conversation status is already COMPLETE, skipping /complete endpoint call');
          // Just clear the conversation_id since it's already completed
          setAssumptionConversationId(null);
        } else {
          console.log('[NavButtons Step2] No active conversation found, skipping complete endpoint call');
        }

        const userId = localStorage.getItem('user_id');
        if (!userId) {
          showToast.error('User ID not found. Please log in again.');
          setIsSubmitting(false);
          return;
        }

        // Use assumptionsText as fallback if productRelationship is not set
        const relationshipToSave = productRelationship.trim() || assumptionsText?.trim() || '';

        await saveProductRelationshipMutation.mutateAsync({
          vehicleId,
          data: {
            productRelationship: relationshipToSave,
            voiceInput: 'Voice input if any',
            supportingFiles: []
          }
        });

        showToast.info('Finalizing vehicle plan...');
        
        const feedback = relationshipToSave || undefined;
        console.log('Step3 API - Files in store:', step3Files);
        console.log('Step3 API - Files count:', step3Files.length);
        const files = step3Files.length > 0 ? step3Files : undefined;
        console.log('Step3 API - Sending files:', files);
        console.log('Step3 API - Feedback:', feedback);
        
        // Use proposedVehicleId from step1-basics if available, otherwise use vehicleId
        const vehicleIdForStep3 = proposedVehicleId || vehicleId;
        
        if (!vehicleIdForStep3) {
          showToast.error('Vehicle ID not found. Please go back to step 1.');
          setIsSubmitting(false);
          return;
        }

        console.log('[NavButtons Step2] Using vehicle_id for step3-finalize:', vehicleIdForStep3, '(proposedVehicleId:', proposedVehicleId, ', vehicleId:', vehicleId, ')');

        const step3Result = await fastApiService.vehicleStep3Finalize(
          userId,
          vehicleIdForStep3,
          feedback,
          files
        );

        console.log('Step3-finalize result:', step3Result);

        // Store the actual vehicle_id that was used in step3-finalize for skill match API
        localStorage.setItem('step3_vehicle_id', vehicleIdForStep3.toString());
        console.log('[NavButtons Step2] Stored step3_vehicle_id in localStorage:', vehicleIdForStep3);

        // Handle both response formats: {vehicle: {...}} or {vehicles: [...]}
        let vehiclesArray: any[] = [];
        
        if (step3Result?.vehicles && Array.isArray(step3Result.vehicles)) {
          // Multiple vehicles format
          vehiclesArray = step3Result.vehicles;
        } else if (step3Result?.vehicle) {
          // Single vehicle format - wrap in array
          vehiclesArray = [step3Result.vehicle as any];
        } else {
          showToast.error('No vehicles returned from step3-finalize');
          setIsSubmitting(false);
          return;
        }

        if (vehiclesArray.length === 0) {
          showToast.error('No vehicles returned from step3-finalize');
          setIsSubmitting(false);
          return;
        }

        // Store in the format expected by step 3
        const step3ResultFormatted = {
          vehicles: vehiclesArray
        };
        
        localStorage.setItem('step3_result', JSON.stringify(step3ResultFormatted));
        console.log('Stored step3 result in localStorage:', step3ResultFormatted);

        incrementStep();
      } catch (error: any) {
        console.error('Error in step 2:', error);
        showToast.error(error.response?.data?.detail || error.message || 'Failed to finalize vehicle plan');
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 3 && vehicleId) {
      setIsSubmitting(true);
      try {
        const userId = localStorage.getItem('user_id');
        const prdId = localStorage.getItem('prd_id');
        
        if (!userId) {
          showToast.error('User ID not found. Please log in again.');
          setIsSubmitting(false);
          return;
        }

        if (!prdId) {
          showToast.error('PRD ID not found. Please create a product first.');
          setIsSubmitting(false);
          return;
        }

        if (!chosenProduct?.id) {
          showToast.error('Product ID not found.');
          setIsSubmitting(false);
          return;
        }

        const storedStep3Result = localStorage.getItem('step3_result');
        if (!storedStep3Result) {
          showToast.error('Step 3 result not found. Please go back to step 2.');
          setIsSubmitting(false);
          return;
        }

        const step3Result = JSON.parse(storedStep3Result);
        console.log('Step3-finalize result (from storage):', step3Result);

        if (!step3Result?.vehicles || !Array.isArray(step3Result.vehicles) || step3Result.vehicles.length === 0) {
          showToast.error('No vehicles found in step3 result');
          setIsSubmitting(false);
          return;
        }

        // showToast.info('Saving vehicles to database...');

        // const allVehicles = step3Result.vehicles;
        // console.log('Persisting all vehicles from step3:', allVehicles.length);
        // console.log('Vehicle names:', allVehicles.map((v: any) => v.vehicle_name));

        // const persistResult = await fastApiService.vehiclePersist(
        //   prdId,
        //   allVehicles,
        //   chosenProduct.id,
        //   parseInt(userId)
        // );

        // console.log('Persist result:', persistResult);

        // if (persistResult?.status === 'ok' && persistResult?.vehicle_ids && Array.isArray(persistResult.vehicle_ids)) {
        //   if (persistResult?.impact_reports && persistResult.vehicle_ids.length > 0) {
        //     persistResult.vehicle_ids.forEach((persistedVehicleId: number) => {
        //       const impactReport = persistResult.impact_reports[persistedVehicleId.toString()];
        //       if (impactReport) {
        //         localStorage.setItem(`vehicle_impact_${persistedVehicleId}`, JSON.stringify(impactReport));
        //         console.log('Stored impact report in localStorage for vehicle ID:', persistedVehicleId);
        //       }
        //     });
        //     console.log(`Stored ${persistResult.vehicle_ids.length} impact report(s) in localStorage`);
        //   }

        //   console.log('Calling getVehiclesByIds with vehicle_ids:', persistResult.vehicle_ids);
        //   (async () => {
        //     try {
        //       const vehicles = await fastApiService.getVehiclesByIds(persistResult.vehicle_ids);
        //       console.log('Vehicles fetched by IDs:', vehicles);
        //       if (vehicles && Array.isArray(vehicles) && vehicles.length > 0) {
        //         showToast.success(`Fetched ${vehicles.length} vehicle(s) successfully`);
        //       }
        //     } catch (error: any) {
        //       console.error('Error fetching vehicles by IDs:', error);
        //       showToast.error(error.response?.data?.detail || error.message || 'Failed to fetch vehicles');
        //     }
        //   })();

        //   showToast.success('Vehicles saved successfully');
          
          if (date) {
        await saveVehicleOutlineMutation.mutateAsync({
          vehicleId,
          data: {
            featureTags: featureTags || '',
            startDate: date.toISOString(),
            priority: 'Standard',
            involvedTeam: 'Design',
            successMetrics: 'Success metrics will be defined'
          }
        });
          }
          
        incrementStep();
      } catch (error: any) {
        console.error('Error in step 3:', error);
        showToast.error(error.response?.data?.detail || error.message || 'Failed to finalize vehicle plan');
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      if (onContinue) {
        await onContinue();
      }
      incrementStep();
    } else if (onContinue) {
      onContinue();
    } else {
      incrementStep();
    }
  };

  return (
    <div className="flex justify-between mt-5 items-center pr-5">
      <div className="hover:underline cursor-pointer" onClick={decrimentStep}>
        Back
      </div>
      <div className="w-[280px] text-[14px]">
        <ConfirmBtn
          className="rounded-[12px] h-[45px]"
          text={isSubmitting ? "Saving..." : "Continue"}
          onClick={handleContinue}
          disabled={isSubmitting || (step === 2 && !productRelationship.trim() && !assumptionsText?.trim())}
        />
      </div>
    </div>
  );
}
