import { useProductStore } from '@/entities/product/store';
import { formatRole } from '@/lib/utils/formatRole';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation, Message, messagingApi, User } from '../api/messagingApi';
import { useConversationStore } from '../conversationStore';
import { useSocket } from './useSocket';

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const currentConversationRef = useRef(currentConversation);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { chosenProduct } = useProductStore();

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCache, setMessageCache] = useState<Map<number, Message[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<number, number>>(new Map());
  const { people } = useConversationStore();
  const cleanupDoneRef = useRef(false);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await messagingApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
        setError('Failed to load user information');
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (chosenProduct?.id) {
        fetchConversations(chosenProduct.id);
      } else {
        // Clear conversations when no product is selected
        setConversations([]);
        setCurrentConversation(null);
        setMessages([]);
        setError(null);
      }
    }
  }, [currentUser, chosenProduct?.id]);

  useEffect(() => {
    if (conversations.length > 0 && !cleanupDoneRef.current) {
      const uniqueConversations = conversations.filter((conv, index, self) => {
        if (conv.isGroup) return true;
        
        const memberIds = conv.members.map(m => m.user?.id).sort();
        const isFirstOccurrence = index === self.findIndex(c => {
          if (c.isGroup) return false;
          const otherMemberIds = c.members.map(m => m.user?.id).sort();
          return JSON.stringify(memberIds) === JSON.stringify(otherMemberIds);
        });
        
        return isFirstOccurrence;
      });
      
      if (uniqueConversations.length !== conversations.length) {
        setConversations(uniqueConversations);
      }
      cleanupDoneRef.current = true;
    }
  }, [conversations]);

  const handleMessageReceived = useCallback(async (message: Message) => {

    setMessageCache(prev => {
      const newCache = new Map(prev);
      const currentMessages = newCache.get(message.conversationId) || [];
      
      const messageExists = currentMessages.some(msg => msg.id === message.id);
      
      if (!messageExists) {
        const updatedMessages = [...currentMessages, message];
        newCache.set(message.conversationId, updatedMessages);
      }
      
      return newCache;
    });
    
    if (currentConversation && currentConversation.id === message.conversationId) {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === message.id);
        
        if (messageExists) {
          return prev;
        }
        
        const hasOptimisticMessage = prev.some(msg => 
          msg.id > 1000000000000 &&
          msg.content === message.content && 
          msg.senderId === message.senderId
        );
        
        if (hasOptimisticMessage) {
          return prev.map(msg => 
            msg.id > 1000000000000 &&
            msg.content === message.content && 
            msg.senderId === message.senderId
              ? message
              : msg
          );
        } else {
          return [...prev, message];
        }
      });
    } else {
      const targetConversation = conversations.find(conv => conv.id === message.conversationId);
      if (targetConversation) {
        setCurrentConversation(targetConversation);
        const cachedMessages = messageCache.get(message.conversationId) || [];
        if (cachedMessages.length > 0) {
          setMessages(cachedMessages);
        } else {
          try {
            const messages = await messagingApi.getMessages(message.conversationId);
            setMessages(messages);
            setMessageCache(prev => new Map(prev).set(message.conversationId, messages));
          } catch (error) {
            console.error('Failed to fetch messages:', error);
          }
        }
      } else {
        if (!currentConversation) {
          const tempConversation = {
            id: message.conversationId,
            name: undefined,
            isGroup: false,
            productId: chosenProduct?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: []
          };
          setCurrentConversation(tempConversation);
          setMessages([message]);
        }
      }
    }
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    if (message.senderId !== currentUser?.id && 
        (!currentConversation || currentConversation.id !== message.conversationId)) {
      setUnreadCounts(prev => {
        const newCounts = new Map(prev);
        const currentCount = newCounts.get(message.conversationId) || 0;
        const newCount = currentCount + 1;
        newCounts.set(message.conversationId, newCount);
        return newCounts;
      });
    }
  }, [currentUser, currentConversation, conversations, messageCache, chosenProduct?.id]);

  const handleConversationUpdated = useCallback((conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id ? conversation : conv
      )
    );
  }, []);

  const { socket, joinConversation, leaveConversation, sendMessage: socketSendMessage, isConnected, connectionError } = useSocket({
    onMessageReceived: handleMessageReceived,
    onConversationUpdated: handleConversationUpdated,
    onNewConversation: undefined, // We'll set this after the hook is defined
    onError: (error) => {
      setError(error);
    }
  });

  const handleNewConversation = useCallback((data: any) => {
    const newConversation = data.conversation;
    setConversations(prev => {
      const exists = prev.some(conv => conv.id === newConversation.id);
      if (!exists) {
        if (isConnected) {
          joinConversation(newConversation.id);
        }
        if (chosenProduct && newConversation.productId === chosenProduct.id) {
          setCurrentConversation(newConversation);
        }
        return [newConversation, ...prev];
      }
      return prev;
    });
  }, [isConnected, joinConversation, chosenProduct]);

  // Update the socket's onNewConversation handler after it's defined
  useEffect(() => {
    if (socket) {
      socket.off('newConversation');
      socket.on('newConversation', handleNewConversation);
    }
  }, [socket, handleNewConversation]);

  useEffect(() => {
    if (isConnected && conversations.length > 0) {
      conversations.forEach(conv => {
        joinConversation(conv.id);
      });
    }
  }, [isConnected, conversations, joinConversation]);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const counts = await messagingApi.getUnreadCounts();
      const countsMap = new Map<number, number>();
      counts.forEach(count => {
        countsMap.set(count.conversationId, count.unreadCount);
      });
      setUnreadCounts(countsMap);
    } catch (error) {
    }
  }, []);

  const fetchConversations = useCallback(async (productId?: number) => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      const fetchedConversations = await messagingApi.getConversations(productId);
      
      const filteredConversations = fetchedConversations.filter((conv: Conversation) => {
        return conv.members.some(member => member.user?.id === currentUser.id);
      });
      
      const uniqueById = filteredConversations.filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      );
      
      const uniqueConversations = uniqueById.filter((conv, index, self) => {
        if (conv.isGroup) return true;
        
        const memberIds = conv.members.map(m => m.user?.id).sort();
        return index === self.findIndex(c => {
          if (c.isGroup) return false;
          const otherMemberIds = c.members.map(m => m.user?.id).sort();
          return JSON.stringify(memberIds) === JSON.stringify(otherMemberIds);
        });
      });
      
      setConversations(uniqueConversations);
      
      await fetchUnreadCounts();
    } catch (error) {
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUnreadCounts, currentUser]);

  const markMessagesAsRead = useCallback(async (conversationId: number) => {
    try {
      await messagingApi.markMessagesAsRead(conversationId);
      setUnreadCounts(prev => {
        const newCounts = new Map(prev);
        newCounts.set(conversationId, 0);
        return newCounts;
      });
    } catch (error) {
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: number, forceRefresh: boolean = false) => {
    if (!forceRefresh && messageCache.has(conversationId)) {
      const cachedMessages = messageCache.get(conversationId)!;
      setMessages(cachedMessages);
      return;
    }

    try {
      setError(null);
      setIsLoadingMessages(true);
      const fetchedMessages = await messagingApi.getMessages(conversationId);
      
      setMessageCache(prev => new Map(prev).set(conversationId, fetchedMessages));
      setMessages(fetchedMessages);
    } catch (error) {
      setMessageCache(prev => new Map(prev).set(conversationId, []));
      setMessages([]);
      setError(null);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messageCache]);

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!currentConversation || (!content.trim() && (!files || files.length === 0)) || !currentUser) return;

    const attachments = [];
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          attachments.push({
            id: Date.now() + index,
            filename: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: URL.createObjectURL(file),
          });
        } else {
          attachments.push({
            id: Date.now() + index,
            filename: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: '',
          });
        }
      });
    }

    const optimisticMessage = {
      id: Date.now(),
      content: content.trim(),
      senderId: currentUser.id,
      conversationId: currentConversation.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email
      },
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => {
      return [...prev, optimisticMessage];
    });
    
    setMessageCache(prev => {
      const newCache = new Map(prev);
      const currentMessages = newCache.get(currentConversation.id) || [];
      newCache.set(currentConversation.id, [...currentMessages, optimisticMessage]);
      return newCache;
    });

    try {
      if (files && files.length > 0) {
        const sentMessage = await messagingApi.sendMessage(currentConversation.id, { content: content.trim(), files });
        
        if (attachments.length > 0) {
          attachments.forEach(attachment => {
            if (attachment.url.startsWith('blob:')) {
              URL.revokeObjectURL(attachment.url);
            }
          });
        }

        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        ));
        
        setMessageCache(prev => {
          const newCache = new Map(prev);
          const currentMessages = newCache.get(currentConversation.id) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.id === optimisticMessage.id ? sentMessage : msg
          );
          newCache.set(currentConversation.id, updatedMessages);
          return newCache;
        });
      } else if (isConnected) {
        socketSendMessage(currentConversation.id, content.trim());
      } else {
        const sentMessage = await messagingApi.sendMessage(currentConversation.id, { content: content.trim(), files });
        
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        ));
        
        setMessageCache(prev => {
          const newCache = new Map(prev);
          const currentMessages = newCache.get(currentConversation.id) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg.id === optimisticMessage.id ? sentMessage : msg
          );
          newCache.set(currentConversation.id, updatedMessages);
          return newCache;
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      if (attachments.length > 0) {
        attachments.forEach(attachment => {
          if (attachment.url.startsWith('blob:')) {
            URL.revokeObjectURL(attachment.url);
          }
        });
      }
      
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setMessageCache(prev => {
        const newCache = new Map(prev);
        const currentMessages = newCache.get(currentConversation.id) || [];
        newCache.set(currentConversation.id, currentMessages.filter(msg => msg.id !== optimisticMessage.id));
        return newCache;
      });
      setError('Failed to send message');
    }
  }, [currentConversation, currentUser, isConnected, socketSendMessage]);

  const createConversation = useCallback(async (data: { memberIds: number[]; name?: string; isGroup: boolean }) => {
    try {
      setError(null);
      const newConversation = await messagingApi.createConversation({
        ...data,
        productId: chosenProduct?.id
      });
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (error: any) {
      setError(`Failed to create conversation: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }, [chosenProduct?.id]);

  const addMembersToConversation = useCallback(async (conversationId: number, newMemberIds: number[]) => {
    try {
      setError(null);
      const updatedConversation = await messagingApi.addMembersToConversation(conversationId, { newMemberIds });
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      return updatedConversation;
    } catch (error: any) {
      setError(`Failed to add members: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }, []);

  const findOrCreateDirectConversation = async (userId: number) => {
    if (!currentUser) return null;

    const existingConversation = conversations.find(conv => {
      if (conv.isGroup) return false;
      
      const memberIds = conv.members.map(member => member.userId || member.user?.id).filter(Boolean);
      const hasCurrentUser = memberIds.includes(currentUser.id);
      const hasTargetUser = memberIds.includes(userId);
      
      return hasCurrentUser && hasTargetUser;
    });

    if (existingConversation) {
      setCurrentConversation(existingConversation);
      await fetchMessages(existingConversation.id, false);
      return existingConversation;
    } else {
      try {
        setError(null);
        const newConversation = await messagingApi.createConversation({
          memberIds: [userId, currentUser.id],
          isGroup: false,
          productId: chosenProduct?.id
        });
        
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === newConversation.id);
          if (exists) {
            return prev;
          }
          
          const hasSameMembers = prev.some(conv => {
            if (conv.isGroup || newConversation.isGroup) return false;
            const convMemberIds = conv.members.map(m => m.user?.id).sort();
            const newMemberIds = newConversation.members.map(m => m.user?.id).sort();
            return JSON.stringify(convMemberIds) === JSON.stringify(newMemberIds);
          });
          
          if (hasSameMembers) {
            return prev;
          }
          
          return [newConversation, ...prev];
        });
        setCurrentConversation(newConversation);
        
        setMessageCache(prev => new Map(prev).set(newConversation.id, []));
        setMessages([]);
        
        if (isConnected) {
          joinConversation(newConversation.id);
        }
        
        return newConversation;
      } catch (error: any) {
        setError(`Failed to create conversation: ${error.response?.data?.error || error.message}`);
        return null;
      }
    }
  };

  const clearUnreadCount = useCallback((conversationId: number) => {
    setUnreadCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.delete(conversationId);
      return newCounts;
    });
  }, []);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    if (currentConversationRef.current && isConnected) {
      leaveConversation(currentConversationRef.current.id);
    }
    
    setCurrentConversation(conversation);
    
    await fetchMessages(conversation.id, true);
    
    await markMessagesAsRead(conversation.id);
    clearUnreadCount(conversation.id);
    
    if (isConnected) {
      joinConversation(conversation.id);
    }
  }, [fetchMessages, leaveConversation, joinConversation, isConnected, markMessagesAsRead, clearUnreadCount]);

  const getConversationName = useCallback((conversation: Conversation) => {
    if (conversation.isGroup && conversation.name) {
      return conversation.name;
    }
    
    if (!conversation.isGroup && conversation.members.length === 2) {
      const otherMember = conversation.members.find(member => 
        member.user && member.user.id !== currentUser?.id
      );
      return otherMember?.user?.name || otherMember?.user?.email?.split('@')[0] || 'Unknown User';
    }
    
    return 'Group Chat';
  }, [currentUser]);

  const getConversationRole = useCallback((conversation: Conversation) => {
    if (conversation.isGroup) {
      return `${conversation.members.length} members`;
    }
    
    if (!conversation.isGroup && conversation.members.length === 2) {
      const otherMember = conversation.members.find(member => 
        member.user && member.user.id !== currentUser?.id
      );
      return formatRole(otherMember?.user?.role);
    }
    
    return 'Group';
  }, [currentUser]);

  const clearMessageCache = useCallback(() => {
    setMessageCache(new Map());
  }, []);

  const clearAllCaches = useCallback(() => {
    setMessageCache(new Map());
    setConversations([]);
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  const getUnreadCount = useCallback((conversationId: number) => {
    return unreadCounts.get(conversationId) || 0;
  }, [unreadCounts]);

  const refreshMessages = useCallback(async (conversationId?: number) => {
    const targetConversationId = conversationId || currentConversation?.id;
    if (targetConversationId) {
      await fetchMessages(targetConversationId, true);
    }
  }, [currentConversation, fetchMessages]);

  useEffect(() => {
    fetchConversations(chosenProduct?.id);
  }, [chosenProduct?.id]);

  return {
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
    fetchConversations,
    getConversationName,
    getConversationRole,
    clearError: () => setError(null),
    clearMessageCache,
    clearAllCaches,
    isConnected,
    connectionError,
    getUnreadCount,
    clearUnreadCount,
    markMessagesAsRead,
    fetchUnreadCounts,
    currentUser,
    refreshMessages
  };
};