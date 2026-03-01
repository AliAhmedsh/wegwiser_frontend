
import { useConversationStore } from '@/entities/messaging/conversationStore';
import { useMessaging } from '@/entities/messaging/hooks/useMessaging';
import { useProductStore } from '@/entities/product/store';
import Spinner from '@/shared/ui/Spinner';
import React, { useEffect, useRef, useState } from 'react';

interface AddPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPeople: (people: string[]) => void;
}

const AddPeopleModal: React.FC<AddPeopleModalProps> = ({ isOpen, onClose, onAddPeople }) => {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const { people, isLoading, error, fetchUsers, clearError } = useConversationStore();
  const { chosenProduct } = useProductStore();
  const { currentUser } = useMessaging(); // Updated to support filter popup

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUsers(chosenProduct?.id, currentUser.id);
    }
  }, [isOpen, fetchUsers, chosenProduct?.id, currentUser]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterPopup) {
        const target = event.target as Node;
        const isInsideFilterButton = filterButtonRef.current && filterButtonRef.current.contains(target);


        const filterPopup = document.querySelector('[data-filter-popup]');
        const isInsideFilterPopup = filterPopup && filterPopup.contains(target);


        if (!isInsideFilterButton && !isInsideFilterPopup) {
          setShowFilterPopup(false);
        }
      }
    };

    if (showFilterPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPopup]);


  if (!isOpen) return null;

  const handleSelectPerson = (personId: string) => {
    setSelectedPeople((prevSelected) =>
      prevSelected.includes(personId)
        ? prevSelected.filter((id) => id !== personId)
        : [...prevSelected, personId]
    );
  };

  const handleAddClick = async () => {
    setIsAdding(true);
    try {
      await onAddPeople(selectedPeople);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const clearAllFilters = () => {
    setSelectedDepartments([]);
  };

  const applyFilters = () => {
    setShowFilterPopup(false);
  };


  const getDepartmentFromPosition = (position: string): string => {
    const positionLower = position.toLowerCase();
    if (positionLower.includes('engineer') || positionLower.includes('developer') || positionLower.includes('backend') || positionLower.includes('frontend') || positionLower.includes('qa')) {
      return 'Engineering';
    } else if (positionLower.includes('design') || positionLower.includes('ui') || positionLower.includes('ux')) {
      return 'Design';
    } else if (positionLower.includes('product') || positionLower.includes('manager') || positionLower.includes('pm')) {
      return 'Product';
    }
    return 'Other';
  };

  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartments.length === 0 ||
      selectedDepartments.includes(getDepartmentFromPosition(person.position));
    return matchesSearch && matchesDepartment;
  });

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        data-add-people-modal
        className="absolute top-[66px] right-[18px] z-50 bg-white rounded-lg shadow-xl flex flex-col px-4 pb-4 pt-3 w-[320px] max-h-[400px]"
      >
      <h2 className="text-base/loose font-bold mb-4">Add people</h2>
      <div className="relative flex items-center justify-between rounded-3xl">
        <div className='w-[190px] h-[27px] relative flex  '>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 absolute ' viewBox="0 0 22 22" fill="none">
            <path d="M19.7364 18.764L15.4335 14.462C16.6806 12.9647 17.3025 11.0443 17.1698 9.10013C17.037 7.15601 16.1599 5.33789 14.7208 4.02401C13.2817 2.71012 11.3915 2.00163 9.44337 2.0459C7.49522 2.09018 5.63914 2.88382 4.26123 4.26172C2.88333 5.63963 2.08969 7.49571 2.04541 9.44386C2.00114 11.392 2.70964 13.2822 4.02352 14.7213C5.33741 16.1604 7.15552 17.0375 9.09965 17.1703C11.0438 17.303 12.9642 16.6811 14.4615 15.434L18.7635 19.7368C18.8274 19.8007 18.9033 19.8514 18.9867 19.886C19.0702 19.9205 19.1596 19.9383 19.25 19.9383C19.3403 19.9383 19.4297 19.9205 19.5132 19.886C19.5967 19.8514 19.6725 19.8007 19.7364 19.7368C19.8002 19.673 19.8509 19.5971 19.8855 19.5137C19.92 19.4302 19.9378 19.3408 19.9378 19.2504C19.9378 19.1601 19.92 19.0707 19.8855 18.9872C19.8509 18.9037 19.8002 18.8279 19.7364 18.764ZM3.43745 9.62544C3.43745 8.40167 3.80034 7.20538 4.48023 6.18785C5.16013 5.17032 6.12648 4.37725 7.2571 3.90894C8.38772 3.44062 9.63182 3.31809 10.8321 3.55683C12.0323 3.79558 13.1348 4.38488 14.0002 5.25022C14.8655 6.11555 15.4548 7.21806 15.6936 8.41832C15.9323 9.61858 15.8098 10.8627 15.3415 11.9933C14.8731 13.1239 14.0801 14.0903 13.0625 14.7702C12.045 15.4501 10.8487 15.8129 9.62495 15.8129C7.98448 15.8111 6.41173 15.1586 5.25174 13.9987C4.09175 12.8387 3.43927 11.2659 3.43745 9.62544Z" fill="#18181880" />
          </svg>
          <input
            type="text"
            placeholder="Search here"
            className="w-[190px] h-[27px] font-normal text-sm pl-6.5 pr-10 focus:outline-none bg-transparent border-b text-[#181818] pt-0 pb-0.3 -translate-y-0.5"
            style={{
              borderBottomColor: '#8B8B8B',
              borderBottomWidth: '1px',
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5 absolute right-0.5' viewBox="0 0 18 19" fill="none">
            <path d="M9 0C4.02817 0 0 4.04225 0 9.01408C0 13.9859 4.02817 18.0282 9 18.0282C13.9718 18.0282 18 13.9859 18 9.01408C17.9859 4.04225 13.9577 0 9 0ZM9 17.2817C4.43662 17.2817 0.746479 13.5775 0.746479 9.01408C0.746479 4.4507 4.43662 0.746479 9 0.746479C13.5493 0.746479 17.2535 4.4507 17.2535 9.01408C17.2394 13.5775 13.5493 17.2817 9 17.2817ZM8.95775 4.05634L4.6338 8.38028L5.16901 8.91549L8.61972 5.46479V14.6479H9.3662V5.5493L12.7465 8.92958L13.2817 8.39437L8.95775 4.05634Z" fill="#627899" />
          </svg>
        </div>
        <button
          ref={filterButtonRef}
          className="text-gray-500 hover:text-gray-700 relative cursor-pointer"
          onClick={() => setShowFilterPopup(!showFilterPopup)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" strokeWidth={1} stroke="currentColor" className="w-5 h-5" viewBox="0 0 20 22" fill="none">
            <path d="M11.8119 20.9266L7.68965 18.1633C7.55736 18.0734 7.49121 17.9386 7.49121 17.7813V10.6151L1.09852 1.7415C0.988274 1.58422 0.966226 1.40446 1.05442 1.24717C1.14261 1.08988 1.29696 1 1.4513 1H18.558C18.7344 1 18.8887 1.08988 18.9549 1.24717C19.021 1.40445 19.021 1.58421 18.9108 1.71885L12.5176 10.6152V20.5447C12.5176 20.7245 12.4294 20.8593 12.2751 20.9492C12.2089 20.9941 12.1428 20.9941 12.0546 20.9941C11.9664 21.0164 11.8782 20.9715 11.8121 20.9267L11.8119 20.9266ZM2.3327 1.92055L8.30665 10.2105C8.37279 10.3003 8.39484 10.3902 8.39484 10.4801V17.5344L11.5912 19.6911V10.4804C11.5912 10.3905 11.6133 10.2782 11.6794 10.2108L17.6534 1.92087L2.3327 1.92055Z" fill="black" stroke="#D9D9D9" />
          </svg>

          {/* Filter Popup */}
          {showFilterPopup && (
            <div
              data-filter-popup
              className="absolute top-8 right-0 bg-white p-4 z-60 flex flex-col overflow-hidden"
              style={{
                borderRadius: '12px',
                background: '#FFF',
                boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.15) inset',
                width: '549px',
                height: '224px',
                flexShrink: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3
                  className="font-semibold"
                  style={{
                    color: '#000',
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '140%'
                  }}
                >
                  Filter by
                </h3>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                    <path d="M11.8332 1.84199L10.6582 0.666992L5.99984 5.32533L1.3415 0.666992L0.166504 1.84199L4.82484 6.50033L0.166504 11.1587L1.3415 12.3337L5.99984 7.67533L10.6582 12.3337L11.8332 11.1587L7.17484 6.50033L11.8332 1.84199Z" fill="black" />
                  </svg>
                </button>
              </div>

              <button
                onClick={clearAllFilters}
                className="mb-6 hover:bg-gray-50"
                style={{
                  display: 'flex',
                  width: '140px',
                  height: '34px',
                  padding: '12px 16px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  borderRadius: '12px',
                  border: '1px solid #627899',
                  color: 'var(--Text-Dark-Grey, #535354)',
                  fontFamily: 'Poppins',
                  fontSize: '13.284px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '19.927px'
                }}
              >
                Clear all filters
              </button>

              <div className="flex-1 flex items-center justify-start mb-6 w-full">
                <div className="flex items-center w-full">
                  <label className="text-sm font-medium text-gray-700 mr-8">Department:</label>
                  <div className="flex justify-between flex-1">
                    {['Product', 'Design', 'Engineering'].map((dept) => (
                      <label key={dept} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleDepartmentToggle(dept);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mr-2 w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          style={{
                            accentColor: 'rgb(98, 120, 153)'
                          }}
                        />
                        <span className="text-sm text-gray-700">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-auto">
                <button
                  onClick={applyFilters}
                  className="shadow-[2px_2px_2px_rgba(167,177,196,0.6),_-2px_-2px_2px_rgba(255,255,255,1)] bg-[#EAEDF2] text-[#535354] text-sm font-semibold rounded-[12px] hover:bg-gray-300 transition duration-300"
                  style={{
                    display: 'flex',
                    width: '95px',
                    height: '34px',
                    padding: '12px 22px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    flexShrink: 0
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="flex-grow overflow-y-scroll grid grid-cols-2 gap-4 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center py-8">
            <div className="text-gray-500 flex items-center">
              <Spinner size="sm" className="mr-2" />
              Loading users...
            </div>
          </div>
        ) : error ? (
          <div className="col-span-2 flex flex-col justify-center items-center py-8">
            <div className="text-red-500 mb-2">{error}</div>
            <button
              onClick={() => { clearError(); fetchUsers(chosenProduct?.id, currentUser?.id); }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        ) : !chosenProduct ? (
          <div className="col-span-2 flex justify-center items-center py-8">
            <div className="text-gray-500 text-center">
              <p className="text-sm font-medium mb-1">No product selected</p>
              <p className="text-xs">Please select a product to see team members</p>
            </div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="col-span-2 flex justify-center items-center py-8">
            <div className="text-gray-500 text-center">
              <p className="text-sm font-medium mb-1">No users found</p>
              <p className="text-xs">No team members available for the selected product</p>
            </div>
          </div>
        ) : (
          filteredPeople.map((person) => (
            <div
              key={person.id}
              className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedPeople.includes(person.id) ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectPerson(person.id)}
            >
              <div className="w-9 h-9 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <p className="font-semibold text-gray-800">{person.name}</p>
                <p className="text-sm text-gray-500">{person.position}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="self-end max-w-25 mt-4 w-full py-2 px-4 shadow-[2px_2px_2px_rgba(167,177,196,0.6),_-2px_-2px_2px_rgba(255,255,255,1)] bg-[#EAEDF2] text-[#535354] text-sm font-semibold rounded-[12px] hover:bg-gray-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAddClick}
        disabled={isAdding || selectedPeople.length === 0}
      >
        {isAdding ? 'Adding...' : 'Add'}
      </button>
      </div>
    </>
  );
};

export default AddPeopleModal;
