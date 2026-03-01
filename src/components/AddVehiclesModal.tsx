'use client';

import React, { useState } from 'react';
import Modal from '@/shared/portals/ModalWindow';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils/toast';
import { useProductStore } from '@/entities/product/store';

interface AddVehiclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

const AddVehiclesModal: React.FC<AddVehiclesModalProps> = ({ isOpen, onClose, productId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { chosenProduct } = useProductStore();

  const handleCreateVehicle = async () => {
    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        showToast.error('User ID not found');
        setIsLoading(false);
        return;
      }

      if (!productId) {
        showToast.error('Product ID not found');
        setIsLoading(false);
        return;
      }

      console.log('[AddVehiclesModal] Fetching PRD ID for product:', productId);
      const prdData = await fastApiService.getPrdByProduct(productId);
      const prdId = prdData?.prd_id || prdData?.id;
      
      if (!prdId) {
        showToast.error('PRD ID not found for this product');
        setIsLoading(false);
        return;
      }

      console.log('[AddVehiclesModal] PRD ID:', prdId);
      
      console.log('[AddVehiclesModal] Checking workflow status for prdId:', prdId);
      const workflowStatus = await fastApiService.getWorkflowStatus(prdId);
      console.log('[AddVehiclesModal] Workflow status:', workflowStatus);

      if (workflowStatus?.status !== 'COMPLETED') {
        showToast.error('Workflow is not completed yet. Please wait for the workflow to finish.');
        setIsLoading(false);
        return;
      }

      console.log('[AddVehiclesModal] Workflow completed, calling step1-basics with product_id:', productId, 'prd_id:', prdId);
      const step1Response = await fastApiService.vehicleStep1Basics(
        userId, 
        prdId, 
        productId, 
        parseInt(userId)
      );
      console.log('[AddVehiclesModal] Step1 response:', step1Response);

      if (step1Response?.vehicles_basic && Array.isArray(step1Response.vehicles_basic)) {
        try {
          localStorage.setItem(
            `proposed_vehicles_${productId}`,
            JSON.stringify(step1Response.vehicles_basic)
          );
        } catch (storageError) {
          console.error('[AddVehiclesModal] Error saving vehicles to localStorage:', storageError);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['proposedVehicles', productId] });
      
      showToast.success('Vehicles generated successfully!');
      onClose();
    } catch (error: any) {
      console.error('[AddVehiclesModal] Error:', error);
      showToast.error(error.response?.data?.detail || error.message || 'Failed to create vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} noDimming={true}>
      <div className="bg-white rounded-2xl shadow-xl border border-[#858585] p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-black">Add Vehicles To Your Product</h2>
        <p className="text-sm font-normal text-gray-700 mb-8">
          A Product is made of Vehicles that represent a specific product development initiative. For example 'back end', 'UX design' etc.
        </p>

        <div className="flex w-full justify-between items-center gap-4">
          <button
            className="text-sm font-semibold text-black py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Skip for now
          </button>
          <button
            className="text-sm font-semibold bg-black text-white py-3 px-10 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreateVehicle}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Create Vehicle'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVehiclesModal;
