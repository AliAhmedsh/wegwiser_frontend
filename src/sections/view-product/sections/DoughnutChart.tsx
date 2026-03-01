import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data?: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}

// Plugin to draw labels inside white circles on each doughnut segment
const whiteCircleLabelPlugin: Plugin<'doughnut'> = {
  id: 'whiteCircleLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();

    const meta = chart.getDatasetMeta(0);
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((acc, val) => acc + Number(val), 0);

    meta.data.forEach((element, index) => {
      const arc = element as ArcElement;
      const centerAngle = (arc.startAngle + arc.endAngle) / 2;
      const radius = (arc.outerRadius + arc.innerRadius) / 2;
      const x = arc.x + radius * Math.cos(centerAngle);
      const y = arc.y + radius * Math.sin(centerAngle);

      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.arc(x, y, 14, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = 'bold 5px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const val = Number(dataset.data[index]);
      const percentage = ((val / total) * 100).toFixed(0) + '%';

      ctx.fillText(percentage, x, y);
    });

    ctx.restore();
  },
};

const defaultData = {
  labels: ['Category A', 'Category B', 'Category C'],
  datasets: [
    {
      label: ' ',
      data: [60, 20, 20],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderWidth: 0,
    },
  ],
};

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        color: '#333',
        font: {
          family: 'Inter',
          size: 8,
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 10,
      titleFont: { size: 14 },
      bodyFont: { size: 12 },
    },
  },
  cutout: '60%', // Doughnut thickness
  animation: {
    animateRotate: true,
    duration: 1000,
    easing: 'easeInOutQuart',
  },
};

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data = defaultData,
}) => {
  return (
    <div className="w-full h-full max-w-sm mx-auto">
      <Doughnut
        data={data}
        options={options}
        plugins={[whiteCircleLabelPlugin]}
      />
    </div>
  );
};

export default DoughnutChart;
