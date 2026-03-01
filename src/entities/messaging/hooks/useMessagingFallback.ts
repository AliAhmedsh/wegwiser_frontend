import { useProductStore } from '@/entities/product/store';
import { useCallback, useEffect, useState } from 'react';
import { Conversation, Message, messagingApi } from '../api/messagingApi';
import { useConversationStore } from '../conversationStore';

export const useMessagingFallback = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCache, setMessageCache] = useState<Map<number, Message[]>>(new Map());
  const { people } = useConversationStore();
  const { chosenProduct } = useProductStore();

  const fetchConversations = useCallback(async (productId?: number) => {
    try {
      setError(null);
      const fetchedConversations = await messagingApi.getConversations(productId);
      setConversations(fetchedConversations);
    } catch (error) {
      setError('Failed to load conversations');
    }
  }, []);

  useEffect(() => {
    fetchConversations(chosenProduct?.id);
  }, [chosenProduct?.id, fetchConversations]);

  const fetchMessages = useCallback(async (conversationId: number, forceRefresh: boolean = false) => {
    if (!forceRefresh && messageCache.has(conversationId)) {
      setMessages(messageCache.get(conversationId)!);
      return;
    }

    try {
      setError(null);
      const fetchedMessages = await messagingApi.getMessages(conversationId);
      
      setMessageCache(prev => new Map(prev).set(conversationId, fetchedMessages));
      setMessages(fetchedMessages);
    } catch (error) {
      setError('Failed to load messages');
    }
  }, [messageCache]);

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!currentConversation || (!content.trim() && (!files || files.length === 0))) return;

    const currentUserId = 87;
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      senderId: currentUserId,
      conversationId: currentConversation.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: 'You',
        email: 'current@user.com'
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    setMessageCache(prev => {
      const newCache = new Map(prev);
      const currentMessages = newCache.get(currentConversation.id) || [];
      newCache.set(currentConversation.id, [...currentMessages, optimisticMessage]);
      return newCache;
    });
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversation.id 
          ? { ...conv, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    try {
      const serverMessage = await messagingApi.sendMessage(currentConversation.id, { content, files });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? serverMessage 
            : msg
        )
      );
      
      setMessageCache(prev => {
        const newCache = new Map(prev);
        const currentMessages = newCache.get(currentConversation.id) || [];
        const updatedMessages = currentMessages.map(msg => 
          msg.id === optimisticMessage.id ? serverMessage : msg
        );
        newCache.set(currentConversation.id, updatedMessages);
        return newCache;
      });
    } catch (error) {
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
      
      setMessageCache(prev => {
        const newCache = new Map(prev);
        const currentMessages = newCache.get(currentConversation.id) || [];
        const filteredMessages = currentMessages.filter(msg => msg.id !== optimisticMessage.id);
        newCache.set(currentConversation.id, filteredMessages);
        return newCache;
      });
      
      setError('Failed to send message');
    }
  }, [currentConversation]);

  const createConversation = useCallback(async (memberIds: number[], isGroup: boolean = false, name?: string) => {
    try {
      setError(null);
      const newConversation = await messagingApi.createConversation({
        memberIds,
        isGroup,
        name
      });
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      
      setMessageCache(prev => new Map(prev).set(newConversation.id, []));
      
      return newConversation;
    } catch (error) {
      setError('Failed to create conversation');
      return null;
    }
  }, []);

  const addMembersToConversation = useCallback(async (conversationId: number, newMemberIds: number[]) => {
    try {
      setError(null);
      const updatedConversation = await messagingApi.addMembersToConversation(conversationId, {
        newMemberIds
      });
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConversation);
      }
      
      return updatedConversation;
    } catch (error) {
      setError('Failed to add members to conversation');
      return null;
    }
  }, [currentConversation]);

  const findOrCreateDirectConversation = useCallback(async (userId: number) => {
    const currentUserId = getCurrentUserId();
    
    console.log('🔍 [Fallback] Looking for existing conversation with user:', userId);
    console.log('Current user ID:', currentUserId);
    console.log('Available conversations:', conversations.map(c => ({ 
      id: c.id, 
      isGroup: c.isGroup, 
      members: c.members.map(m => ({ userId: m.userId, user: m.user }))
    })));
    
    const existingConversation = conversations.find(conv => {
      if (conv.isGroup) {
        return false;
      }
      if (conv.members.length !== 2) {
        return false;
      }
      
      // Check both member.userId and member.user.id for compatibility
      const memberIds = conv.members.map(member => member.userId || member.user?.id).filter(Boolean);
      const hasCurrentUser = memberIds.includes(currentUserId);
      const hasTargetUser = memberIds.includes(userId);
      
      console.log(`[Fallback] Conversation ${conv.id}: memberIds=${memberIds}, hasCurrentUser=${hasCurrentUser}, hasTargetUser=${hasTargetUser}`);
      
      return hasCurrentUser && hasTargetUser;
    });

    if (existingConversation) {
      console.log('✅ [Fallback] Found existing conversation:', existingConversation.id);
    } else {
      console.log('❌ [Fallback] No existing conversation found, will create new one');
    }

    if (existingConversation) {
      setCurrentConversation(existingConversation);
      if (!messageCache.has(existingConversation.id)) {
        await fetchMessages(existingConversation.id);
      } else {
        setMessages(messageCache.get(existingConversation.id)!);
      }
      return existingConversation;
    } else {
      try {
        setError(null);
        const newConversation = await messagingApi.createConversation({
          memberIds: [userId, currentUserId],
          isGroup: false
        });
        
        
        // Check if conversation already exists before adding to prevent duplicates
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === newConversation.id);
          if (exists) {
            console.log('⚠️ [Fallback] Conversation already exists in state, not adding duplicate');
            return prev;
          }
          console.log('✅ [Fallback] Adding new conversation to state');
          return [newConversation, ...prev];
        });
        setCurrentConversation(newConversation);
        
        setMessageCache(prev => new Map(prev).set(newConversation.id, []));
        setMessages([]);
        
        // No need to refetch conversations - we already have the new one
        // setTimeout(() => {
        //   fetchConversations();
        // }, 100);
        
        return newConversation;
      } catch (error) {
        setError(`Failed to create conversation: ${error.response?.data?.error || error.message}`);
        return null;
      }
    }
  }, [conversations, fetchMessages]);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  const getCurrentUserId = useCallback(() => {
    if (conversations.length > 0 && conversations[0].members.length > 0) {
      const userCounts = new Map();
      conversations.forEach(conv => {
        conv.members.forEach(member => {
          if (member.user?.id) {
            userCounts.set(member.user.id, (userCounts.get(member.user.id) || 0) + 1);
          }
        });
      });
      
      let maxCount = 0;
      let currentUserId = 1;
      userCounts.forEach((count, userId) => {
        if (count > maxCount) {
          maxCount = count;
          currentUserId = userId;
        }
      });
      
      return currentUserId;
    }
    return 87;
  }, [conversations]);

  const getConversationName = useCallback((conversation: Conversation) => {
    if (conversation.isGroup && conversation.name) {
      return conversation.name;
    }
    
    if (!conversation.isGroup && conversation.members.length === 2) {
      const currentUserId = 87;
      const otherMember = conversation.members.find(member => 
        member.user && member.user.id !== currentUserId
      );
      return otherMember?.user?.name || otherMember?.user?.email?.split('@')[0] || 'Unknown User';
    }
    
    return 'Group Chat';
  }, [getCurrentUserId]);

  const getConversationRole = useCallback((conversation: Conversation) => {
    if (conversation.isGroup) {
      return `${conversation.members.length} members`;
    }
    
    if (!conversation.isGroup && conversation.members.length === 2) {
      const currentUserId = 87;
      const otherMember = conversation.members.find(member => 
        member.user && member.user.id !== currentUserId
      );
      return otherMember?.user?.email?.includes('@wegwiser.app') ? 'Product Manager' : 'Engineer';
    }
    
    return 'Group';
  }, [getCurrentUserId]);

  const clearMessageCache = useCallback(() => {
    setMessageCache(new Map());
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
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
    isConnected: false,
    connectionError: null
  };
};
