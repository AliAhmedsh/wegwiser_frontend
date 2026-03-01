import ConfirmBtn from '@/shared/ui/confirmBtn';
import { Doughnut } from 'react-chartjs-2';
import PerfectChart from './Chart';
import { useMemo } from 'react';

interface SimulationImpactMetricProps {
  vehicleData?: {
    name: string;
    description: string;
    owner: string;
    productName?: string;
    members?: any[];
    featureTags?: string;
    date?: Date;
  };
  impactAnalysisData?: any;
  isApprover?: boolean;
}

const SimluationImpactMetric = ({ vehicleData, impactAnalysisData, isApprover = false }: SimulationImpactMetricProps) => {
  const departmentCounts = useMemo(() => {
    // Ensure members is an array
    const members = Array.isArray(vehicleData?.members) ? vehicleData.members : [];
    
    if (members.length === 0) {
      return { design: 0, engineering: 0, product: 0 };
    }

    let design = 0;
    let engineering = 0;
    let product = 0;

    members.forEach((member: any) => {
      const role = (member.role || member.position || '').toLowerCase();
      
      if (role.includes('designer') || role.includes('ui/ux') || role.includes('design')) {
        design++;
      } else if (role.includes('engineer') || role.includes('qa') || role.includes('developer') || role.includes('backend') || role.includes('frontend')) {
        engineering++;
      } else if ((role.includes('pm') || role.includes('product') || role.includes('manager')) && !role.includes('engineering') && !role.includes('design')) {
        product++;
      } else {
        engineering++;
      }
    });

    return { design, engineering, product };
  }, [vehicleData?.members]);

  const roiPercentage = impactAnalysisData?.roi_percentage || 0;
  // Clamp ROI between 0 and 100 for display (doughnut chart shows 0-100%)
  const roiDisplay = Math.min(Math.max(roiPercentage, 0), 100);
  const roiRemaining = 100 - roiDisplay;
  
  const roiData = {
    datasets: [
      {
        data: [roiDisplay, roiRemaining],
        backgroundColor: ['#000', '#ddd'],
        borderWidth: 0,
        cutout: '80%',
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div>
      <div className="flex justify-between items-center px-1">
        <div className="text-[16px] font-bold">Impact metrics</div>
        {!isApprover && (
          <div className="text-[10px] w-[155px] ">          
            <ConfirmBtn
              text="Revert to original"
              toolTipText={`Nothing to revert`}
              isInActive
              className="flex w-[160px] h-[36px]  pt-[6px] pb-[8px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[11.808px] bg-white text-[#535354] font-inter text-[12px] font-[700] leading-[19.927px]"
            />
          </div>
        )}
      </div>

      <div className="border border-[rgba(0,0,0,0.5)] rounded-[12px] p-4 mt-3">
        <div className="flex justify-between items-center gap-3">
          <div className="w-[150px] h-[95px] border border-[rgba(0,0,0,0.5)] p-2 rounded-[5px]">
            <div className="text-[13px] mb-2 text-center">
              Return on investment
            </div>
            <div className="w-[70%] mx-auto h-[50px]">
              <Doughnut data={roiData} options={chartOptions} />
            </div>
          </div>

          <div className="flex-1 justify-between h-[95px] rounded-[5px] py-2 px-3 border border-[rgba(0,0,0,0.5)] text-[12px] flex overflow-hidden">
            <div className="flex-shrink-0 pr-2">
              <div>Estimated total cost</div>
              <div className="font-bold text-[12px] break-words">{impactAnalysisData?.estimated_total_cost || '$123456'}</div>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div>Cost breakdown</div>
              <ul className="list-disc pl-4 text-[12px] mt-1 overflow-y-auto max-h-[65px]">
                {impactAnalysisData?.cost_breakdown && impactAnalysisData.cost_breakdown.length > 0 ? (
                  impactAnalysisData.cost_breakdown.map((item: string, index: number) => (
                    <li key={index} className="text-[10px] break-words pr-1">{item}</li>
                  ))
                ) : (
                  <>
                    <li className="text-[10px]">Design</li>
                    <li className="text-[10px]">Engineering</li>
                    <li className="text-[10px]">API</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full h-[90px] border border-[rgba(0,0,0,0.5)] rounded-[5px] mt-4 px-3 pt-2 flex justify-between overflow-hidden">
          <div className="w-[75%] min-w-0">
            <PerfectChart impactTimeline={impactAnalysisData?.impact_timeline} />
          </div>
          <div className="text-[12px] font-bold text-center mt-1 flex-shrink-0 pl-2">
            <div className="break-words">Projected year <br /> on year impact:</div>
            <div className="text-[20px] break-words">{impactAnalysisData?.projected_impact_percentage || '20%'}</div>
          </div>
        </div>

        <div className="w-full flex justify-between h-[115px] mt-4 overflow-hidden">
          <div className="flex flex-col w-[20%] justify-around text-[10px] flex-shrink-0">
            <div className="font-bold">Departments</div>
            {impactAnalysisData?.departments && impactAnalysisData.departments.length > 0 ? (
              impactAnalysisData.departments.map((dept: any, index: number) => (
                <div key={index} className="break-words">{dept.name}</div>
              ))
            ) : (
              <>
                <div>Design</div>
                <div>Engineering</div>
                {departmentCounts.product > 0 && <div>Product</div>}
              </>
            )}
          </div>
          <div className="flex w-[25%] flex-col justify-between p-1.5 text-center border border-white rounded-[5px] flex-shrink-0 overflow-hidden">
            <div className="text-[10px]">Number of collaborators</div>
            {impactAnalysisData?.departments && impactAnalysisData.departments.length > 0 ? (
              impactAnalysisData.departments.map((dept: any, index: number) => (
                <div key={index} className="text-[16px] font-bold break-words">{dept.collaborators || 0}</div>
              ))
            ) : (
              <>
                <div className="text-[16px] font-bold">
                  {departmentCounts.design || 0}
                </div>
                <div className="text-[16px] font-bold">
                  {departmentCounts.engineering || 0}
                </div>
                {departmentCounts.product > 0 && (
                  <div className="text-[16px] font-bold">
                    {departmentCounts.product}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex w-[25%] flex-col justify-between p-1.5 text-center border border-white rounded-[5px] flex-shrink-0 overflow-hidden">
            <div className="text-[10px]">Department weightage</div>
            {impactAnalysisData?.departments && impactAnalysisData.departments.length > 0 ? (
              impactAnalysisData.departments.map((dept: any, index: number) => (
                <div key={index} className="text-[16px] font-bold break-words">{dept.weightage || '0%'}</div>
              ))
            ) : (
              <>
                {(() => {
                  const total = departmentCounts.design + departmentCounts.engineering + departmentCounts.product;
                  if (total === 0) return <><div className="text-[16px] font-bold">-</div><div className="text-[16px] font-bold">-</div></>;
                  const designPercent = Math.round((departmentCounts.design / total) * 100);
                  const engineeringPercent = Math.round((departmentCounts.engineering / total) * 100);
                  const productPercent = total > 0 ? Math.round((departmentCounts.product / total) * 100) : 0;
                  return (
                    <>
                      <div className="text-[16px] font-bold">{designPercent}%</div>
                      <div className="text-[16px] font-bold">{engineeringPercent}%</div>
                      {departmentCounts.product > 0 && <div className="text-[16px] font-bold">{productPercent}%</div>}
                    </>
                  );
                })()}
              </>
            )}
          </div>
          <div className="flex w-[25%] flex-col justify-between p-1.5 text-center border border-white rounded-[5px] flex-shrink-0 overflow-hidden">
            <div className="text-[10px] break-words">External resource requirements</div>
            {impactAnalysisData?.departments && impactAnalysisData.departments.length > 0 ? (
              impactAnalysisData.departments.map((dept: any, index: number) => (
                <div key={index} className="text-[10px] break-words px-1">{dept.external_resources || '-'}</div>
              ))
            ) : (
              <>
                <div className="text-[10px] break-words px-1">-</div>
                <div className="text-[10px] break-words px-1">API licensing</div>
                {departmentCounts.product > 0 && <div className="text-[10px] break-words px-1">-</div>}
              </>
            )}
          </div>
        </div>

        <div className="p-2 border rounded-[5px] border-[rgba(0,0,0,0.3)] font-bold text-[10px] min-h-[50px] mt-3 overflow-hidden">
          <div className="font-bold mb-1">Dependencies</div>
          <div className="font-normal text-[9px] mt-1 break-words">
            {impactAnalysisData?.dependencies_summary || 'No dependencies listed'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimluationImpactMetric;

