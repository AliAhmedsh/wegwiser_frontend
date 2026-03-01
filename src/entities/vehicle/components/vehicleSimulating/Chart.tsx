'use client';

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Chart,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRef, useEffect, useState, useMemo } from 'react';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const verticalLinesPlugin: Plugin<'line'> = {
  id: 'verticalLines',
  afterDraw: (chart: Chart<'line'>) => {
    const { ctx, chartArea, scales } = chart;
    const xAxis = scales.x;

    if (!chartArea || !xAxis) return;

    ctx.save();
    ctx.strokeStyle = '#d3d3d3';
    ctx.lineWidth = 1;

    xAxis.ticks.forEach((_, index) => {
      const x = xAxis.getPixelForTick(index);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
    });

    ctx.restore();
  },
};

interface PerfectChartProps {
  impactTimeline?: Array<{ year: string; value: number }>;
}

const defaultLabels = ['2025', '2026', '2027', '2028', '2029', '2030'];
const defaultValues = [2.5, 3.2, 3.6, 3.5, 3.8, 4.2];
const defaultTooltipValues = ['5M', '7M', '9M', '8M', '10M', '12M'];

export default function PerfectChart({ impactTimeline }: PerfectChartProps) {
  // Process impact timeline data if provided
  const processedData = useMemo(() => {
    if (impactTimeline && impactTimeline.length > 0) {
      // Extract year labels (e.g., "Year 1" -> "2025")
      const labels = impactTimeline.map((item, index) => {
        // Try to extract year from "Year 1", "Year 2", etc., or use index
        const yearMatch = item.year.match(/\d+/);
        if (yearMatch) {
          const yearNum = parseInt(yearMatch[0]);
          // Assuming Year 1 = 2025, Year 2 = 2026, etc.
          return (2024 + yearNum).toString();
        }
        // Fallback: use index to calculate year
        return (2025 + index).toString();
      });
      
      // Normalize values for chart display (scale to reasonable range)
      const maxValue = Math.max(...impactTimeline.map(item => item.value));
      const minValue = Math.min(...impactTimeline.map(item => item.value));
      const range = maxValue - minValue || 1;
      
      // Scale values to 0-5 range for better visualization
      const values = impactTimeline.map(item => {
        const normalized = ((item.value - minValue) / range) * 3 + 2;
        return normalized;
      });
      
      // Format tooltip values (e.g., 1974000 -> "1.97M")
      const tooltipValues = impactTimeline.map(item => {
        const value = item.value;
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
      });
      
      return { labels, values, tooltipValues };
    }
    return { labels: defaultLabels, values: defaultValues, tooltipValues: defaultTooltipValues };
  }, [impactTimeline]);
  
  const { labels, values, tooltipValues } = processedData;
  const chartRef = useRef<ChartJS<'line', (number | string)[], string> | null>(
    null
  );
  const [chartData, setChartData] = useState<
    ChartData<'line', (number | string)[], string>
  >({
    labels,
    datasets: [
      {
        fill: true,
        data: values,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#000',
        tension: 0.3,
      },
    ],
  });

  // Update chart data when processed data changes
  useEffect(() => {
    setChartData({
      labels,
      datasets: [
        {
          fill: true,
          data: values,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'transparent',
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#000',
          tension: 0.3,
        },
      ],
    });
  }, [labels, values]);

  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      const chart = chartRef.current;
      if (!chart) return;

      const ctx = chart.ctx;
      const height = chart.chartArea?.bottom || chart.height || 0;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#FFFFFF');

      setChartData((prev) => ({
        ...prev,
        datasets: prev.datasets.map((ds) => ({
          ...ds,
          backgroundColor: gradient,
        })),
      }));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255,255,255,0.85)',
        titleColor: '#000',
        bodyColor: '#000',
        titleFont: { weight: 'bold', size: 12 },
        bodyFont: { weight: 'bold', size: 12 },
        displayColors: false,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            return tooltipValues[index];
          },
          title: () => '',
        },
        position: 'nearest',
        intersect: false,
        mode: 'index',
        caretSize: 0,
        caretPadding: 10,
        padding: 10,
        cornerRadius: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: '#333',
          font: { size: 10 },
        },
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 0,
      },
      point: {
        radius: 0,
        hitRadius: 20,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="relative w-full h-full rounded">
      <Line
        ref={chartRef}
        options={options}
        data={chartData}
        plugins={[verticalLinesPlugin]}
      />
    </div>
  );
}
