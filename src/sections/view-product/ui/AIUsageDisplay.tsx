import React from 'react';

interface usageItem {
  label: string;
  value: string | number;
}

interface usageDisplayProps {
  title: string;
  stats: usageItem[];
}

const StatsDisplay: React.FC<usageDisplayProps> = ({ title, stats }) => {
  return (
    <div className="flex flex-row gap-6 justify-between items-center px-6">
      <h4 className="max-w-[62px] font-poppins font-semibold text-[16px]">
        {title}
      </h4>

      {stats.map(({ label, value }, index) => (
        <div key={index} className="flex flex-col justify-center items-center">
          <p className="font-sans font-semibold text-[12px]">{label}</p>
          <p className="font-inter font-semibold text-[24px]">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsDisplay;
