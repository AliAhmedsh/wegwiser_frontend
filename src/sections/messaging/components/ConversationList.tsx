import { Conversation } from '@/entities/messaging/api/messagingApi';
import { useConversationStore } from '@/entities/messaging/conversationStore';
import { useProductStore } from '@/entities/product/store';
import { getCurrentUserId } from '@/lib/utils/auth';
import { formatRole } from '@/lib/utils/formatRole';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const Poppins600 = Poppins({
  weight: '600',
  subsets: ['latin'],
});

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation?: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  getUnreadCount: (conversationId: number) => number;
  currentUserId?: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  onSelectConversation,
  isLoading,
  error,
  onRetry,
  getUnreadCount,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'groups'>('people');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { people, fetchUsers } = useConversationStore();
  const { chosenProduct } = useProductStore();

  useEffect(() => {
    if (currentUserId) {
      fetchUsers(chosenProduct?.id, currentUserId);
    }
  }, [fetchUsers, chosenProduct?.id, currentUserId]);

  return (
    <div className="w-1/4 bg-white flex flex-col px-6">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-[#000000]"
        />
      </div>
      <div className={`flex text-sm ${Poppins600.className}`}>
        <button
          className={`flex-1 py-3 text-center flex cursor-pointer ${activeTab === 'people'
            ? 'text-black border-b-3 border-[#627899]'
            : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('people')}
        >
          <Image
            src={'/icons/user.svg'}
            alt="User image"
            width={18}
            height={18}
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="ml-1">People</span>
        </button>
        <button
          className={`flex-1 py-3 text-center flex cursor-pointer ${activeTab === 'groups'
            ? 'text-black border-b-3 border-[#627899]'
            : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('groups')}
        >
          <Image
            src={'/icons/UsersFour.svg'}
            alt="group"
            width={18}
            height={18}
            style={{ width: 'auto', height: 'auto' }}
          />
          <span className="ml-1">Groups</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto mb-3">
        {activeTab === 'people' && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                  <p className="ml-3 text-sm text-gray-600">Loading conversations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-8">
                <div className="text-red-500 mb-2 text-sm">{error}</div>
                <div className="text-xs text-gray-500 mb-2 text-center px-4">
                  This might be due to authentication issues. Try refreshing the page or logging in again.
                </div>
                <button
                  onClick={onRetry}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : !chosenProduct ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500 text-center">
                  <p className="text-sm font-medium mb-1">No product selected</p>
                  <p className="text-xs">Please select a product to view conversations</p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No conversations yet</div>
              </div>
            ) : conversations
              .filter(conv => !conv.isGroup)
              .filter((conversation) => {
                if (!searchQuery.trim()) return true;

                const otherMember = conversation.members.find(member =>
                  member.user && currentUserId ? member.user.id !== currentUserId : member.user?.id !== getCurrentUserId()
                );

                if (!otherMember || !otherMember.user) return false;

                const userName = otherMember.user.name || otherMember.user.email.split('@')[0] || '';
                const userRole = otherMember.user.role || '';
                const userEmail = otherMember.user.email || '';

                const searchLower = searchQuery.toLowerCase();
                return userName.toLowerCase().includes(searchLower) ||
                  userRole.toLowerCase().includes(searchLower) ||
                  userEmail.toLowerCase().includes(searchLower);
              }).length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No results found</div>
              </div>
            ) : (
              conversations
                .filter(conv => !conv.isGroup)
                .filter((conversation) => {
                  if (!searchQuery.trim()) return true;

                  const otherMember = conversation.members.find(member =>
                    member.user && currentUserId ? member.user.id !== currentUserId : member.user?.id !== getCurrentUserId()
                  );

                  if (!otherMember || !otherMember.user) return false;

                  const userName = otherMember.user.name || otherMember.user.email.split('@')[0] || '';
                  const userRole = otherMember.user.role || '';
                  const userEmail = otherMember.user.email || '';

                  const searchLower = searchQuery.toLowerCase();
                  return userName.toLowerCase().includes(searchLower) ||
                    userRole.toLowerCase().includes(searchLower) ||
                    userEmail.toLowerCase().includes(searchLower);
                })
                .map((conversation) => {
                  const otherMember = conversation.members.find(member =>
                    member.user && currentUserId ? member.user.id !== currentUserId : member.user?.id !== getCurrentUserId()
                  );

                  // Skip if no other member found or user data is missing
                  if (!otherMember || !otherMember.user) {
                    return null;
                  }

                  const isSelected = currentConversation?.id === conversation.id;
                  const unreadCount = getUnreadCount(conversation.id);

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center pr-4 pl-2 py-4 rounded-xl cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''
                        }`}
                      onClick={() => onSelectConversation(conversation)}
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {otherMember?.user.name || otherMember?.user.email.split('@')[0] || 'Unknown User'}
                        </p>
                        <p className="text-xs font-normal text-gray-500">
                          {formatRole(otherMember?.user.role)}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1" style={{ backgroundColor: '#627899' }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </>
        )}
        {activeTab === 'groups' && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                  <p className="ml-3 text-sm text-gray-600">Loading groups...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-8">
                <div className="text-red-500 mb-2 text-sm">{error}</div>
                <button
                  onClick={onRetry}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : !chosenProduct ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500 text-center">
                  <p className="text-sm font-medium mb-1">No product selected</p>
                  <p className="text-xs">Please select a product to view group conversations</p>
                </div>
              </div>
            ) : conversations.filter(conv => conv.isGroup).length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No group conversations yet</div>
              </div>
            ) : conversations
              .filter(conv => conv.isGroup)
              .filter((conversation) => {
                if (!searchQuery.trim()) return true;

                const groupName = conversation.name || 'Group Chat';
                const memberNames = conversation.members
                  .map(member => member.user?.name || member.user?.email?.split('@')[0] || '')
                  .join(' ');

                const searchLower = searchQuery.toLowerCase();
                return groupName.toLowerCase().includes(searchLower) ||
                  memberNames.toLowerCase().includes(searchLower);
              }).length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No results found</div>
              </div>
            ) : (
              conversations
                .filter(conv => conv.isGroup)
                .filter((conversation) => {
                  if (!searchQuery.trim()) return true;

                  const groupName = conversation.name || 'Group Chat';
                  const memberNames = conversation.members
                    .map(member => member.user?.name || member.user?.email?.split('@')[0] || '')
                    .join(' ');

                  const searchLower = searchQuery.toLowerCase();
                  return groupName.toLowerCase().includes(searchLower) ||
                    memberNames.toLowerCase().includes(searchLower);
                })
                .map((conversation) => {
                  const isSelected = currentConversation?.id === conversation.id;
                  const unreadCount = getUnreadCount(conversation.id);

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''
                        }`}
                      onClick={() => onSelectConversation(conversation)}
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0 mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {conversation.name || ''}
                        </p>
                        <p className="text-xs font-normal text-gray-500 text-[12px]">
                          ({conversation.members.length} members)
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1" style={{ backgroundColor: '#627899' }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
