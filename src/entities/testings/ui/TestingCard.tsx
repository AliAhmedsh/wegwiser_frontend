import { Testing } from '../model';
import Image from 'next/image';

export default function TestingCard({ 
  testing, 
  showStar = true 
}: { 
  testing: Testing;
  showStar?: boolean;
}) {
  return (
    <div
      className={`flex flex-col bg-[#EAEDF2] hover:bg-[#D9D9D9] rounded-2xl p-2 w-max relative ${
        testing.isHighlighted ? 'bg-gray-200' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-black">•</span>
          <p className="text-sm font-normal text-gray-900">{testing.name}</p>
        </div>
        {showStar && (
          <Image
            src="icons/Stars.svg"
            className="w-auto h-auto cursor-pointer hover:scale-95 transition-all transform active:scale-90"
            alt="start"
            width={20}
            height={20}
          />
        )}
      </div>
      <div className="text-sm font-normal flex flex-wrap items-center gap-1 ml-5">
        <span className="text-gray-400">{testing.status}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400">{testing.description}</span>
      </div>
    </div>
  );
}
