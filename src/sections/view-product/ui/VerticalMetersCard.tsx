'use client';

import { useEffect, useState } from 'react';
import GaugeComponent from 'react-gauge-component';
import { motion } from 'framer-motion';

interface VerticalMetersCardProps {
  speed: number;
  efficiency: number;
  quality: number;
}

interface MetricCardProps {
  value: number;
  label: string;
  description: string;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, description, index }) => {
  const [showGauge, setShowGauge] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowGauge(true), 300 + index * 200);
    return () => clearTimeout(timeout);
  }, [index]);

  const getMetricDescription = (label: string) => {
    switch (label.toLowerCase()) {
      case 'speed':
        return 'Moderate due to testing and revisions extending timelines.';
      case 'efficiency':
        return 'Moderate as resources are balanced between research & design.';
      case 'quality':
        return 'Moderate as user feedback is still being integrated for refinement.';
      default:
        return 'Performance metric analysis in progress.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className="rounded-xl p-6 mb-4 shadow-lg"
      style={{
        backgroundColor: '#EAEDF2',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-start gap-6">
        {/* Gauge Chart */}
        <div className="flex-shrink-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showGauge ? 1 : 0 }}
            transition={{ delay: 0.5 + index * 0.2, duration: 0.4 }}
            style={{ margin: '-20px', padding: 0 }}
          >
            {showGauge && (
              <GaugeComponent
                value={value}
                type="semicircle"
                style={{
                  fontSize: '15px',
                  width: '150px',
                  // height: '150px',
                  padding: 0,
                  margin: 0,
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
          <div className="text-center mt-0">
            <span 
              className="uppercase"
              style={{
                color: '#535354',
                textAlign: 'center',
                fontFamily: 'Inter',
                fontSize: '10px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                textTransform: 'uppercase'
              }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                <p 
                  className="leading-normal"
                  style={{
                    color: '#181818',
                    fontFamily: 'Open Sans',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal'
                  }}
                >
                  {getMetricDescription(label)}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const VerticalMetersCard: React.FC<VerticalMetersCardProps> = ({
  speed,
  efficiency,
  quality,
}) => {
  const metrics = [
    {
      value: speed,
      label: 'SPEED',
      description: 'Moderate due to testing and revisions extending timelines.',
    },
    {
      value: efficiency,
      label: 'EFFICIENCY',
      description: 'Moderate as resources are balanced between research & design.',
    },
    {
      value: quality,
      label: 'QUALITY',
      description: 'Moderate as user feedback is still being integrated for refinement.',
    },
  ];

  return (
    <div className="bg-[#EAEDF2] p-6 rounded-xl">
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            value={metric.value}
            label={metric.label}
            description={metric.description}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default VerticalMetersCard;
