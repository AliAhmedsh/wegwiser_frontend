import Image from 'next/image';
import { useEffect, useState } from 'react';
import { WorkerListProps } from './type';
import useUserStore from './api/mock/userStore';

interface WorkerListComponentProps extends WorkerListProps {
  onDoubleClick?: () => void;
}

const WorkerList: React.FC<WorkerListComponentProps> = ({
  id,
  image,
  name,
  accuratePosition,
  color,
  isManager,
  capacity, // Get capacity from props if available
  onDoubleClick,
  isTeamLead,
  teamLeadBorderColor,
}) => {
  const [activeCount, setActiveCount] = useState(0);
  const totalBars = 5;
  const { users } = useUserStore();

  // Format role text for display - simplify team lead roles
  const getDisplayRole = (role: string, isLead: boolean | undefined): string => {
    if (!isLead) return role;
    
    const roleLower = role.toLowerCase();
    if (roleLower.includes('engineer') || roleLower.includes('qa')) {
      return 'Engineer Lead';
    } else if (roleLower.includes('designer') || roleLower.includes('ui/ux')) {
      return 'Designer Lead';
    } else if (roleLower.includes('pm') || roleLower.includes('product')) {
      return 'Product Lead';
    }
    return role.replace(/team lead/gi, 'Lead').replace(/  /g, ' ').trim();
  };

  useEffect(() => {
    const capacityFromProps = capacity;
    const capacityFromStore = users.find((u) => u.id === id)?.capacity || [];
    
    const finalCapacity = capacityFromProps !== undefined ? capacityFromProps : capacityFromStore;
    
    const capacityLength = Array.isArray(finalCapacity) ? finalCapacity.length : 0;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔋 WorkerList Debug:', {
        id,
        name,
        capacityFromProps: capacityFromProps?.length || 0,
        capacityFromStore: capacityFromStore?.length || 0,
        finalCapacityLength: capacityLength,
        activeCount: Math.min(capacityLength, totalBars),
        hasCapacityProp: capacity !== undefined
      });
    }
    
    setActiveCount(
      Math.min(capacityLength, totalBars)
    );
  }, [users, id, capacity, name]);

  return (
    <div
      key={id}
      className="rounded-[10px] w-[100px] h-[130px] p-2.5 flex flex-col items-center shadow-md relative cursor-pointer"
      style={{
        boxShadow: `2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF`,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) {
          onDoubleClick();
        }
      }}
    >
      {(() => {
        const roleLower = (accuratePosition || '').toLowerCase();
        let dotColor = color; // Default color
        
        // Determine dot color based on role (matching invite members screen)
        const getRoleDotColor = (role: string) => {
          const r = role.toLowerCase();
          
          // PM - #E182B5
          if (r.includes('pm') || r.includes('product manager') || r.includes('product_manager')) {
            return '#E182B5';
          }
          // Designer/UI/UX - #8AD5E7
          else if (r.includes('designer') || r.includes('ui/ux') || r.includes('design')) {
            return '#8AD5E7';
          }
          // Engineer/QA - #000
          else if (r.includes('engineer') || r.includes('qa') || r.includes('developer')) {
            return '#000';
          }
          return color; // Default to original color
        };
        
        if (isTeamLead && teamLeadBorderColor) {
          dotColor = teamLeadBorderColor;
        } else {
          dotColor = getRoleDotColor(roleLower);
        }
        
        return (
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        );
      })()}

      {isManager ? (
        <div className="rounded-full p-1" style={{ backgroundColor: color }}>
          <div 
            className="rounded-full overflow-hidden"
            style={isTeamLead && teamLeadBorderColor ? {
              border: `5px solid ${teamLeadBorderColor}`,
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            } : {
              width: '64px',
              height: '64px'
            }}
          >
            <Image
              src={image && image.trim() !== '' ? image : '/icons/user-mock-icon.svg'}
              alt="worker"
              width={64}
              height={64}
              className="rounded-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      ) : (
        <div 
          className="rounded-full overflow-hidden"
          style={isTeamLead && teamLeadBorderColor ? {
            border: `5px solid ${teamLeadBorderColor}`,
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          } : {
            width: '64px',
            height: '64px'
          }}
        >
          <Image
            src={image && image.trim() !== '' ? image : '/Ellipse 5.svg'}
            alt="worker"
            width={64}
            height={64}
            className="rounded-full object-cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      <div className="flex justify-between w-full text-center mt-2">
        <div className="opacity-0">.</div>
        <div>
          <div className="text-[8px]">{getDisplayRole(accuratePosition, isTeamLead)}</div>
          <div className="text-[10px]">{name}</div>
        </div>
        {!isManager ? (
          <div className="flex flex-col justify-end mt-1.5 gap-[1px] h-[15px]">
            {[...Array(totalBars)].map((_, index) => {
              // Fill from bottom to top (like a battery charging)
              // index: 0=top bar, 4=bottom bar
              // activeCount=1 means fill bottom bar (index 4)
              // activeCount=2 means fill bottom 2 bars (index 3,4)
              const filledThreshold = totalBars - activeCount;
              const isFilled = index >= filledThreshold;
              
              // If all 5 bars are filled, show red color, otherwise green
              const barColor = activeCount === 5 ? '#FF5656' : '#4CAF50'; // red : green
              
              return (
              <div
                key={index}
                className={`w-[6px] h-[3px] rounded-sm ${
                    isFilled ? '' : 'bg-[#DCE1E8]'
                }`}
                style={isFilled ? { backgroundColor: barColor } : {}}
              />
              );
            })}
          </div>
        ) : (
          <div className="opacity-0">.</div>
        )}
      </div>
    </div>
  );
};

export default WorkerList;
