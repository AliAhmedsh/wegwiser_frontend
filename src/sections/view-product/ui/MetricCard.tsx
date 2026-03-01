import Image from 'next/image';

interface MetricCardProps {
  title: string;
  value: string;
  increaseText: string;
  iconSrc: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  increaseText,
  iconSrc,
}) => {
  return (
    <div className="px-6 py-4 flex flex-col justify-between text-[#3D3D3D]">
      <div className="text-left">
        <h4 className="text-lg font-semibold text-[12px] whitespace-nowrap">{title}</h4>
        <p className="text-[24px] font-[500] py-2">{value}</p>
        <div className="flex items-center text-[9px]">
          <Image
            width={10}
            alt="icon"
            height={10}
            src={iconSrc}
            className="inline-block mr-1 w-auto h-auto"
          />
          <span>{increaseText}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
