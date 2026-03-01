'use client';

import { useProductStore } from '@/entities/product/store';
import { formatAiResponseToJSX } from '@/lib/utils/formatAiResponse';
import useDesignWorkspaceAIStore from '@/workspaces/designWorkspace/store/designWorkspaceAIStore';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, useRef } from 'react';
import AiSuggestion from '@/features/AiChat/AiSuggestion';

interface Suggestion {
  suggestion: string;
}

const mockSuggestions: Suggestion[] = [
  { suggestion: 'Generate a login page design' },
  { suggestion: 'Create a dashboard layout' },
  { suggestion: 'Review my current design' },
  { suggestion: 'Suggest color palette improvements' },
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

const ChatHistory: React.FC<{ setFunc: Dispatch<SetStateAction<boolean>> }> = ({
  setFunc,
}) => {
  const {
    conversations,
    conversationsLoading,
    loadConversations,
    loadConversation,
    deleteConversation,
    currentConversationId
  } = useDesignWorkspaceAIStore();
  const { chosenProduct } = useProductStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);

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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  const handleConversationClick = async (conversationId: number) => {
    await loadConversation(conversationId);
    setFunc(false);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    await deleteConversation(conversationId);
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
                onClick={() => handleConversationClick(conversation.id)}
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
                <div className="pl-3">
                  <div className="text-[15px] font-light truncate max-w-[150px]">
                    {conversation.title}
                  </div>
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
  const { sendMessage, isLoading } = useDesignWorkspaceAIStore();

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

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => {
        const updated = [...prev, ...newFiles];
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

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const onAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || isLoading || !chosenProduct) return;

    const messageToSend = message.trim();
    const filesToSend = [...attachedFiles];

    setMessage('');
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(new Map());
    setAttachedFiles([]);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    await sendMessage(messageToSend, filesToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation to prevent global keyboard handlers from interfering
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddMessage(e as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation to prevent global keyboard handlers from interfering
    e.stopPropagation();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation to prevent global keyboard handlers from interfering
    e.stopPropagation();
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
          onKeyPress={handleKeyPress}
          onKeyUp={handleKeyUp}
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
  onAskCritique?: () => void;
  isCritiquing?: boolean;
  onClose?: () => void;
}> = ({ isShowHistory, setFunc, queryMessage, setQueryMessage, onAskCritique, isCritiquing, onClose }) => {
  const { messages, isLoading, error } = useDesignWorkspaceAIStore();
  const { chosenProduct } = useProductStore();
  const isClosingRef = useRef(false);

  const isAITyping = messages.some(msg => msg.isTyping);

  // Helper function to get appropriate loading message based on user query
  const getLoadingMessage = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Design generation patterns
    if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('design')) {
      if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
        return 'Designing login page...';
      }
      if (lowerMessage.includes('dashboard')) {
        return 'Creating dashboard layout...';
      }
      if (lowerMessage.includes('landing') || lowerMessage.includes('homepage')) {
        return 'Designing landing page...';
      }
      if (lowerMessage.includes('form')) {
        return 'Creating form design...';
      }
      if (lowerMessage.includes('button')) {
        return 'Designing button component...';
      }
      if (lowerMessage.includes('page') || lowerMessage.includes('screen')) {
        return 'Designing page...';
      }
      return 'Generating design...';
    }
    
    // Edit/Modify patterns
    if (lowerMessage.includes('edit') || lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('modify')) {
      return 'Updating component...';
    }
    
    // Review/Critique patterns
    if (lowerMessage.includes('review') || lowerMessage.includes('critique') || lowerMessage.includes('analyze')) {
      return 'Analyzing design...';
    }
    
    // General AI processing
    return 'Processing your request...';
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isClosingRef.current) {
      return;
    }
    
    isClosingRef.current = true;
    
    // Call onClose callback if provided
    if (onClose) {
      onClose();
    }
    
    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center flex-shrink-0 pb-2 border-b border-gray-200">
        <div className="font-medium">AI partner</div>
        <div className="flex items-center gap-2">
          {onAskCritique && (
            <button
              onClick={onAskCritique}
              disabled={isCritiquing || isLoading}
              className="px-3 py-1.5 bg-[#627899] text-white rounded-lg hover:bg-[#4a5d7a] transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCritiquing ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                  Ask Critique
                </>
              )}
            </button>
          )}
          {!isShowHistory && (
            <Image
              className="rounded-full w-[14px] select-none h-[14px] cursor-pointer"
              src={'/icons/restore.svg'}
              alt="toggle-history"
              width={14}
              height={14}
              onClick={() => setFunc((prev: boolean) => !prev)}
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
      <div className="pt-5 flex-1 overflow-y-auto pr-4 pl-2 min-h-0">
        <div className="max-w-full text-[13px] break-words space-y-4">
          {messages.map((message, index) => {
            const isLastUserMessage = message.sender === 'User' && index === messages.length - 1;
            const showLoadingBelowUser = isLastUserMessage && isLoading;
            
            return (
            <div key={index} className="w-full">
              {message.sender === 'User' ? (
                <div className="flex flex-col items-end">
                  <div className="flex justify-end mb-2">
                    <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                      {message.attachedImages && message.attachedImages.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.attachedImages.map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="relative rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={`Attached image ${imgIndex + 1}`}
                                className="max-w-[200px] max-h-[100px] w-auto h-auto object-contain rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
                      {message.message && (
                        <div className="text-sm text-gray-800 leading-relaxed">
                          {message.message}
                        </div>
                      )}
                    </div>
                  </div>
                  {showLoadingBelowUser && (
                    <div className="flex items-center gap-2 mt-1 mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#627899] animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#627899] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#627899] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-[#627899] font-medium italic">
                        {getLoadingMessage(message.message)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
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

                  {message.role && !message.isTyping && (
                    <div className="text-xs text-gray-500 mt-2 font-medium">
                      {message.role.charAt(0).toUpperCase() + message.role.slice(1)} Assistant
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
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

const DesignWorkspaceAIChat = ({ onAskCritique, isCritiquing, onClose }: { onAskCritique?: () => void; isCritiquing?: boolean; onClose?: () => void }) => {
  const [isShowHistory, setIsShowHistory] = useState(false);
  const [queryMessage, setQueryMessage] = useState<string>('');

  const memoizedSetQueryMessage = useCallback((message: string) => {
    setQueryMessage(message);
  }, []);

  return (
    <div
      className={`flex h-full ${isShowHistory ? 'rounded-[12px]' : ''}`}
      style={{
        boxShadow: isShowHistory
          ? '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF'
          : '',
      }}
    >
      <div
        className={`w-full font-sans h-full bg-[#EAEDF2] ${isShowHistory ? 'rounded-l-[12px]' : 'rounded-[12px]'
          } p-3 flex flex-col`}
        style={{
          boxShadow: !isShowHistory
            ? '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF'
            : '',
        }}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AiViewArea
            setFunc={setIsShowHistory}
            isShowHistory={isShowHistory}
            queryMessage={queryMessage}
            setQueryMessage={memoizedSetQueryMessage}
            onAskCritique={onAskCritique}
            isCritiquing={isCritiquing}
            onClose={onClose}
          />
        </div>

        <div className="shrink-0 flex-shrink-0">
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

export default DesignWorkspaceAIChat;

