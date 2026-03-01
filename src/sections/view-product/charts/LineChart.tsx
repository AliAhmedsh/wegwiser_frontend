import {
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface LineChartProps {
  data?: Array<{
    date: string;
    value: number;
  }>;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  const defaultData = [
    { date: '2023-12-08', value: 12 },
    { date: '2023-12-09', value: 19 },
    { date: '2023-12-10', value: 30 },
    { date: '2023-12-11', value: 25 },
    { date: '2023-12-12', value: 32 },
    { date: '2023-12-13', value: 28 },
    { date: '2023-12-14', value: 35 },
  ];

  const chartDataToUse = data || defaultData;

  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: chartDataToUse.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Engagement',
        data: chartDataToUse.map(item => item.value),
        fill: true,
        showLine: false,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'black',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        pointBorderWidth: 1,
        pointBorderColor: '#fff',
        pointHoverRadius: 4,
        pointBackgroundColor: '#000',
        pointHoverBackgroundColor: '#000',
        pointHoverBorderWidth: 0,
        pointStyle: 'circle',
      },
    ],
  });

  // Update chart data when data prop changes
  useEffect(() => {
    const chartDataToUse = data || defaultData;
    setChartData({
      labels: chartDataToUse.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Engagement',
          data: chartDataToUse.map(item => item.value),
          fill: true,
          showLine: false,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'black',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 2,
          pointBorderWidth: 1,
          pointBorderColor: '#fff',
          pointHoverRadius: 4,
          pointBackgroundColor: '#000',
          pointHoverBackgroundColor: '#000',
          pointHoverBorderWidth: 0,
          pointStyle: 'circle',
        },
      ],
    });
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const ctx = chart.ctx;
    const height = chart.chartArea?.bottom || chart.height || 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0.6, '#BDBDBD');
    gradient.addColorStop(1, 'rgba(175, 175, 175, 0)');

    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((ds) => ({
        ...ds,
        backgroundColor: gradient,
      })),
    }));
  }, []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    scales: {
      y: {
        position: 'right',
        beginAtZero: false,
        grid: {
          color: '#b1b1b1',
          lineWidth: 0.5,
          drawTicks: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: true,
          color: 'black',
          width: 0.5,
        },
        title: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <div className="w-full rounded overflow-hidden">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
