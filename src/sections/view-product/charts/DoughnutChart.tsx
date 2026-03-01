import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Plugin,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FeedbackData {
  positive: number;
  negative: number;
  neutral: number;
}

interface DoughnutChartProps {
  data?: FeedbackData;
}

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

const defaultFeedbackData = {
  positive: 60,
  negative: 20,
  neutral: 20
};

const createChartData = (feedbackData: FeedbackData) => {
  return {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: ' ',
        data: [feedbackData.positive, feedbackData.negative, feedbackData.neutral],
        backgroundColor: ['#5EC130', '#FF4B4B', '#FFD745'],
        borderWidth: 0,
      },
    ],
  };
};

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
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
  cutout: '50%',
  animation: {
    animateRotate: true,
    duration: 1000,
    easing: 'easeInOutQuart',
  },
};

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data = defaultFeedbackData,
}) => {
  const chartData = createChartData(data);

  return (
    <div className="w-full relative h-full max-w-sm mx-auto flex flex-col">
      <p className="text-[11.5px] font-semibold text-gray-800">Feedback</p>
      <div className="w-full">
        <Doughnut
          data={chartData}
          options={{
            ...options,
            layout: {
              padding: {
                left: 28,
                right: 28,
              },
            },
          }}
          plugins={[whiteCircleLabelPlugin]}
        />
      </div>
      <div className="flex gap-2 items-start space-y-1 flex-wrap">
        {chartData.labels?.map((label, i) => (
          <div key={i} className="flex items-center text-[10px] text-gray-800">
            <span
              className="w-2 h-2 mr-2 rounded-full inline-block"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}
            ></span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );

};

export default DoughnutChart;
