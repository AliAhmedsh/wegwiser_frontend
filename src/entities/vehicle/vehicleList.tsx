import React from 'react';
import { VehicleListProps } from './types';
import PeopleCardList from '@/shared/ui/peopleCardList';
import { motion } from 'framer-motion';
import GaugeComponent from 'react-gauge-component';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const VehicleList: React.FC<VehicleListProps> = ({
  vehicleInfo,
  id,
  composite,
  size,
  members = [],
  isSelected = false,
  isProposed = false,
  status,
  onDelete,
}) => {

  let widthStyle: string;

  switch (size) {
    case 'tiny':
      widthStyle = '200px';
      break;
    case 'medium':
      widthStyle = '250px';
      break;
    case 'big':
      widthStyle = '300px';
      break;
  }

  const getBackgroundColor = () => {
    if (isSelected) {
      return 'bg-[#E0E7FF]';
    }
    return 'bg-[#EAEDF2]';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && status === 'DRAFT') {
      onDelete(id);
    }
  };

  const content = (
    <div
      className={`px-3 py-4 rounded-[16px] min-w-[250px] ${getBackgroundColor()} transition-all duration-200 relative z-0 ${
        isSelected && status !== 'DRAFT' && status !== 'WAITING_FOR_APPROVAL' ? 'ring-2 ring-[#4A7DFF]' : ''
      }`}
      key={id}
      style={{
        width: widthStyle,
        minHeight: 'auto',
        boxShadow: isSelected && status !== 'DRAFT' && status !== 'WAITING_FOR_APPROVAL'
          ? '0px 0px 12px rgba(74, 125, 255, 0.6)'
          : '2px 2px 2px 0px #A7B1C4, -2px -2px 2px 0px #FFFFFF',
      }}
    >
      {/* Background color overlay for proposed vehicles, waiting for approval vehicles, and DRAFT vehicles */}
      {(isProposed || status === 'WAITING_FOR_APPROVAL' || status === 'DRAFT') && (
        <div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{
            backgroundColor: 'rgba(98, 120, 153, 0.5)', // #62789980 with 50% opacity
            zIndex: 0,
          }}
        />
      )}
      {/* "Waiting for approval" text for WAITING_FOR_APPROVAL status vehicles */}
      {status === 'WAITING_FOR_APPROVAL' && !isProposed && (
        <div className="absolute top-2 right-2 bg-[#627899] text-white text-[8px] px-2 py-1 rounded z-20">
          Waiting for approval
        </div>
      )}
      <div className="flex justify-between relative z-0">
        <h3 className="text-[12px] font-bold p-0">
          {vehicleInfo.name.slice(0, 20)}
          {vehicleInfo.name.length > 20 && <>...</>}
        </h3>
        <div>
          <motion.div className="relative mt-[-24px]">
            <GaugeComponent
              value={composite}
              type="semicircle"
              style={{
                width: '40px',
                height: '20px',
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
          </motion.div>
          <div className="text-[8px] mt-4 ml-[-5px] text-muted-foreground">
            COMPOSITE
          </div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[#535354] break-words max-h-10 overflow-y-scroll relative z-0">
        {vehicleInfo.Description}
      </div>
      <div className="grid grid-cols-5 mt-2 relative z-0">
        {members.slice(0, 5).map((member, index) => (
          <PeopleCardList 
            key={member.id}
            id={member.user.id.toString()}
            image={member.user.avatar || '/Ellipse 5.svg'}
            shortName={member.user.name ? member.user.name.split(' ').map((n: string) => n[0]).join('.') : 'U.U'}
          />
        ))}
      </div>
    </div>
  );

  if (status === 'DRAFT' && onDelete) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {content}
        </ContextMenuTrigger>
        <ContextMenuContent
          className="bg-[#EAEDF2] rounded-[16px] border-0 p-1 min-w-[80px]"
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C4, -2px -2px 2px 0px #FFFFFF',
          }}
        >
          <ContextMenuItem
            variant="destructive"
            onClick={handleDelete}
            className="text-[10px] text-[#FF6B6B] hover:bg-[#E0E7FF] rounded-[8px] px-2 py-1 focus:bg-[#E0E7FF] focus:text-[#FF6B6B]"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return content;
};

export default VehicleList;
