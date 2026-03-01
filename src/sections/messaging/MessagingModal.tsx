import { useConversationStore } from '@/entities/messaging/conversationStore';
import { useMessaging } from '@/entities/messaging/hooks/useMessaging';
import { useProductStore } from '@/entities/product/store';
import Modal from '@/shared/portals/ModalWindow';
import React, { useState } from 'react';
import AddPeopleModal from './addPeopleModal/AddPeopleModal';
import ChatArea from './components/ChatArea';
import ChatHeader from './components/ChatHeader';
import ConversationList from './components/ConversationList';
import MessageInput from './components/MessageInput';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ isOpen, onClose }) => {
  const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);
  const { people: allPeople } = useConversationStore();
  const { chosenProduct } = useProductStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    sendMessage,
    createConversation,
    addMembersToConversation,
    findOrCreateDirectConversation,
    selectConversation,
    getConversationName,
    getConversationRole,
    clearError,
    isConnected,
    connectionError,
    getUnreadCount,
    currentUser,
    refreshMessages
  } = useMessaging();

  const handleSendMessage = async (message: string, files?: File[]) => {
    await sendMessage(message, files);
  };

  const handleNewConversationClick = () => {
    setIsAddPeopleModalOpen(true);
  };

  const handleAddPeople = async (selectedPeopleIds: string[]) => {
    const selectedMembers = allPeople.filter((person) =>
      selectedPeopleIds.includes(person.id)
    );

    if (selectedMembers.length > 0) {
      if (selectedMembers.length === 1) {
        const userId = parseInt(selectedMembers[0].id);
        await findOrCreateDirectConversation(userId);
      } else {
        const memberIds = selectedMembers.map(person => parseInt(person.id));
        const groupName = selectedMembers.map(p => p.name).join(', ');
        await createConversation({
          memberIds,
          isGroup: true,
          name: groupName
        });
      }
    }
    setIsAddPeopleModalOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} noDimming={true}>
      <div
        className="relative bg-white rounded-3xl shadow-xl flex flex-col h-[575px] w-[900px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <ChatHeader
          onNewConversationClick={handleNewConversationClick}
          currentConversation={currentConversation}
          getConversationName={getConversationName}
          getConversationRole={getConversationRole}
        />
        <div className="flex flex-grow overflow-hidden pt-1">
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={selectConversation}
            isLoading={isLoading}
            error={error || connectionError}
            onRetry={() => clearError()}
            getUnreadCount={getUnreadCount}
            currentUserId={currentUser?.id}
          />
          <div
            className="w-3/4 h-full bg-white flex flex-col pr-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ChatArea
              messages={messages}
              currentConversation={currentConversation}
              isLoading={isLoading}
              isLoadingMessages={isLoadingMessages}
              error={error || connectionError}
              currentUserId={currentUser?.id}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!chosenProduct || !currentConversation || isLoading}
              noProductSelected={!chosenProduct}
            />

          </div>
        </div>
      </div>
      <AddPeopleModal
        isOpen={isAddPeopleModalOpen}
        onClose={() => setIsAddPeopleModalOpen(false)}
        onAddPeople={handleAddPeople}
      />
    </Modal>
  );
};

export default MessagingModal;
