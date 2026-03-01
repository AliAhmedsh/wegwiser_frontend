import React from 'react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface TicketActionsMenuProps {
  onClose: () => void;
  onReassign: () => void;
}

export default function TicketActionsMenu({
  onClose,
  onReassign,
}: TicketActionsMenuProps) {
  return (
    <DropdownMenuContent className="w-70 text-sm font-normal bg-white rounded-md shadow-lg text-gray-800 py-3">
      <DropdownMenuItem
        className="cursor-pointer hover:bg-gray-100"
        onClick={onClose}
      >
        Take action in workspace
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer hover:bg-gray-100"
        onClick={onClose}
      >
        Dismiss ticket
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer hover:bg-gray-100"
        onClick={onReassign}
      >
        Re-assign ticket
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
