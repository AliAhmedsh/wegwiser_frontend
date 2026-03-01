import { Conversation } from '@/entities/messaging/api/messagingApi';
import Image from 'next/image';
import React from 'react';

interface ChatHeaderProps {
  onNewConversationClick: () => void;
  currentConversation?: Conversation | null;
  getConversationName?: (conversation: Conversation) => string;
  getConversationRole?: (conversation: Conversation) => string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewConversationClick, 
  currentConversation,
  getConversationName,
  getConversationRole 
}) => {
  return (
    <div className="flex justify-between items-center pl-6 pr-4 pt-4 pb-3 bg-white">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-gray-800">Message</h2>
      </div>
      <button
        onClick={onNewConversationClick}
        className="flex items-center justify-center cursor-pointer bg-[#627899] transition-all hover:bg-[#414d5f] text-white text-xs font-normal w-[140px] h-[32px] rounded-sm"
      >
        <Image
          src={'/icons/UserPlus.svg'}
          alt="Add user"
          width={18}
          height={18}
        />
        <span className="ml-2"> New Conversation</span>
      </button>
    </div>
  );
};

export default ChatHeader;
