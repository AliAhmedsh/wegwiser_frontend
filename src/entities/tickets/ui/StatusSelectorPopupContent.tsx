import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { useUpdateTicketMutation } from '@/entities/tickets/api/hooks';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

const Inter400 = Inter({
  weight: '400',
  subsets: ['latin'],
});

interface StatusSelectorPopupContentProps {
  ticketId: string;
  productId: number;
  currentStatus: string;
  onClose: () => void;
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

export default function StatusSelectorPopupContent({
  ticketId,
  productId,
  currentStatus,
  onClose,
}: StatusSelectorPopupContentProps) {
  const { selectedVehicleId } = useSelectedVehicleStore();
  const updateTicketMutation = useUpdateTicketMutation();
  const [selectedStatus, setSelectedStatus] = useState<string>(normalizeStatus(currentStatus));

  useEffect(() => {
    setSelectedStatus(normalizeStatus(currentStatus));
  }, [currentStatus]);

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

  return (
    <div className={`min-w-[200px] ${Inter400.className}`}>
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
            className={`px-3 py-1 cursor-pointer hover:bg-[#E9ECF1] text-[14px] leading-5 transition-colors ${
              isSelected ? 'bg-[#E9ECF1] font-semibold' : ''
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? 'Updating...' : option.label}
          </div>
        );
      })}
    </div>
  );
}

