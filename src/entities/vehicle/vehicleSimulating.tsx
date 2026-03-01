'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import VehicleSimulationTitle from './components/vehicleSimulating/vehicleSimulationTitle';
import SimluationImpactMetric from './components/vehicleSimulating/SimulationImpactMetric';
import { showToast } from '@/lib/utils/toast';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip
);

interface VehicleSimulationProps {
  vehicleData?: {
    name: string;
    description: string;
    owner: string;
    productName?: string;
    members?: any[];
    featureTags?: string;
    date?: Date;
    facilitators?: any[];
    id?: number;
  };
  impactAnalysisData?: any;
  isApprover?: boolean;
  hasApproved?: boolean;
  onApprove?: () => void;
  onCloseSimulation?: () => void;
  isApproving?: boolean;
  onVehicleDataRefresh?: () => void;
  allApproversApproved?: boolean;
  hasFacilitators?: boolean;
}

const VehicleSimulation = ({ 
  vehicleData, 
  impactAnalysisData,
  isApprover = false,
  hasApproved = false,
  onApprove,
  onCloseSimulation,
  isApproving = false,
  onVehicleDataRefresh,
  allApproversApproved = false,
  hasFacilitators = false
}: VehicleSimulationProps) => {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  const canLaunch = allApproversApproved;

  const handleLaunchVehicle = async () => {
    if (!vehicleData?.id || !canLaunch) return;

    setIsLaunching(true);
    try {
      const { vehicleService } = await import('@/lib/api/services/vehicleService');
      const result = await vehicleService.launchVehicle(vehicleData.id);
      
      if (result.success) {
        showToast.success('Vehicle launched successfully!');

        // Trigger evaluation after vehicle launch
        try {
          const fastApiService = (await import('@/lib/api/services/fastApiService')).default;
          await fastApiService.evaluateVehicle({
            code: [],
            role: 'frontend',
            time_range: { startTime: Date.now() - 86400000, endTime: Date.now() },
            user_id: 1, // TODO: get from auth store
            vehicle_id: vehicleData.id,
          });
          console.log('Evaluation triggered on vehicle launch');
        } catch (evalError) {
          console.error('Evaluation after launch failed (non-blocking):', evalError);
        }

        // Redirect to home page
        router.push('/');
      } else {
        showToast.error(result.error || 'Failed to launch vehicle');
      }
    } catch (error: any) {
      console.error('Error launching vehicle:', error);
      showToast.error(error.response?.data?.error || 'Failed to launch vehicle');
    } finally {
      setIsLaunching(false);
    }
  };
  return (
    <div
      className="flex justify-between border rounded-2xl p-6 bg-[#EAEDF2] text-[8px] lg:w-[80%] xl:w-[60%]"
      style={{
        boxShadow: `1.14px 1.14px 1.14px 0px #A7B1C499, -1.14px -1.14px 1.14px 0px #FFFFFF`,
      }}
    >
      <div className="w-[40%]">
        <VehicleSimulationTitle 
          vehicleData={vehicleData} 
          impactAnalysisData={impactAnalysisData}
          onVehicleDataRefresh={onVehicleDataRefresh}
        />
      </div>
      <div className="w-[58%]">
        <SimluationImpactMetric vehicleData={vehicleData} impactAnalysisData={impactAnalysisData} isApprover={isApprover} />
        <div className="flex justify-between mt-3 text-[12px]">
          <div className="w-1/3">
            <button 
              onClick={isApprover ? onApprove : undefined}
              disabled={isApprover && (hasApproved || isApproving)}
              className={`flex w-[180px] h-[36px] pt-[6px] pb-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[11.808px] font-[500] ${
                isApprover && (hasApproved || isApproving)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white'
              }`}
              style={{
                boxShadow: isApprover && (hasApproved || isApproving)
                  ? 'none'
                  : '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              }}
            >
              <span className={`font-poppins text-[13.284px] font-semibold leading-[19.927px] not-italic ${
                isApprover && (hasApproved || isApproving) ? 'text-white' : 'text-white'
              }`}>
                {isApprover 
                  ? (isApproving ? 'Approving...' : hasApproved ? 'Approved' : 'Approve Vehicle')
                  : 'Modify simulation'
                }
              </span>
            </button>
          </div>
          <div className="w-1/3 ">
            <ConfirmBtn
              text={canLaunch ? (isLaunching ? "Launching..." : "Launch vehicle") : (isApprover ? "Close Simulation" : "Launch vehicle")}
              toolTipText={!canLaunch ? (isApprover ? undefined : "All approvers must approve before launching the vehicle") : undefined}
              onClick={canLaunch ? handleLaunchVehicle : (isApprover ? onCloseSimulation : undefined)}
              isInActive={!canLaunch && !isApprover}
              disabled={(!canLaunch && !isApprover) || isLaunching}
              isLoading={isLaunching}
              className={`flex w-[139px]  h-[36px]  pt-[6px] pb-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[11.808px] font-inter text-[12px] font-[700] leading-[19.927px] bg-white text-[#535354]`}
              style={{
                boxShadow: canLaunch 
                  ? '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF'
                  : 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSimulation;
