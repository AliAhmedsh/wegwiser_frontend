import { useProductStore } from '@/entities/product/store';
import { useVehiclesByProduct } from '@/lib/api/hooks/useVehicle';
import { useEffect, useRef, useState } from 'react';

interface Vehicle {
  id: number;
  name: string;
}

interface VehicleMultiSelectProps {
  selectedVehicleIds: number[];
  onVehicleChange: (vehicleIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function VehicleMultiSelect({
  selectedVehicleIds,
  onVehicleChange,
  placeholder = "Select vehicles...",
  disabled = false
}: VehicleMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { chosenProduct } = useProductStore();

  // Fetch vehicles for the current product
  const { data: vehiclesData, isLoading, error } = useVehiclesByProduct(chosenProduct?.id || 0);

  const vehicles: Vehicle[] = vehiclesData?.vehicles || [];



  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVehicleToggle = (vehicleId: number) => {
    const isSelected = selectedVehicleIds.includes(vehicleId);
    if (isSelected) {
      onVehicleChange(selectedVehicleIds.filter(id => id !== vehicleId));
    } else {
      onVehicleChange([...selectedVehicleIds, vehicleId]);
    }
  };

  const getSelectedVehicleNames = () => {
    const selectedVehicles = vehicles.filter(vehicle =>
      selectedVehicleIds.includes(vehicle.id)
    );
    return selectedVehicles.map(vehicle => vehicle.name).join(', ');
  };

  const displayText = selectedVehicleIds.length > 0
    ? getSelectedVehicleNames()
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-0 py-1 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2 focus:border-gray-600 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        style={{
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: '#535354',
          opacity: 0.5,
          fontSize: '16px',
          fontFamily: 'Poppins',
          minHeight: '24px',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedVehicleIds.length === 0 ? 'text-gray-400' : ''}>
          {displayText}
        </span>
        <span className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#535354"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading vehicles...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm ? 'No vehicles found matching your search' : (
                <div>
                  <div>No vehicles available</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Create vehicles for this product first
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Search input */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Vehicle options */}
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicleIds.includes(vehicle.id);
                return (
                  <div
                    key={vehicle.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => handleVehicleToggle(vehicle.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => { }} // Handled by parent div click
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{vehicle.name}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
