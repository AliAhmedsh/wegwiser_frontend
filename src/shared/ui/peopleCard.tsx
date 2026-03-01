import React from 'react';
import Image from 'next/image';

interface PeopleCardProps {
  name: string;
  role: string;
  filledLevels: number;
  imageLink: string;
  isChosen?: boolean;
  isPlusIcon?: boolean;
  isLargeAvatar?: boolean;
  matchScore?: number; // AI skill match score (0-100)
  onDoubleClick?: (e?: React.MouseEvent) => void;
}

const PeopleCard: React.FC<PeopleCardProps> = ({
  name,
  role,
  filledLevels = 0,
  imageLink,
  isChosen,
  isPlusIcon,
  isLargeAvatar,
  matchScore,
  onDoubleClick
}) => {
  
  const imageSrc = imageLink && imageLink.trim() !== '' ? imageLink : '/Ellipse 5.svg';
  
  // Ensure filledLevels is a valid number between 0 and 5
  const validFilledLevels = Math.max(0, Math.min(5, Number(filledLevels) || 0));
  
  return (
  <div
    className={` relative w-[155px] h-[55px] bg-[#EAEDF2] ${
      isChosen ? 'border border-black' : ''
    }     rounded-xl p-2 flex flex-row gap-2 items-center h-[55px] w-[155px] ${
      (validFilledLevels === 5 && 'select-none cursor-not-allowed') ||
      'cursor-pointer'
    }`}
    style={{
      boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
    }}
    onDoubleClick={(e) => {
      e.stopPropagation();
      if (onDoubleClick) {
        onDoubleClick(e);
      }
    }}
  >
    <div className="w-10 h-10 flex justify-center items-center overflow-hidden rounded-full">
      <Image src={imageSrc} width={40} height={40} alt="" />
    </div>
    <div className="flex-1">
      <div className="font-medium text-sm text-gray-900">{name}</div>
      <div className="font-normal text-xs text-gray-500">{role}</div>
    </div>
    {matchScore !== undefined && (
      <div 
        className="absolute -top-1.5 -left-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
        style={{ backgroundColor: matchScore >= 70 ? '#22C55E' : matchScore >= 40 ? '#F59E0B' : '#EF4444' }}
        title={`Skill match: ${matchScore}%`}
      >
        {matchScore}%
      </div>
    )}
    <div className="flex flex-col justify-end items-center h-full ml-2">
      <div className="flex flex-col gap-[0.5px]">
        {[0, 1, 2, 3, 4].map((i) => {
          // Fill from bottom to top (like a battery charging) - consistent with WorkerList
          // index: 0=top bar, 4=bottom bar
          // validFilledLevels=1 means fill bottom bar (index 4)
          // validFilledLevels=2 means fill bottom 2 bars (index 3,4)
          // Formula: bar at index i is filled if i >= (totalBars - validFilledLevels)
          const totalBars = 5;
          const filledThreshold = totalBars - validFilledLevels;
          const isFilled = i >= filledThreshold;
          
          // If all 5 bars are filled, show red color, otherwise green
          const barColor = validFilledLevels === 5 ? '#FF5656' : '#6DD13B'; // red : green
          
          return (
          <div
            key={i}
            className={`w-[6px] h-[3px] rounded-[1px] ${
                isFilled
                ? ''
                : 'bg-[#EAEDF2] border-[0.0001px] border-[#627899]/50'
            }`}
            style={isFilled ? { backgroundColor: barColor } : {}}
          />
          );
        })}
      </div>
    </div>
    {isPlusIcon && (<div className="absolute -top-1 -right-3 w-6 h-6">
      <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4' viewBox="0 0 15 16" fill="none">
        <circle cx="7.5" cy="7.99951" r="7.5" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.97522 4.79004H8.0246V7.47522H10.7098V8.5246H8.0246V11.2098H6.97522V8.5246H4.29004V7.47522H6.97522V4.79004Z" fill="black"/>
        <mask id="mask0_3694_7645" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="16">
          <path d="M0 0.499512H15V15.4995H0V0.499512Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_3694_7645)">
          <path fillRule="evenodd" clipRule="evenodd" d="M7.50015 0.499512C11.6359 0.499512 15.0003 3.86387 15.0003 7.99966C15.0003 12.1354 11.6359 15.4998 7.50015 15.4998C3.36436 15.4998 0 12.1354 0 7.99966C0 3.86387 3.36436 0.499512 7.50015 0.499512ZM7.50015 1.73405C10.9571 1.73405 13.7656 4.54273 13.7656 7.99951C13.7656 11.4565 10.9569 14.265 7.50015 14.265C4.04319 14.265 1.23469 11.4563 1.23469 7.99951C1.23469 4.54255 4.04337 1.73405 7.50015 1.73405Z" fill="black"/>
        </g>
      </svg>
    </div>)}
  </div>
  );
};

export default PeopleCard;
