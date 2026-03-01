'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Chart,
  Plugin,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useUserTaskCompletion } from '@/lib/api/hooks/useVehicle';
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
);

// Custom plugin to draw dashed grid lines
const createDashedGridLinesPlugin = (yAxisTicks: number[]) => {
  return {
    id: 'dashedGridLines',
    afterDraw: (chart: Chart<'bar'>) => {
      const { ctx, chartArea, scales } = chart;
      const yAxis = scales.y;

      if (!chartArea || !yAxis) return;

      ctx.save();
      // Set color explicitly
      ctx.strokeStyle = '#535354';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = 0;

      // Draw dashed lines for each tick value
      yAxisTicks.forEach((tickValue) => {
        const y = yAxis.getPixelForValue(tickValue);
        
        if (y >= chartArea.top && y <= chartArea.bottom) {
          ctx.beginPath();
          ctx.moveTo(chartArea.left, y);
          ctx.lineTo(chartArea.right, y);
          ctx.stroke();
        }
      });

      ctx.restore();
    },
  } as Plugin<'bar'>;
};

interface PerformanceChartProps {
  userId: string | number | null;
  productId?: number;
  vehicleId?: number;
  enabled?: boolean;
}

function PerformanceChart({ userId, productId, vehicleId, enabled = true }: PerformanceChartProps) {
  const { data: completionData, isLoading } = useUserTaskCompletion(userId, productId, enabled, vehicleId);

  const chartData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (!completionData?.data || completionData.data.length === 0) {
      // Default empty data for 7 days if no data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dayName = dayNames[date.getDay()];
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          name: dayName,
          value: 0,
          date: date.toISOString().split('T')[0],
          dateDisplay: `${day} ${month}`
        };
      });
    }
    
    // Format data to include date display
    return completionData.data.map((item: any) => {
      if (item.date) {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        const dayName = dayNames[date.getDay()];
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          ...item,
          name: dayName,
          dateDisplay: `${day} ${month}`
        };
      }
      return item;
    });
  }, [completionData]);

  // Calculate max value for Y-axis domain
  const maxValue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 10;
    const max = Math.max(...chartData.map(d => d.value || 0));
    if (max === 0) return 10;
    if (max <= 5) return 5;
    if (max <= 10) return 10;
    return Math.ceil(max / 5) * 5;
  }, [chartData]);

  // Generate Y-axis ticks based on max value (include 0)
  const yAxisTicks = useMemo(() => {
    if (maxValue <= 5) return [0, 1, 2, 3, 4, 5];
    if (maxValue <= 10) return [0, 2, 4, 6, 8, 10];
    if (maxValue <= 20) return [0, 5, 10, 15, 20];
    if (maxValue <= 50) return [0, 10, 20, 30, 40, 50];
    const step = Math.ceil(maxValue / 5);
    return [0, ...Array.from({ length: 5 }, (_, i) => (i + 1) * step)];
  }, [maxValue]);

  // Calculate stepSize for grid lines to match ticks exactly
  const stepSize = useMemo(() => {
    if (yAxisTicks.length < 2) return 1;
    return yAxisTicks[1] - yAxisTicks[0];
  }, [yAxisTicks]);

  // Prepare Chart.js data
  const chartJsData = useMemo(() => {
    return {
      labels: chartData.map(item => {
        const dayName = item.name || '';
        const dateDisplay = item.dateDisplay || '';
        return dateDisplay ? `${dayName} • ${dateDisplay}` : dayName;
      }),
      datasets: [
        {
          label: 'Performance',
          data: chartData.map(d => d.value || 0),
          backgroundColor: '#444',
          borderRadius: {
            topLeft: 4,
            topRight: 4,
            bottomLeft: 0,
            bottomRight: 0,
          },
          barThickness: 30,
        },
      ],
    };
  }, [chartData]);

  // Chart options
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 5,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false,
          },
          ticks: {
            color: '#666',
            font: {
              size: 10,
            },
            maxRotation: 0,
            autoSkip: chartData.length > 30,
            maxTicksLimit: chartData.length > 30 ? Math.floor(chartData.length / 15) : undefined,
          },
        },
        y: {
          display: true,
          min: 0,
          max: maxValue,
          ticks: {
            stepSize: stepSize,
            callback: function(value: any) {
              if (yAxisTicks.includes(Number(value))) {
                return value;
              }
              return '';
            },
            color: '#999',
            font: {
              size: 10,
            },
            padding: 15,
          },
          grid: {
            display: false, // Disable default grid, using custom plugin for dashed lines
            drawTicks: false,
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
    };
  }, [chartData, maxValue, yAxisTicks, stepSize]);


  return (
    <div 
      className="bg-[#EAEDF2] rounded-[12px] h-[220px] border border-[rgba(0,0,0,0.3)] mt-2 p-5"
    >
      <h2 className="text-[14px] font-bold">Performance</h2>
      <div className="mt-3 text-[6px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[160px]">
            <span className="text-[12px] text-gray-500">Loading...</span>
          </div>
        ) : (
          <div style={{ height: '160px', width: '100%' }}>
            <Bar 
              data={chartJsData} 
              options={{
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false,
              }}
              plugins={[createDashedGridLinesPlugin(yAxisTicks)]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
export default PerformanceChart;
