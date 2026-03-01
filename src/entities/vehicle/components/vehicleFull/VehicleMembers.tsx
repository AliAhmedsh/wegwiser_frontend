import Image from 'next/image';
import WorkerList from '@/entities/worker/workerList';
import ShadowWrapper from '../shared/ShadowWrapper';
import { AddWorkers } from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { WorkerListProps } from '@/entities/worker/type';

const VehicleMembers: React.FC<{
  setShowUserInfo: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  workersData: WorkerListProps[];
  vehicleID: string;
  productID: string;
  vehicleName: string;
}> = ({ setShowUserInfo, setUserId, workersData, vehicleID, vehicleName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onUserClick = (id: string) => {
    setShowUserInfo(true);
    setUserId(id);
  };

  const onUserDoubleClick = (id: string) => {
    // Double click also opens user info (same as single click)
    setShowUserInfo(true);
    setUserId(id);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [workersData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
      containerRef.current.style.userSelect = 'none';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.removeProperty('user-select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only prevent horizontal scrolling if we're dragging horizontally
    // Allow vertical scrolling to work naturally
    if (e.deltaX !== 0 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // Horizontal scroll - allow it for horizontal dragging
      e.preventDefault();
    }
    // For vertical scrolling (deltaY), let it work naturally
  };

  const renderSection = (filtered: WorkerListProps[]) => {
    // Sort: team leads first, then others
    const sorted = [...filtered].sort((a, b) => {
      if (a.isTeamLead && !b.isTeamLead) return -1;
      if (!a.isTeamLead && b.isTeamLead) return 1;
      return 0;
    });

    return (
      <div className="flex min-h-[25%] gap-2 justify-end">
        <div className="w-10 h-10 flex self-center justify-end shrink-0">
          <AddWorkers
            vehicleName={vehicleName}
            vehicleID={vehicleID}
            title="Add new members"
          >
            <ShadowWrapper>
              <Image
                src="/icons/Add.svg"
                alt="Add member"
                width={25}
                height={25}
                className="rounded-full"
              />
            </ShadowWrapper>
          </AddWorkers>
        </div>

        <div className="flex">
          <div className="inline-flex gap-x-3">
            {sorted.map((worker) => (
              <div
                key={worker.id}
                className="cursor-pointer inline-block"
                onClick={() => onUserClick(worker.id)}
              >
                <WorkerList 
                  {...worker} 
                  onDoubleClick={() => onUserDoubleClick(worker.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-x-auto overflow-y-auto cursor-grab"
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div className="flex flex-col justify-around h-full pb-3 gap-y-2 pt-2 pr-2 min-w-max">
        {renderSection(workersData.filter((w) => w.position === 'PM'))}
        {renderSection(workersData.filter((w) => w.position === 'UI/UX'))}
        {renderSection(workersData.filter((w) => w.position === 'ENGINEER/QA'))}
        {/* Show all other members (including "Member" role) that don't match specific roles */}
        {(() => {
          const otherMembers = workersData.filter((w) => 
            w.position !== 'ENGINEER/QA' && 
            w.position !== 'UI/UX' && 
            w.position !== 'PM' &&
            w.position !== 'FACILITATOR' // Exclude facilitators (shown separately)
          );
          return otherMembers.length > 0 ? renderSection(otherMembers) : null;
        })()}
      </div>
    </div>
  );
};

export default VehicleMembers;
