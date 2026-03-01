'use client';

import Image from 'next/image';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useCreationProductStore } from '../../store';
import AddMaterialForm from './forms/AddMaterialForm';
import { useState } from 'react';
import PrdMissingModal from '@/components/PrdMissingModal';
import { useProductStore } from '@/entities/product/store';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { getCurrentUserId } from '@/lib/utils/auth';
import { showToast } from '@/lib/utils/toast';

function determineItemsMissingState(hasFiles: boolean): 'items-missing' | null {
  if (!hasFiles) {
    return 'items-missing';
  }
  
  return null;
}

function hasPRDFile(files: File[]): boolean {
  if (!files || files.length === 0) {
    return false;
  }

  const PRD_KEYWORDS = [
    'prd',
    'product requirements document',
    'product requirements',
    'product requirement',
    'requirements document',
    'requirement doc',
    'product spec',
    'product specification',
    'feature spec',
    'feature specification',
    'functional spec',
    'functional specification'
  ];

  return files.some(file => {
    const lowerFilename = file.name.toLowerCase();
    
    return PRD_KEYWORDS.some(keyword => lowerFilename.includes(keyword));
  });
}

export default function AddMaterial() {
  const materialLink = useCreationProductStore((state) => state.materialLink);
  const materialFiles = useCreationProductStore((state) => state.materialFiles);
  const productName = useCreationProductStore((state) => state.name);
  const setMaterialLink = useCreationProductStore(
    (state) => state.setMaterialLink
  );
  const incrementStep = useCreationProductStore((state) => state.incrementStep);
  const decrimentStep = useCreationProductStore((state) => state.decrimentStep);
  const setSkippedPRDStep = useCreationProductStore((state) => state.setSkippedPRDStep);

  const { chosenProduct } = useProductStore();

  const [showItemsMissingModal, setShowItemsMissingModal] = useState(false);
  const [hasClickedItemsMissingOk, setHasClickedItemsMissingOk] = useState(false);
  const [showPRDMissingModal, setShowPRDMissingModal] = useState(false);
  const [hasDeclinedPRDGeneration, setHasDeclinedPRDGeneration] = useState(false);

  const hasMaterial = materialFiles.length > 0 || (materialLink && materialLink.trim().length > 0);
  
  const itemsMissingState = determineItemsMissingState(!!hasMaterial);

  const onChangeLink = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaterialLink(event.currentTarget.value);
  };

  const handleContinue = () => {
    console.log('Continue clicked. Files:', materialFiles.length, 'Link:', materialLink);
    
    if (itemsMissingState === 'items-missing') {
      setShowItemsMissingModal(true);
      return;
    }

    if (materialFiles.length > 0) {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast.error('User ID not found. Please log in again.');
        return;
      }

      showToast.info('Processing documents in background...');
      
      (async () => {
        try {
          console.log('Background: Calling refine-doc API with files:', materialFiles.length, materialFiles.map(f => f.name));
          const refineResult = await fastApiService.refineDoc(String(userId), materialFiles);
          
          console.log('Background: Refine result:', refineResult);
          
          console.log('Background: Refine-doc completed. Workflow/submit will be called after product creation.');
          showToast.success('Documents processed successfully');
        } catch (error: any) {
          console.error('Background: Error processing documents:', error);
          console.error('Background: Error details:', error.response?.data);
          showToast.error(error.response?.data?.detail || error.message || 'Failed to process documents');
        }
      })();

      setSkippedPRDStep(false);
      incrementStep();
      incrementStep();
      return;
    }

    console.log('No files, skipping to next step');
    setSkippedPRDStep(true);
    incrementStep();
    incrementStep();
  };


  const handleItemsMissingOk = () => {
    setShowItemsMissingModal(false);
    setHasClickedItemsMissingOk(true);
  };

  const handlePRDMissingNo = () => {
    setShowPRDMissingModal(false);
    setHasDeclinedPRDGeneration(true);
    setSkippedPRDStep(true);
    incrementStep();
    incrementStep();
  };

  const handlePRDMissingYes = () => {
    setShowPRDMissingModal(false);
    setHasDeclinedPRDGeneration(false);
    setSkippedPRDStep(false);
    
    if (materialFiles.length > 0) {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast.error('User ID not found. Please log in again.');
        return;
      }

      showToast.info('Processing documents in background...');
      
      (async () => {
        try {
          const refineResult = await fastApiService.refineDoc(String(userId), materialFiles);
          
          console.log('Background: Refine-doc completed. Workflow/submit will be called after product creation.');
          showToast.success('Documents processed successfully');
        } catch (error: any) {
          console.error('Background: Error processing documents:', error);
          showToast.error(error.response?.data?.detail || error.message || 'Failed to process documents');
        }
      })();

      incrementStep();
      incrementStep();
    } else {
    incrementStep();
    }
  };

  return (
    <>
      {showItemsMissingModal && (
        <PrdMissingModal
          isOpen={showItemsMissingModal}
          onConfirm={handleItemsMissingOk}
          mode="items-missing"
        />
      )}
      {showPRDMissingModal && (
        <PrdMissingModal
          isOpen={showPRDMissingModal}
          onConfirm={handlePRDMissingYes}
          onCancel={handlePRDMissingNo}
          mode="prd-missing"
        />
      )}
      <div className="bg-white h-[85vh] w-[85vw] rounded-4xl flex flex-col">
        <div className="w-[86%] mx-auto">
          <div className="flex justify-center pt-10">
            <Image
              src={'/creation-product-steps/second-step.svg'}
              alt="second-step"
              width={350}
              height={100}
            />
          </div>
          <h1 className="font-poppins font-semibold text-[24px] mt-5 text-center">
            Add Supporting Material
          </h1>
          <div className="mt-10 mx-auto">
            <input
              className="input-default"
              value={materialLink}
              onChange={onChangeLink}
            />
            <label className="text-[#535354] mt-1 text-[14px]">Link</label>
          </div>
        </div>

        <div className="w-[86%] flex-grow mx-auto">
          <AddMaterialForm />
        </div>

        <div className="flex justify-between items-center pb-[30px] pt-5 w-[86%] mx-auto text-[14px]">
          <div
            className="hover:scale-90 hover:cursor-pointer active:scale-80 transition-all duration-300"
            onClick={decrimentStep}
          >
            <Image
              src={'icons/arrow-to-left.svg'}
              alt="arrow-to-left"
              height={24}
              width={24}
            />
          </div>
          <div className="flex items-center justify-end">
            <div className="w-[180px]">
              <ConfirmBtn
                className="h-[45px]"
                text="Continue"
                onClick={handleContinue}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
