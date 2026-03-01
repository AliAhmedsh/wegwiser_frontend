import { ReassignModal } from '@/entities/reassignModal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Inter } from 'next/font/google';
import { useState, useRef } from 'react';
import { Ticket } from '../model';
import StatusSelectorPopupContent from './StatusSelectorPopupContent';

// Utility function to format time
const formatTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMs = now.getTime() - created.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If less than 1 minute
  if (diffInMinutes < 1) {
    return 'Just now';
  }

  // If less than 1 hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  // If less than 1 day
  if (diffInHours < 24) {
    return `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`;
  }

  // If 1 day or more, show the date
  return created.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: created.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const Inter400 = Inter({
  weight: '400',
  subsets: ['latin'],
});

type Props = {
  ticket: Ticket;
  isHighlighted: boolean;
};

export default function TicketCard({ ticket, isHighlighted }: Props) {
  const [showReassign, setShowReassign] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const statusButtonRef = useRef<HTMLDivElement>(null);

  const onReassign = () => {
    setIsOpen(false);
    setShowReassign((prev) => !prev);
  };

  return (
    <div
      className={`relative p-3 rounded-2xl transition-colors flex flex-col gap-1 flex-grow w-[202px] min-h-[130px] ${isHighlighted ? 'bg-[#627899] text-white' : 'bg-gray-200 text-gray-900'
        }`}
      style={{
        boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
      }}
    >
      <div className="font-medium flex items-center justify-between">
        <span
          className={`text-sm font-normal ${isHighlighted ? 'text-[#EAEDF2]' : 'text-gray-900'
            }`}
        >
          {ticket.name}
        </span>
        <div className="relative self-baseline">
          <Popover
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (open === true) {
                setShowReassign(false);
                setShowStatusSelector(false);
              }
            }}
            modal={false}
          >
            <PopoverTrigger asChild>
              <button className="cursor-pointer">...</button>
            </PopoverTrigger>
            <PopoverContent
              data-main-menu="true"
              className={`w-[200px] bg-white text-black z-[1000] rounded-[4px] py-3 text-[14px] leading-7 ${Inter400.className}`}
              onInteractOutside={(e) => {
                // Don't close if clicking on status selector
                const target = e.target as HTMLElement;
                if (target.closest('[data-status-selector]')) {
                  e.preventDefault();
                }
              }}
            >
              <div
                onClick={() => setIsOpen(false)}
                className="hover:bg-[#E9ECF1] px-3 cursor-pointer"
              >
                Take action in workspace
              </div>
              <div
                onClick={() => setIsOpen(false)}
                className="hover:bg-[#E9ECF1] px-3 cursor-pointer"
              >
                Dismiss ticket
              </div>
              <Popover
                open={showStatusSelector}
                onOpenChange={(open) => {
                  setShowStatusSelector(open);
                }}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <div
                    ref={statusButtonRef}
                    onMouseEnter={() => {
                      setShowStatusSelector(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowStatusSelector(true);
                    }}
                    className="hover:bg-[#E9ECF1] px-3 cursor-pointer relative"
                  >
                    Change status →
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  data-status-selector="true"
                  side="right"
                  align="start"
                  sideOffset={8}
                  className={`w-[200px] bg-white text-black z-[1001] rounded-[4px] py-2 text-[14px] leading-5 ${Inter400.className}`}
                  onInteractOutside={(e) => {
                    // Prevent closing when interacting with main menu
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-main-menu]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <StatusSelectorPopupContent
                    ticketId={ticket.id.toString()}
                    productId={ticket.productId}
                    currentStatus={ticket.status}
                    onClose={() => {
                      setShowStatusSelector(false);
                      setTimeout(() => setIsOpen(false), 100);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div
                onClick={onReassign}
                className="hover:bg-[#E9ECF1] px-3 cursor-pointer"
              >
                Re-assign ticket
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        className={`text-xs font-normal flex justify-between ${isHighlighted ? 'text-indigo-100' : 'text-gray-500'
          }`}
      >
        <b
          className={`text-xs font-semibold ${isHighlighted ? 'text-[#EAEDF2]' : 'text-gray-900'
            }`}
        >
          Name
        </b>
        <span>{ticket.status}</span>
      </div>
      <div
        className={`mt-auto mb-2 text-sm leading-snug ${isHighlighted ? 'text-white' : 'text-gray-900'
          }`}
      >
        {ticket.description}
      </div>
      <div
        className={`absolute bottom-2 right-2 text-xs mt-auto font-normal text-right ${isHighlighted ? 'text-indigo-100' : 'text-gray-500'
          }`}
      >
        {formatTime(ticket.createdAt)}
      </div>

      {showReassign && <ReassignModal onClose={() => setShowReassign(false)} productId={ticket.productId} ticketId={ticket.id} />}
    </div>
  );
}
