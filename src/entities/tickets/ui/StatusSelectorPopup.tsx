import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter } from 'next/font/google';
import { useUpdateTicketMutation } from '@/entities/tickets/api/hooks';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

const Inter400 = Inter({
  weight: '400',
  subsets: ['latin'],
});

interface StatusSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  productId: number;
  currentStatus: string;
  position: { x: number; y: number };
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'qa_failed', label: 'QA Failed' },
  { value: 'pending_feedback', label: 'Pending Feedback' },
];

// Helper function to normalize status format (handles both snake_case and space-separated)
const normalizeStatus = (status: string): string => {
  if (!status) return 'pending';
  const normalized = status.toLowerCase().trim();
  // Map common variations to standard format
  if (normalized === 'in progress') return 'in_progress';
  if (normalized === 'pending feedback') return 'pending_feedback';
  if (normalized === 'qa failed') return 'qa_failed';
  return normalized;
};

export default function StatusSelectorPopup({
  isOpen,
  onClose,
  ticketId,
  productId,
  currentStatus,
  position,
}: StatusSelectorPopupProps) {
  const { selectedVehicleId } = useSelectedVehicleStore();
  const updateTicketMutation = useUpdateTicketMutation();
  const [selectedStatus, setSelectedStatus] = useState<string>(normalizeStatus(currentStatus));
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedStatus(normalizeStatus(currentStatus));
  }, [currentStatus]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add slight delay to avoid immediate close on click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleStatusSelect = async (status: string) => {
    const normalizedCurrent = normalizeStatus(currentStatus);
    if (status === normalizedCurrent) {
      onClose();
      return;
    }

    try {
      await updateTicketMutation.mutateAsync({
        ticketId,
        data: {
          status: status as any,
          vehicleId: selectedVehicleId || undefined,
        },
      });
      onClose();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const normalizedCurrentStatus = normalizeStatus(currentStatus);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - transparent, just for click handling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
          />
          {/* Popup */}
          <motion.div
            ref={popupRef}
            data-status-selector="true"
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ duration: 0.15 }}
            className={`fixed z-[9999] bg-white rounded-[4px] shadow-lg py-3 min-w-[200px] ${Inter400.className}`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={() => {
              // Clear any pending close timeout when mouse enters status selector
              // This prevents premature closing when moving from main menu
            }}
            onMouseLeave={(e) => {
              // Only close if mouse leaves the popup completely and doesn't go to main menu
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (!popupRef.current?.contains(relatedTarget)) {
                // Delay closing to allow moving back to main menu
                setTimeout(() => {
                  if (popupRef.current && !popupRef.current.matches(':hover')) {
                    // Check if mouse is over main menu
                    const mainMenu = document.querySelector('[data-main-menu]');
                    if (!mainMenu?.contains(document.activeElement)) {
                      onClose();
                    }
                  }
                }, 300);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {statusOptions.map((option) => {
              const isSelected = option.value === normalizedCurrentStatus;
              const isPending = updateTicketMutation.isPending && selectedStatus === option.value;

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    if (isPending) return;
                    setSelectedStatus(option.value);
                    handleStatusSelect(option.value);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-[#E9ECF1] text-[14px] leading-7 transition-colors ${
                    isSelected ? 'bg-[#E9ECF1] font-semibold' : ''
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPending ? 'Updating...' : option.label}
                </div>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

