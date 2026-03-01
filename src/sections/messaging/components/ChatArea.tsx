import { Conversation, Message, MessageAttachment } from '@/entities/messaging/api/messagingApi';
import { useProductStore } from '@/entities/product/store';
import { formatRole } from '@/lib/utils/formatRole';
import Loader from '@/shared/ui/Loader';
import { Poppins } from 'next/font/google';
import React, { useState } from 'react';

interface ChatAreaProps {
  messages: Message[];
  currentConversation?: Conversation | null;
  isLoading?: boolean;
  isLoadingMessages?: boolean;
  error?: string | null;
  currentUserId?: number;
}

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const Poppisn400 = Poppins({
  weight: ['400'],
  subsets: ['latin'],
});

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentConversation,
  isLoading = false,
  isLoadingMessages = false,
  error = null,
  currentUserId
}) => {
  const { chosenProduct } = useProductStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getImageUrl = (url: string) => {
    // Blob URLs (for immediate display)
    if (url.startsWith('blob:')) {
      return url;
    }
    // Absolute URLs
    if (url.startsWith('http')) {
      return url;
    }
    // Relative URLs - construct full backend URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${baseUrl}${url}`;
  };

  const isImageFile = (fileType: string) => {
    return fileType.startsWith('image/');
  };

  const renderAttachments = (attachments: MessageAttachment[] | undefined) => {
    if (!attachments || attachments.length === 0) return null;

    const images = attachments.filter(att => isImageFile(att.fileType));

    return (
      <div className="space-y-2 mb-2">
        {images.length > 0 && (
          <div className={`grid gap-1 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} max-w-[280px]`}>
            {images.map((attachment) => {
              const imageUrl = getImageUrl(attachment.url);
              return (
                <div
                  key={attachment.id}
                  className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={attachment.originalName}
                    className="object-cover w-full h-full rounded-lg"
                    style={{
                      width: images.length === 1 ? '280px' : '140px',
                      height: images.length === 1 ? '200px' : '140px',
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      console.error('Attachment details:', attachment);
                      // Try to reload with cache-busting
                      const img = e.currentTarget;
                      if (!img.src.includes('?t=')) {
                        img.src = `${imageUrl}?t=${Date.now()}`;
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getOtherMember = React.useCallback(() => {
    if (!currentConversation) return undefined;

    const membersWithUser = currentConversation.members.filter(
      (member) => member.user && member.user.id !== undefined && member.user !== null
    );

    if (membersWithUser.length === 0) {
      return undefined;
    }

    if (typeof currentUserId === 'number') {
      const other = membersWithUser.find((member) => member.user!.id !== currentUserId);
      if (other) return other;
    }

    // Fallback to first member
    return membersWithUser[0];
  }, [currentConversation, currentUserId]);

  return (
    <div className="flex flex-col h-full bg-[#E8EBF0] rounded-t-3xl overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-[#E8EBF0]">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
          <div className={`${Poppins600.className} text-[14px]`}>
            {currentConversation ? (
              <>
                <p className="text-sm font-semibold text-gray-800">
                  {currentConversation.isGroup
                    ? (currentConversation.name || '')
                    : (() => {
                      const otherMember = getOtherMember();
                      const user = otherMember?.user;
                      if (!user) return 'Unknown User';
                      return user.name || user.email?.split('@')[0] || 'Unknown User';
                    })()
                  }
                </p>
                <p className="text-xs font-normal text-gray-500">
                  {currentConversation.isGroup
                    ? `${currentConversation.members.length} members`
                    : (() => {
                      const otherMember = getOtherMember();
                      return formatRole(otherMember?.user?.role);
                    })()
                  }
                </p>
              </>
            ) : !chosenProduct ? (
              <>
                <p className="text-sm font-semibold text-gray-800">No product selected</p>
                <p className="text-xs font-normal text-gray-500">Please select a product to start messaging</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800">Select a conversation</p>
                <p className="text-xs font-normal text-gray-500">Choose from the list to start chatting</p>
              </>
            )}
          </div>
        </div>
        {currentConversation && (
          <button
            className="text-black hover:text-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM17.25 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </button>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto pl-4 pt-4 pb-4 pr-6 mr-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent bg-[#E8EBF0] ${Poppisn400.className}`}
        style={{
          pointerEvents: 'auto',
          userSelect: 'text'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader size="sm" text="Loading messages..." />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-500 text-center">
              <p className="text-lg font-semibold mb-2">Error loading messages</p>
              <p className="text-sm mb-2">{error}</p>
              <p className="text-xs text-gray-500">
                This might be due to authentication issues. Try refreshing the page or logging in again.
              </p>
            </div>
          </div>
        ) : !chosenProduct ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-semibold mb-2">No product selected</p>
              <p className="text-sm">Please select a product to view conversations and start messaging</p>
            </div>
          </div>
        ) : !currentConversation ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-semibold mb-2">Welcome to Messaging</p>
              <p className="text-sm">Select a conversation from the list to start chatting</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-center">
              <p className="text-lg font-semibold mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages
            .filter((m) => !/microphone access denied|not-allowed/i.test(m.content || ''))
            .map((message) => {
              const isCurrentUserMessage = currentUserId ? message.senderId === currentUserId : false;
              const isGroupChat = currentConversation?.isGroup || false;
              const senderName = message.sender?.name || message.sender?.email?.split('@')[0] || 'Unknown User';

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <div className={`w-[70%] ${isCurrentUserMessage ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                    <div
                      className={`min-h-[40px] wrap-break-word p-3 rounded-lg ${isCurrentUserMessage
                        ? 'bg-[#EAEDF2] rounded-tr-none'
                        : 'bg-white text-[#181818] rounded-tl-none'
                        }`}
                      style={{
                        boxShadow:
                          '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    >
                      {/* Render attachments */}
                      {renderAttachments(message.attachments)}
                      
                      {/* Render text content */}
                      {message.content && message.content.trim() && (
                        <p className="text-sm text-[#181818]">{message.content}</p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {isGroupChat && !isCurrentUserMessage && (
                      <p className="text-[10px] text-gray-600 mt-[4px] px-1">
                        {senderName}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
