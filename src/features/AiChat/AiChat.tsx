import { useProductStore } from '@/entities/product/store';
import { formatAiResponseToJSX } from '@/lib/utils/formatAiResponse';
import useAiStore from '@/store/AiStore';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import type { SuggestedOption } from '@/store/AiStore';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, useRef } from 'react';
import AiSuggestion from './AiSuggestion';

const SuggestedOptionButton: React.FC<{ option: SuggestedOption }> = ({ option }) => {
  const { chosenProduct } = useProductStore();
  const setPrdUpdateFlowOpen = useModalWindowStore((s) => s.setPrdUpdateFlowOpen);
  const setPrdUpdateFlowContext = useModalWindowStore((s) => s.setPrdUpdateFlowContext);
  const setOpenProductWorkspaceForPrdUpdate = useModalWindowStore((s) => s.setOpenProductWorkspaceForPrdUpdate);
  const handleClick = () => {
    if (option.id === 'update_prd') {
      if (chosenProduct?.id) {
        setPrdUpdateFlowContext({ productId: chosenProduct.id });
        setPrdUpdateFlowOpen(true);
      } else {
        setOpenProductWorkspaceForPrdUpdate(true);
      }
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#627899] text-white hover:bg-[#536682] transition-colors"
    >
      {option.label}
    </button>
  );
};

interface Suggestion {
  suggestion: string;
}

interface ChatHistoryItem {
  id: string;
  name: string;
  dateTime: Date;
}

const mockSuggestions: Suggestion[] = [
  { suggestion: 'word.' },
  { suggestion: 'second.' },
  { suggestion: 'Try optimizing the render logic for better performance.' },
  { suggestion: 'Consider using Zustand for simple and scalable state.' },
];

const mockHistory: ChatHistoryItem[] = [
  {
    id: '1',
    name: 'Project redesign proposal for client A',
    dateTime: new Date(),
  },
  {
    id: '2',
    name: 'Q2 performance analysis and metrics',
    dateTime: new Date(),
  },
  { id: '3', name: 'UI feedback from marketing team', dateTime: new Date() },
];

const HistoryInput: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}> = ({ searchTerm, setSearchTerm, onSearch }) => (
  <div className="flex items-center border-b border-[#8B8B8B] pb-2">
    <Image
      src={'/icons/search.svg'}
      className="w-[18px] select-none h-[18px] cursor-pointer hover:scale-95 active:scale-90"
      alt="search"
      width={18}
      height={18}
    />
    <input
      className="ml-2 w-full outline-none text-sm bg-transparent"
      placeholder="Search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSearch()}
    />
    <Image
      className="w-[20px] select-none h-[20px] cursor-pointer hover:scale-95 active:scale-90"
      src={'/icons/to-up.svg'}
      alt="search"
      width={20}
      height={20}
      onClick={onSearch}
    />
  </div>
);

