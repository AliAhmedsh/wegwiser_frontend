import { useProductStore } from '@/entities/product/store';
import aiService, {
    ChatMessage,
    Conversation,
} from '@/lib/api/services/aiService';
import { create } from 'zustand';

const isValidProduct = (product: any): boolean => {
  return product && product.id && product.id > 0;
};

type Sender = 'AI' | 'User';

export interface SuggestedOption {
  id: string;
  label: string;
}

interface Message {
  sender: Sender;
  message: string;
  timestamp?: string;
  role?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  fullMessage?: string;
  attachedImages?: string[];
  attachedFiles?: Array<{ name: string; type: string; size: number }>;
  suggestedOptions?: SuggestedOption[];
}

interface AiStore {
  isShowAiWindow: boolean;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentConversationId: number | null;
  conversations: Conversation[];
  conversationsLoading: boolean;

  addMessage: (message: string, sender: Sender) => void;
  sendMessage: (message: string, files?: File[]) => Promise<void>;
  clearMessages: () => void;
  updateTypingMessage: (messageIndex: number, newText: string) => void;

  toggleAiWindow: () => void;
  setError: (error: string | null) => void;

  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: number) => Promise<void>;
  createNewConversation: () => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
  updateConversationTitle: (conversationId: number, title: string) => Promise<void>;
  clearInvalidProduct: () => void;
}

