import { useProductStore } from '@/entities/product';
import { useTicketsQuery } from '@/entities/tickets/api/hooks';
import { TicketCard } from '@/entities/tickets/ui';
import AddTicketModal from '@/entities/tickets/ui/AddTicketModal';
import { useWorkspaceStore } from '@/entities/workspace';
import { useIsEngineer } from '@/lib/utils/userRole';
import Spinner from '@/shared/ui/Spinner';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const Poppins600 = Poppins({
  weight: '600',
  subsets: ['latin'],
});

export default function TicketsTab() {
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const chosenProduct = useProductStore((state) => state.chosenProduct);
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { user } = useLoginStore();
  const canManageTickets = useIsEngineer();

  const { data: ticketsData, isLoading, error } = useTicketsQuery(chosenProduct?.id || 0, { vehicleId: selectedVehicleId || undefined });
  // Only query if vehicleId is available (backend requires it)
  const tickets = ticketsData?.tickets || [];

  const handleAddNew = () => {
    if (!chosenProduct) {
      return; // Don't show alert, let the UI handle it
    }

    if (!chosenProduct.id) {
      return; // Don't show alert, let the UI handle it
    }

    setIsAddTicketModalOpen(true);
  };

  // Show error state
  if (error) {
    return (
      <div className="w-[98%] h-[100%] flex items-center justify-center">
        <div className="text-red-500">Error loading tickets: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="w-[98%] h-[100%] flex flex-col justify-between items-start">
      <div className="h-full flex flex-col gap-4">
        {chosenProduct && canManageTickets && (
          <div className="flex gap-4">
            <button
              className={`bg-[#EAEDF2] rounded-[12px] h-[35px] w-[100px] text-[14px] text-gray-700 font-semibold border-1 border-[#627899] cursor-pointer ${Poppins600.className}`}
              onClick={handleAddNew}
            >
              Add New
            </button>
            <button
              className={`bg-[#EAEDF2] rounded-[12px] h-[35px] w-[185px] text-[14px] text-gray-700 font-semibold shadow cursor-pointer ${Poppins600.className}`}
              style={{
                boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              }}
              onClick={openWorkspace}
            >
              Engineering Workspace
            </button>
          </div>
        )}
        <div className="flex w-full h-full mx-auto overflow-y-auto overflow-hidden pr-6 pb-6 p-1 mb-4 custom-scrollbar-second">
          {isLoading && tickets.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                Loading tickets...
              </div>
            </div>
          ) : !chosenProduct ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center ml-58 mt-8">
                <p className="text-sm font-medium mb-1">No product selected</p>
                <p className="text-xs">Please select a product to view tickets</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className=" h-full flex items-center justify-end text-gray-500 text-right pr-8">
              No tickets found. Click "Add New" to create your first ticket.
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 w-full h-full">
              {tickets.map((ticket, index) => (
                <div key={index}>
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isHighlighted={false}
                  />
                </div>
              ))}
              {isLoading && tickets.length > 0 && (
                <div className="w-full flex justify-center py-6">
                  <Spinner size="sm" className="text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddTicketModal
        isOpen={isAddTicketModalOpen}
        onClose={() => setIsAddTicketModalOpen(false)}
        productId={chosenProduct?.id || 0}
      />
    </div>
  );
}
