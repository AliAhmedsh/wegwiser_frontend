'use client';

import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const Poppins400 = Poppins({
  weight: ['400'],
  subsets: ['latin']
});

export default function BasicInfoForm() {
  const { vehicleData, setVehicleData } = useCreationVehicleStore();
  const [isElaborating, setIsElaborating] = useState(false);

  const handleChange = (field: keyof typeof vehicleData, value: string) => {
    setVehicleData({ ...vehicleData, [field]: value });
  };

  const handleAIElaborate = async () => {
    if (!vehicleData.description.trim()) {
      return;
    }

    setIsElaborating(true);
    try {
      const result = await fastApiService.vehicleElaborate(vehicleData.description);
      setVehicleData({ ...vehicleData, description: result.elaborated_description });
    } catch (error) {
      console.error(error);
    } finally {
      setIsElaborating(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (!chosenProduct?.id || !vehicleData.name.trim() || !vehicleData.type.trim()) {
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     const result = await saveBasicInfoMutation.mutateAsync({
  //       productId: chosenProduct.id,
  //       vehicleName: vehicleData.name,
  //       vehicleType: vehicleData.type,
  //       shortDescription: vehicleData.description || undefined,
  //     });

  //     setVehicleId(result.vehicle.id);
  //     incrementStep();
  //   } catch (error) {

  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <div className="text-[#535354]">
      <div className="flex justify-around mt-2 w-[80%] mx-auto">
        <div className={`w-[150px] ${Poppins400.className}`}>Vehicle Name</div>
        <input
          className="border-b-2 outline-0 w-[325px] border-b-[#d2d2d2]"
          value={vehicleData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>
      <div
        className={`flex justify-around mt-6 w-[80%] mx-auto ${Poppins400.className}`}
      >
        <div className="w-[150px]">Short Description</div>
        <div className="w-[370px] mr-[-40px] h-[130px] border border-[rgba(0,0,0,0.3)] outline-none rounded-[12px] p-2">
          <textarea
            className="h-[80px] w-full resize-none outline-none"
            value={vehicleData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <div className="flex justify-end borde">
            <button
              onClick={handleAIElaborate}
              disabled={isElaborating || !vehicleData.description.trim()}
              className="w-[100px] h-[26px] cursor-pointer hover:scale-95 active:scale-90 transition-all select-none text-black p-1.5 text-[14px] border border-black rounded-[6px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isElaborating ? 'Elaborating...' : 'AI elaborate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