const useAiStore = create<AiStore>((set, get) => {
  const { chosenProduct, clearChosenProduct } = useProductStore.getState();
  if (chosenProduct && !isValidProduct(chosenProduct)) {
    console.log('Store initialization: Invalid product detected, clearing:', chosenProduct);
    clearChosenProduct();
  }

  return {
    isShowAiWindow: false,
    messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
    isLoading: false,
    error: null,
    currentConversationId: null,
    conversations: [],
    conversationsLoading: false,

  addMessage: (message: string, sender: Sender, role?: string) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          message,
          sender,
          role,
          timestamp: new Date().toISOString(),
          isLoading: sender === 'AI' ? false : undefined,
        },
      ],
    })),

  sendMessage: async (message: string, files?: File[]) => {
    const state = get();

    const imageUrls: string[] = [];
    const attachedFiles: Array<{ name: string; type: string; size: number }> = [];
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          imageUrls.push(URL.createObjectURL(file));
        } else {
          attachedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size
          });
        }
      });
    }

    set((state) => ({
      messages: [
        ...state.messages,
        {
          message,
          sender: 'User' as const,
          timestamp: new Date().toISOString(),
          attachedImages: imageUrls.length > 0 ? imageUrls : undefined,
          attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
        },
        {
          message: '',
          sender: 'AI' as const,
          isLoading: true,
          isTyping: false,
          timestamp: new Date().toISOString(),
        },
      ],
      isLoading: true,
      error: null,
    }));

    try {
      const { chosenProduct, clearChosenProduct } = useProductStore.getState();
      console.log('AI Store - chosenProduct:', chosenProduct);
      console.log('AI Store - productId being sent:', chosenProduct?.id);
      
      const productId = isValidProduct(chosenProduct) ? chosenProduct.id : undefined;
      console.log('AI Store - chosenProduct validation:', { chosenProduct, isValid: isValidProduct(chosenProduct), productId });
      
      // NEW: Use FastAPI RAG-based AI Partner Chat endpoint
      // Note: File uploads are not supported in the new endpoint yet
      if (files && files.length > 0) {
        console.warn('[AiStore] File uploads not yet supported in new AI Partner Chat endpoint');
        // TODO: Handle file uploads when the endpoint supports them
      }

      const requestData = {
          message,
          ...(state.currentConversationId && {
          conversation_id: state.currentConversationId,
          }),
          ...(productId && {
          product_id: productId,
          }),
        context_mode: 'full' as const, // Use full context by default
        };

      const response = await aiService.aiPartnerChat(requestData);

      const suggestedOptions = (response.suggested_options || []).map((o: { id: string; label: string }) => ({ id: o.id, label: o.label }));

      const typingEffect = (fullText: string, messageIndex: number, suggestedOpts: SuggestedOption[]) => {
        let currentIndex = 0;
        const chunkSize = 10;
        const typingSpeed = 15;

        const typeNextChunk = () => {
          if (currentIndex < fullText.length) {
            const nextIndex = Math.min(
              currentIndex + chunkSize,
              fullText.length
            );
            const currentText = fullText.substring(0, nextIndex);

            set((state) => ({
              messages: state.messages.map((msg, index) => {
                if (index === messageIndex) {
                  return {
                    ...msg,
                    message: currentText,
                    isLoading: false,
                    isTyping: nextIndex < fullText.length,
                    fullMessage: fullText,
                    suggestedOptions: suggestedOpts.length ? suggestedOpts : undefined,
                  };
                }
                return msg;
              }),
            }));

            currentIndex = nextIndex;
            setTimeout(typeNextChunk, typingSpeed);
          } else {
            set((state) => ({
              messages: state.messages.map((msg, index) => {
                if (index === messageIndex) {
                  return {
                    ...msg,
                    isTyping: false,
                  };
                }
                return msg;
              }),
              isLoading: false,
            }));
          }
        };

        typeNextChunk();
      };

      const aiMessageIndex = get().messages.length - 1;
      typingEffect(response.reply, aiMessageIndex, suggestedOptions);

      if (response.conversation_id && !get().currentConversationId) {
        set({
          currentConversationId: response.conversation_id,
          error: null,
        });

        get().loadConversations();
      } else {
        set({ error: null });
      }
    } catch (error: any) {
      console.error('AI chat error:', error);

      if (error.response?.data?.error === 'Product not found') {
        console.log('Product not found, clearing chosen product');
        clearChosenProduct();
      }

      set((state) => ({
        messages: state.messages.map((msg, index) => {
          if (index === state.messages.length - 1 && msg.isLoading) {
            return {
              ...msg,
              message: 'Sorry, I encountered an error. Please try again.',
              isLoading: false,
              isTyping: false,
            };
          }
          return msg;
        }),
        isLoading: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to get AI response',
      }));
    }
  },

  updateTypingMessage: (messageIndex: number, newText: string) => {
    set((state) => ({
      messages: state.messages.map((msg, index) => {
        if (index === messageIndex) {
          return {
            ...msg,
            message: newText,
          };
        }
        return msg;
      }),
    }));
  },

  clearMessages: () =>
    set({
      messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
      error: null,
    }),

  toggleAiWindow: (() => {
    let isToggling = false;
    return () => {
      if (isToggling) {
        console.log('[AiStore] toggleAiWindow already in progress, ignoring duplicate call');
        return;
      }
      
      isToggling = true;
      const currentState = get().isShowAiWindow;
      console.log('[AiStore] toggleAiWindow called, current state:', currentState);
      
      const newState = !currentState;
      set({ isShowAiWindow: newState });
      console.log('[AiStore] toggleAiWindow set to:', newState);
      
      setTimeout(() => {
        isToggling = false;
      }, 200);
    };
  })(),

  setError: (error: string | null) => set({ error }),

  loadConversations: async () => {
    set({ conversationsLoading: true });
    try {
      const { chosenProduct, clearChosenProduct } = useProductStore.getState();
      console.log('Loading conversations for product:', chosenProduct?.id);
      
      const productId = isValidProduct(chosenProduct) ? chosenProduct.id : undefined;
      
      if (chosenProduct && !isValidProduct(chosenProduct)) {
        console.log('Invalid product detected, clearing chosen product:', chosenProduct);
        clearChosenProduct();
      }
      
      console.log('Final productId being sent to API:', productId);
      
      // NEW: Use FastAPI RAG-based endpoint with pagination
      // API returns List[ConversationSummary] with: id, title, product_id, message_count, created_at, updated_at
      const conversations = await aiService.getAiPartnerConversations(50, 0);
      
      // Transform response to match expected format
      // API response is an array of ConversationSummary objects
      const transformedConversations: Conversation[] = (Array.isArray(conversations) ? conversations : []).map((conv: any) => ({
        id: conv.id,
        title: conv.title || 'Untitled Conversation',
        createdAt: conv.created_at || new Date().toISOString(),
        updatedAt: conv.updated_at || new Date().toISOString(),
        _count: {
          messages: conv.message_count || 0,
        },
      }));
      
      console.log('Conversations loaded:', transformedConversations.length);
      set({
        conversations: transformedConversations,
        conversationsLoading: false,
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ conversationsLoading: false });
    }
  },

  loadConversation: async (conversationId: number) => {
    try {
      // NEW: Use FastAPI RAG-based endpoint GET /ai-partner/conversations/{conversation_id}
      // API returns ConversationDetail: { id, title, product_id, created_at, updated_at, messages[] }
      // Each message: { id, role: "user" | "assistant", content, created_at }
      const response = await aiService.getAiPartnerConversation(conversationId);

      // Transform response to match expected format
      // API response format: { id, title, product_id, created_at, updated_at, messages: [...] }
      const messages: Message[] = (response.messages || []).map((msg: any) => ({
        sender: msg.role === 'user' ? 'User' : 'AI', // API uses "user" or "assistant"
        message: msg.content || '', // API uses "content" field
        timestamp: msg.created_at || new Date().toISOString(),
        role: undefined, // Not in API response
        isLoading: false,
        isTyping: false,
      }));

      set({
        currentConversationId: conversationId,
        messages:
          messages.length > 0
            ? messages
            : [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
        error: null,
      });
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      
      // Handle specific error cases from API
      if (error.response?.status === 404) {
        set({ error: 'Conversation not found' });
      } else if (error.response?.status === 403) {
        set({ error: 'You do not have access to this conversation' });
      } else {
      set({ error: 'Failed to load conversation' });
      }
    }
  },

  createNewConversation: async () => {
    try {
      set({
        currentConversationId: null,
        messages: [{ message: 'Hi, what do you want to ask?', sender: 'AI' }],
        error: null,
      });
    } catch (error) {
      console.error('Error creating new conversation:', error);
      set({ error: 'Failed to create new conversation' });
    }
  },

  deleteConversation: async (conversationId: number) => {
    try {
      // NEW: Use FastAPI RAG-based DELETE endpoint
      // API returns: { status: "deleted", conversation_id: number, message: string }
      await aiService.deleteAiPartnerConversation(conversationId);

      await get().loadConversations();

      if (get().currentConversationId === conversationId) {
        await get().createNewConversation();
      }
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      
      // Handle specific error cases from API
      if (error.response?.status === 404) {
        set({ error: 'Conversation not found' });
      } else if (error.response?.status === 403) {
        set({ error: 'You do not have permission to delete this conversation' });
      } else {
      set({ error: 'Failed to delete conversation' });
      }
    }
  },

  updateConversationTitle: async (conversationId: number, title: string) => {
    try {
      // Use FastAPI PUT endpoint: PUT /ai-partner/conversations/{conversation_id}
      // Request body: { title: string (1-200 characters) }
      // Response: ConversationDetail (updated conversation with messages)
      await aiService.updateAiPartnerConversationTitle(conversationId, title);

      // Reload conversations to reflect the updated title
      await get().loadConversations();

      // If this is the current conversation, reload it to get updated title
      if (get().currentConversationId === conversationId) {
        await get().loadConversation(conversationId);
      }
    } catch (error: any) {
      console.error('Error updating conversation title:', error);
      
      // Handle specific error cases from API
      if (error.response?.status === 400) {
        set({ error: 'Invalid title (must be 1-200 characters)' });
      } else if (error.response?.status === 404) {
        set({ error: 'Conversation not found' });
      } else if (error.response?.status === 403) {
        set({ error: 'You do not have permission to update this conversation' });
      } else {
        set({ error: 'Failed to update conversation title' });
      }
      throw error; // Re-throw to allow UI to handle it
    }
  },

  clearInvalidProduct: () => {
    const { chosenProduct, clearChosenProduct } = useProductStore.getState();
    if (chosenProduct && !isValidProduct(chosenProduct)) {
      console.log('Manually clearing invalid product:', chosenProduct);
      clearChosenProduct();
      get().loadConversations();
    } else {
      console.log('No invalid product found');
    }
  },
  };
});

export default useAiStore;
