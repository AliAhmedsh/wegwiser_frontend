'use client';

import { useEffect, useState } from 'react';
import GaugeComponent from 'react-gauge-component';
import { motion } from 'framer-motion';
import { EfficiencyCharts } from '../../types';

const EfficiencyCard: React.FC<EfficiencyCharts> = ({
  speed,
  efficiency,
  quality,
  minwidth,
}) => {
  const [showGauges, setShowGauges] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowGauges(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="text-[10px] pb-5 text-[#181818]  flex justify-center items-center overflow-hidden max-w-full">
      {[
        { value: speed, label: 'speed' },
        { value: efficiency, label: 'efficiency' },
        { value: quality, label: 'quality' },
      ].map(({ value, label }, index) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center text-[#535354] text-[10px] w-1/3 max-w-[200px] px-1 box-border"
          style={{ minWidth: minwidth }}
        >
          <motion.div
            className="w-full relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: showGauges ? 1 : 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          >
            {showGauges && (
              <GaugeComponent
                value={value}
                type="semicircle"
                style={{
                  fontSize: '10px',
                  maxWidth: '200px',
                  height: 'auto',
                  padding: 0,
                  margin: '0 auto',
                  display: 'block',
                }}
                labels={{
                  valueLabel: { hide: true },
                  tickLabels: { hideMinMax: true },
                }}
                arc={{
                  colorArray: ['#FF6B6B', '#FFD93D', '#4CAF50'],
                  padding: 0,
                  width: 0.3,
                  cornerRadius: 0,
                  subArcs: [
                    { limit: 33.3, color: '#FF6B6B' },
                    { limit: 66.6, color: '#FFD93D' },
                    { limit: 100, color: '#4CAF50' },
                  ],
                }}
                pointer={{
                  color: '#333',
                  length: 0.6,
                  width: 4,
                  type: 'needle',
                }}
              />
            )}
          </motion.div>
          <span className="text-xs font-medium text-[#535354] uppercase mt-[-10px]">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default EfficiencyCard;
