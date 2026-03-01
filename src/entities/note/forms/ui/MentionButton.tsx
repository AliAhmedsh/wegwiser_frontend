import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import Spinner from '@/shared/ui/Spinner';
import { useMentionDialog } from '../../hooks/useMentionDialog';
import { formatRole } from '@/lib/utils/formatRole';

interface MentionButtonProps {
  noteId?: string;
  productId?: number;
  onMentionAdded?: () => void;
  isCreateMode?: boolean;
  onMentionsSelected?: (mentions: Array<{ userId?: string; username?: string; email: string }>) => void;
}

export default function MentionButton({ 
  noteId, 
  productId, 
  onMentionAdded,
  isCreateMode = false,
  onMentionsSelected
}: MentionButtonProps) {
  const {
    isOpen,
    searchQuery,
    filteredUsers,
    selectedUsers,
    isLoadingUsers,
    isAddingMentions,
    openDialog,
    closeDialog,
    handleSearchChange,
    toggleUserSelection,
    addMentions
  } = useMentionDialog({
    noteId,
    productId,
    onMentionAdded
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openDialog();
    } else {
      closeDialog();
    }
  };

  const handleMentionAction = async () => {
    if (isCreateMode && onMentionsSelected) {
      onMentionsSelected(selectedUsers.map(user => ({
        userId: user.id,
        username: user.username || user.name,
        name: user.name,
        email: user.email
      })));
      closeDialog();
    } else {
      await addMentions();
    }
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            className="text-[12px] inline-flex items-center justify-center gap-[9px] px-2 py-2 active:scale-95 select-none rounded-[4px] bg-[#627899] text-white cursor-pointer transition-all"
          >
            Mention
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="border-none bg-white p-5 w-[380px]"
          style={{ boxShadow: '0px 0px 4px 0px #00000026 inset' }}
        >
          <div className="font-bold text-lg mb-4">Mention</div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="relative" style={{ width: '250px' }}>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    d="M19.7364 18.764L15.4335 14.462C16.6806 12.9647 17.3025 11.0443 17.1698 9.10013C17.037 7.15601 16.1599 5.33789 14.7208 4.02401C13.2817 2.71012 11.3915 2.00163 9.44337 2.0459C7.49522 2.09018 5.63914 2.88382 4.26123 4.26172C2.88333 5.63963 2.08969 7.49571 2.04541 9.44386C2.00114 11.392 2.70964 13.2822 4.02352 14.7213C5.33741 16.1604 7.15552 17.0375 9.09965 17.1703C11.0438 17.303 12.9642 16.6811 14.4615 15.434L18.7635 19.7368C18.8274 19.8007 18.9033 19.8514 18.9867 19.886C19.0702 19.9205 19.1596 19.9383 19.25 19.9383C19.3403 19.9383 19.4297 19.9205 19.5132 19.886C19.5967 19.8514 19.6725 19.8007 19.7364 19.7368C19.8002 19.673 19.8509 19.5971 19.8855 19.5137C19.92 19.4302 19.9378 19.3408 19.9378 19.2504C19.9378 19.1601 19.92 19.0707 19.8855 18.9872C19.8509 18.9037 19.8002 18.8279 19.7364 18.764ZM3.43745 9.62544C3.43745 8.40167 3.80034 7.20538 4.48023 6.18785C5.16013 5.17032 6.12648 4.37725 7.2571 3.90894C8.38772 3.44062 9.63182 3.31809 10.8321 3.55683C12.0323 3.79558 13.1348 4.38488 14.0002 5.25022C14.8655 6.11555 15.4548 7.21806 15.6936 8.41832C15.9323 9.61858 15.8098 10.8627 15.3415 11.9933C14.8731 13.1239 14.0801 14.0903 13.0625 14.7702C12.045 15.4501 10.8487 15.8129 9.62495 15.8129C7.98448 15.8111 6.41173 15.1586 5.25174 13.9987C4.09175 12.8387 3.43927 11.2659 3.43745 9.62544Z"
                    fill="#181818"
                    fillOpacity="0.5"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-8 pr-10 py-2 pb-1 border-0 border-b focus:outline-none bg-transparent"
                style={{ borderBottomColor: '#8B8B8B' }}
                placeholder="max"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="19"
                  viewBox="0 0 18 19"
                  fill="none"
                >
                  <path
                    d="M9 0C4.02817 0 0 4.04225 0 9.01408C0 13.9859 4.02817 18.0282 9 18.0282C13.9718 18.0282 18 13.9859 18 9.01408C17.9859 4.04225 13.9577 0 9 0ZM9 17.2817C4.43662 17.2817 0.746479 13.5775 0.746479 9.01408C0.746479 4.4507 4.43662 0.746479 9 0.746479C13.5493 0.746479 17.2535 4.4507 17.2535 9.01408C17.2394 13.5775 13.5493 17.2817 9 17.2817ZM8.95775 4.05634L4.6338 8.38028L5.16901 8.91549L8.61972 5.46479V14.6479H9.3662V5.5493L12.7465 8.92958L13.2817 8.39437L8.95775 4.05634Z"
                    fill="#627899"
                  />
                </svg>
              </div>
            </div>
            <div className="cursor-pointer hover:scale-95 transition-all active:scale-85">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="22"
                viewBox="0 0 20 22"
                fill="none"
              >
                <path
                  d="M11.8119 20.9266L7.68965 18.1633C7.55736 18.0734 7.49121 17.9386 7.49121 17.7813V10.6151L1.09852 1.7415C0.988274 1.58422 0.966226 1.40446 1.05442 1.24717C1.14261 1.08988 1.29696 1 1.4513 1H18.558C18.7344 1 18.8887 1.08988 18.9549 1.24717C19.021 1.40445 19.021 1.58421 18.9108 1.71885L12.5176 10.6152V20.5447C12.5176 20.7245 12.4294 20.8593 12.2751 20.9492C12.2089 20.9941 12.1428 20.9941 12.0546 20.9941C11.9664 21.0164 11.8782 20.9715 11.8121 20.9267L11.8119 20.9266ZM2.3327 1.92055L8.30665 10.2105C8.37279 10.3003 8.39484 10.3902 8.39484 10.4801V17.5344L11.5912 19.6911V10.4804C11.5912 10.3905 11.6133 10.2782 11.6794 10.2108L17.6534 1.92087L2.3327 1.92055Z"
                  fill="#000"
                  stroke="#D9D9D9"
                  strokeWidth="1px"
                />
              </svg>
            </div>
          </div>

          <div
            className="max-h-60 overflow-y-auto grid grid-cols-2 gap-4 mb-6 p-3"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D9D9D9 transparent',
            }}
          >
            {isLoadingUsers ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                {searchQuery ? 'No users found' : 'Loading users...'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.some(u => u.id === user.id) ? 'bg-blue-50 border-2 border-blue-200' : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={user.avatar && user.avatar.trim() !== '' ? user.avatar : '/Ellipse 5.svg'}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">{formatRole(user.position || user.role)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedUsers.some(u => u.id === user.id) ? (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleMentionAction}
              disabled={selectedUsers.length === 0 || isAddingMentions}
              style={{
                display: 'flex',
                width: '102px',
                height: '34px',
                padding: '12px 20px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
                borderRadius: '12px',
                background: selectedUsers.length === 0 || isAddingMentions ? '#E5E7EB' : '#EAEDF2',
                boxShadow:
                  '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                border: 'none',
                cursor: selectedUsers.length === 0 || isAddingMentions ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedUsers.length === 0 || isAddingMentions ? '#9CA3AF' : '#333',
              }}
              className={`${
                selectedUsers.length === 0 || isAddingMentions 
                  ? '' 
                  : 'hover:scale-95 active:scale-90'
              }`}
            >
              {isAddingMentions ? (
                <>
                  <Spinner size="md" className="mr-2" />
                  Adding...
                </>
              ) : (
                isCreateMode ? 'Select' : 'Mention'
              )}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
