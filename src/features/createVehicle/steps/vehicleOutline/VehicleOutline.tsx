'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import VehicleOutlineForm from './forms/VehicleOutlineForm';
import NavButtons from '../../ui/navButtons';
import { BLOCK_HEIGHT_VH, BLOCK_WIDTH_WV } from '../constants';
import { Inter } from 'next/font/google';
import { useCreationVehicleStore } from '@/features/createVehicle/store';

const inter700 = Inter({
  weight: ['700'],
  subsets: ['cyrillic']
});

export default function VehicleOutline() {
  const { 
    setFeatureTags, 
    setDate, 
    setEstimatedCompletionDate,
    setPriority, 
    setInvolvedTeam, 
    setSuccessMetrics,
    featureTags,
    date,
    estimatedCompletionDate,
    priority,
    involvedTeam,
    successMetrics
  } = useCreationVehicleStore();

  useEffect(() => {
    try {
      const step3ResultStr = localStorage.getItem('step3_result');
      if (!step3ResultStr) {
        return;
      }

      const step3Result = JSON.parse(step3ResultStr);

      let vehicleData = null;
      if (step3Result?.vehicles && Array.isArray(step3Result.vehicles) && step3Result.vehicles.length > 0) {
        vehicleData = step3Result.vehicles[0];
      } else if (step3Result?.vehicle) {
        vehicleData = step3Result.vehicle;
      }

      if (!vehicleData) {
        return;
      }

      if (!featureTags && vehicleData.feature_list_preview && Array.isArray(vehicleData.feature_list_preview)) {
        const featureTagsValue = vehicleData.feature_list_preview.join(', ');
        setFeatureTags(featureTagsValue);
      }

      if (!estimatedCompletionDate && vehicleData.estimated_completion_date) {
        try {
          const dateParts = vehicleData.estimated_completion_date.split('/');
          if (dateParts.length === 3) {
            const month = parseInt(dateParts[0]) - 1;
            const day = parseInt(dateParts[1]);
            const year = parseInt(dateParts[2]);
            const parsedDate = new Date(year, month, day);
            if (!isNaN(parsedDate.getTime())) {
              setEstimatedCompletionDate(parsedDate);
            }
          }
        } catch (dateError) {
          console.error('[VehicleOutline] Error parsing estimated_completion_date:', dateError);
        }
      }

      if (!priority && vehicleData.priority) {
        const priorityValue = vehicleData.priority.toLowerCase();
        setPriority(priorityValue);
      }

      if (!involvedTeam && vehicleData.suggested_members && Array.isArray(vehicleData.suggested_members)) {
        const roles = vehicleData.suggested_members.map((member: any) => member.role).filter(Boolean);
        if (roles.length > 0) {
          const involvedTeamValue = roles.join(', ');
          setInvolvedTeam(involvedTeamValue);
        }
      }

      if (!successMetrics && vehicleData.success_metrics && Array.isArray(vehicleData.success_metrics)) {
        const successMetricsValue = vehicleData.success_metrics.join('\n');
        setSuccessMetrics(successMetricsValue);
      }
    } catch (error) {
      console.error('[VehicleOutline] Error auto-filling form from step3_result:', error);
    }
  }, [featureTags, date, estimatedCompletionDate, priority, involvedTeam, successMetrics, setFeatureTags, setDate, setEstimatedCompletionDate, setPriority, setInvolvedTeam, setSuccessMetrics]);

  return (
    <div className="bg-[#EAEDF2] font-poppins h-[92vh]">
      <div className="flex justify-center">
        <Image
          alt="step visualisation"
          src={'/creation-vehicle-steps/third-step.svg'}
          width={430}
          height={27}
        />
      </div>
      <div className="flex px-13 justify-center mt-5">
        <div
          className="mt-5 bg-white rounded-4xl pt-5 px-6 pl-20 flex flex-col"
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C499',
            height: BLOCK_HEIGHT_VH,
            width: BLOCK_WIDTH_WV,
          }}
        >
          <h2 className={`font-bold text-[16px] ${inter700.className}`}>
            Vehicle outline
          </h2>
          <p
            className="mt-5"
            style={{
              color: '#000',
              fontFamily: 'Inter',
              fontSize: '13px',
              fontStyle: 'normal',
              fontWeight: '400'
            }}
          >
            Based on the information you have provided, further details have
            been generated for your vehicle. You can make changes necessary and
            proceed to the next step.
          </p>

          <div className="flex-grow overflow-auto mt-4">
            <VehicleOutlineForm />
          </div>

          <div className="mb-3 xl:mb-10">
            <NavButtons step={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