const HistoryEntity: React.FC<ChatHistoryItem> = ({ name, dateTime, id }) => (
  <div className="text-[14px] flex items-center py-1" key={id}>
    <Image
      className="w-[14px] mt-[-16px] h-[14px] cursor-pointer hover:scale-90 active:scale-80"
      src={'/icons/gray-close.svg'}
      alt="delete"
      width={14}
      height={14}
    />
    <div className="pl-3">
      <div className="text-[15px] font-light truncate max-w-[150px]">
        {name}
      </div>
      <div className="text-[#9D9D9D] text-[12px]">
        {dateTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
        {' - '}
        {dateTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}
      </div>
    </div>
  </div>
);

const ChatHistory: React.FC<{ setFunc: Dispatch<SetStateAction<boolean>> }> = ({
  setFunc,
}) => {
  const {
    conversations,
    conversationsLoading,
    loadConversations,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    currentConversationId
  } = useAiStore();
  const { chosenProduct } = useProductStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    setFilteredConversations(conversations);
  }, [conversations]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation =>
      conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  };

  // Clear search when search term is empty
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  const handleConversationClick = async (conversationId: number) => {
    // Don't close slider if we're editing a title
    if (editingConversationId === conversationId) {
      return;
    }
    await loadConversation(conversationId);
    setFunc(false); // Close slider when opening conversation
  };

  const handleDeleteConversation = async (conversationId: number) => {
    await deleteConversation(conversationId);
  };

  const handleStartEdit = (conversationId: number, currentTitle: string) => {
    setEditingConversationId(conversationId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (conversationId: number) => {
    if (editTitle.trim() && editTitle.trim().length <= 200) {
      try {
        await updateConversationTitle(conversationId, editTitle.trim());
        setEditingConversationId(null);
        setEditTitle('');
      } catch (error) {
        console.error('Failed to update title:', error);
        // Error is already handled in store
      }
    } else {
      alert('Title must be between 1 and 200 characters');
    }
  };

  const handleCancelEdit = () => {
    setEditingConversationId(null);
    setEditTitle('');
  };

  return (
    <div className="bg-white w-full h-full rounded-r-[12px] overflow-hidden p-3">
      <div className="flex justify-between items-center">
        <div className="w-[80%]">
          <HistoryInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
          />
        </div>
        <Image
          className="w-[15px] h-[15px] select-none cursor-pointer hover:scale-90 active:scale-80"
          src={'/icons/close-history.svg'}
          onClick={() => setFunc((prev) => !prev)}
          alt="close"
          width={15}
          height={15}
        />
      </div>
      <div className="pt-5">
        <div className="text-[#9D9D9D] mb-2">Chats</div>
        <div className="flex flex-col gap-2">
          {conversationsLoading ? (
            <div className="text-[#9D9D9D] text-[12px]">Loading...</div>
          ) : !chosenProduct ? (
            <div className="text-center py-8">
              <div className="text-[#9D9D9D] text-[12px]">
                <p className="font-medium mb-1">No product selected</p>
                <p>Please select a product to view AI conversations</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-[#9D9D9D] text-[12px]">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`text-[14px] flex items-center py-1 cursor-pointer rounded ${currentConversationId === conversation.id ? 'bg-blue-50' : ''}`}
                onClick={(e) => {
                  // If editing, don't do anything on click (don't close slider)
                  if (editingConversationId === conversation.id) {
                    e.stopPropagation();
                    return;
                  }
                  // Single click to open conversation (slider will close)
                  handleConversationClick(conversation.id);
                }}
              >
                <Image
                  className="w-[14px] mt-[-16px] h-[14px] cursor-pointer hover:scale-90 active:scale-80"
                  src={'/icons/gray-close.svg'}
                  alt="delete"
                  width={14}
                  height={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation.id);
                  }}
                />
                <div className="pl-3 flex-1">
                  {editingConversationId === conversation.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(conversation.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[15px] font-light border border-blue-300 rounded px-2 py-1 flex-1 max-w-[150px] outline-none focus:border-blue-500"
                        autoFocus
                        maxLength={200}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(conversation.id);
                        }}
                        className="text-blue-500 text-xs px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="text-gray-500 text-xs px-2 py-1 hover:bg-gray-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="text-[15px] font-light truncate max-w-[150px] hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent onClick (don't close slider)
                        handleStartEdit(conversation.id, conversation.title);
                      }}
                      title="Click to edit title"
                    >
                    {conversation.title}
                  </div>
                  )}
                  <div className="text-[#9D9D9D] text-[12px]">
                    {new Date(conversation.updatedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                    {' - '}
                    {new Date(conversation.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AiTextArea: React.FC<{
  message: string;
  setMessage: (message: string) => void;
}> = ({ message, setMessage }) => {
  const { chosenProduct } = useProductStore();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<number, string>>(new Map());
  const { sendMessage, isLoading } = useAiStore();


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setIsRecording(false);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Voice recording functions
  const startRecording = () => {
    if (recognition && !isRecording) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // File attachment functions
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => {
        const updated = [...prev, ...newFiles];
        // Create preview URLs for images
        const newUrls = new Map(imagePreviewUrls);
        newFiles.forEach((file, fileIndex) => {
          if (file.type.startsWith('image/')) {
            const actualIndex = prev.length + fileIndex;
            newUrls.set(actualIndex, URL.createObjectURL(file));
          }
        });
        setImagePreviewUrls(newUrls);
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL if it exists
    const url = imagePreviewUrls.get(index);
    if (url) {
      URL.revokeObjectURL(url);
      setImagePreviewUrls(prev => {
        const newUrls = new Map();
        prev.forEach((value, key) => {
          if (key < index) {
            newUrls.set(key, value);
          } else if (key > index) {
            newUrls.set(key - 1, value);
          }
        });
        return newUrls;
      });
    }
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup effect for image URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all object URLs on unmount
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || isLoading || !chosenProduct) return;

    const messageToSend = message.trim();
    const filesToSend = [...attachedFiles];

    // Debug logging
    console.log('=== FRONTEND DEBUG ===');
    console.log('Message to send:', messageToSend);
    console.log('Files to send:', filesToSend.length);
    filesToSend.forEach((file, index) => {
      console.log(`File ${index}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    });

    setMessage('');
    // Clean up preview URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(new Map());
    setAttachedFiles([]);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Send message with files
    await sendMessage(messageToSend, filesToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddMessage(e as any);
    }
  };

  return (
    <div>
      <div className="relative">
        <textarea
          className="p-3 h-20 mt-5 text-[12px] bg-white w-full resize-none outline-none rounded-[8px]"
          placeholder={
            !chosenProduct
              ? "Please select a product to start chatting..."
              : isLoading
                ? "AI is thinking..."
                : "Enter prompt"
          }
          onChange={(e) => setMessage(e.currentTarget.value)}
          value={message}
          onKeyDown={handleKeyDown}
          disabled={isLoading || !chosenProduct}
        />
      </div>

      {attachedFiles.length > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              const imageUrl = imagePreviewUrls.get(index);
              
              return (
                <div key={index} className="relative">
                  {isImage && imageUrl ? (
                    <div className="relative rounded-lg overflow-visible border border-gray-200">
                      <img
                        src={imageUrl}
                        alt={file.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold hover:bg-red-600 shadow-sm z-10"
                        style={{ lineHeight: '1' }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="justify-end flex">
        <div className="w-1/4 flex justify-around">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`cursor-pointer select-none hover:scale-95 active:scale-90 ${isRecording ? 'animate-pulse' : ''}`}
            disabled={isLoading}
          >
            <Image
              src={'/icons/micro.svg'}
              alt="mic"
              width={10}
              height={10}
              style={{ width: 'auto', height: 'auto' }}
              className={isRecording ? 'filter brightness-0 saturate-100 invert-27 sepia-51 saturate-2878 hue-rotate-346 brightness-104 contrast-97' : ''}
            />
          </button>
          <label className="cursor-pointer select-none hover:scale-95 active:scale-90">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileAttachment}
              className="hidden"
              disabled={isLoading}
            />
            <Image
              src={'/icons/Paperclip.svg'}
              alt="attach"
              width={15}
              height={15}
              style={{ width: 'auto', height: 'auto' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

const AiViewArea: React.FC<{
  setFunc: Dispatch<SetStateAction<boolean>>;
  isShowHistory: boolean;
  queryMessage: string;
  setQueryMessage: (message: string) => void;
}> = ({ isShowHistory, setFunc, queryMessage, setQueryMessage }) => {
  const { toggleAiWindow, messages, isLoading, error, isShowAiWindow } = useAiStore();
  const { chosenProduct } = useProductStore();
  const isClosingRef = useRef(false);

  // Check if AI is currently typing
  const isAITyping = messages.some(msg => msg.isTyping);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isClosingRef.current) {
      console.log('[AiChat] Close already in progress, ignoring');
      return;
    }
    
    console.log('[AiChat] Close button clicked, current state:', isShowAiWindow);

    isClosingRef.current = true;

    toggleAiWindow();

    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between flex-shrink-0">
        <div className="font-medium">AI partner</div>
        <div className="flex justify-around w-1/3 items-center mt-1">
          {!isShowHistory && (
            <Image
              className="rounded-full w-[14px] select-none h-[14px] cursor-pointer"
              src={'/icons/restore.svg'}
              alt="toggle-history"
              width={14}
              height={14}
              onClick={() => setFunc((prev) => !prev)}
            />
          )}
          <button
            onClick={handleClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-full select-none cursor-pointer h-[18px] w-[18px] hover:opacity-70 transition-opacity flex items-center justify-center p-0 border-0 bg-transparent z-10 relative"
            type="button"
            aria-label="Close AI Partner"
          >
          <Image
            src={'/icons/gray-close.svg'}
            alt="close"
            width={18}
            height={18}
              className="pointer-events-none"
              draggable={false}
          />
          </button>
        </div>
      </div>
      <div className="pt-5 flex-1 overflow-y-auto pr-4 pl-2 mt-3 min-h-0">
        <div className="max-w-full text-[13px] break-words space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="w-full">
              {message.sender === 'User' ? (
                // User message in white speech bubble
                <div className="flex justify-end mb-2">
                  <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                    {/* Display attached images */}
                    {message.attachedImages && message.attachedImages.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachedImages.map((imageUrl, imgIndex) => (
                          <div key={imgIndex} className="relative rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Attached image ${imgIndex + 1}`}
                              className="max-w-[200px] max-h-[100px] w-auto h-auto object-contain rounded-lg"
                              style={{ display: 'block', maxWidth: '200px', maxHeight: '100px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Display attached files (non-image documents) */}
                    {message.attachedFiles && message.attachedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachedFiles.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-shrink-0">
                              <Image
                                src="/icons/FileIcon.svg"
                                alt="document"
                                width={20}
                                height={20}
                                className="opacity-70"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-700 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Display message text if present - separate from images */}
                    {message.message && (
                      <div className="text-sm text-gray-800 leading-relaxed">
                        {message.message}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // AI message as regular text
                <div className="flex flex-col">
                  {message.isLoading && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#627899' }}></div>
                        <div className="w-1 h-1 rounded-full animate-pulse delay-75" style={{ backgroundColor: '#627899' }}></div>
                        <div className="w-1 h-1 rounded-full animate-pulse delay-150" style={{ backgroundColor: '#627899' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-800 leading-relaxed space-y-2">
                    {formatAiResponseToJSX(message.message)}
                    {message.isTyping && (
                      <span className="inline-block w-1 h-4 animate-pulse ml-1 align-baseline" style={{ backgroundColor: '#627899', verticalAlign: 'baseline' }}></span>
                    )}
                  </div>

                  {message.suggestedOptions && message.suggestedOptions.length > 0 && !message.isLoading && !message.isTyping && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestedOptions.map((opt) => (
                        <SuggestedOptionButton key={opt.id} option={opt} />
                      ))}
                    </div>
                  )}

                  {message.role && !message.isTyping && (
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      {message.role.charAt(0).toUpperCase() + message.role.slice(1)} Assistant
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {!chosenProduct && !isAITyping && !isLoading && !messages.some(msg => msg.sender === 'User') && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <p className="text-sm font-medium mb-1">No product selected</p>
              <p className="text-xs">Please select a product to start chatting with AI</p>
            </div>
          </div>
        )}

        {chosenProduct && !isAITyping && !isLoading && !messages.some(msg => msg.sender === 'User') && (
          <div className="space-y-2">
            {mockSuggestions.map((item, index) => (
              <AiSuggestion
                key={index}
                suggestion={item.suggestion}
                setQueryMessage={setQueryMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AIChat = () => {
  const [isShowHistory, setIsShowHistory] = useState(false);
  const [queryMessage, setQueryMessage] = useState<string>('');

  const memoizedSetQueryMessage = useCallback((message: string) => {
    setQueryMessage(message);
  }, []);

  return (
    <div
      className={`flex ${isShowHistory ? 'rounded-[12px]' : ''}`}
      style={{
        boxShadow: isShowHistory
          ? '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF'
          : '',
      }}
    >
      <div
        className={`w-[300px] font-sans h-[95vh] bg-[#EAEDF2] ${isShowHistory ? 'rounded-l-[12px]' : 'rounded-[12px]'
          } p-3 flex flex-col`}
        style={{
          boxShadow: !isShowHistory
            ? '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF'
            : '',
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <AiViewArea
            setFunc={setIsShowHistory}
            isShowHistory={isShowHistory}
            queryMessage={queryMessage}
            setQueryMessage={memoizedSetQueryMessage}
          />
        </div>

        <div className="shrink-0">
          <AiTextArea message={queryMessage} setMessage={setQueryMessage} />
        </div>
      </div>

      <AnimatePresence>
        {isShowHistory && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 240 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ChatHistory setFunc={setIsShowHistory} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChat;
