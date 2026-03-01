import { getCookie } from '@/lib/config/api';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  onMessageReceived?: (message: any) => void;
  onConversationUpdated?: (conversation: any) => void;
  onNewConversation?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useSocket = ({ onMessageReceived, onConversationUpdated, onNewConversation, onError }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const onMessageReceivedRef = useRef(onMessageReceived);
  const onConversationUpdatedRef = useRef(onConversationUpdated);
  const onNewConversationRef = useRef(onNewConversation);
  const onErrorRef = useRef(onError);


  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onConversationUpdatedRef.current = onConversationUpdated;
    onNewConversationRef.current = onNewConversation;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    if (isConnectingRef.current) {
      return;
    }

    isInitializedRef.current = true;
    let token = getCookie('access_token');
    if (!token) {
      token = getCookie('token');
    }

    if (!token) {
      setConnectionError('Authentication required');
      return;
    }

    isConnectingRef.current = true;

    try {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';     
      const isHttpsToHttp = typeof window !== 'undefined' && 
                           window.location.protocol === 'https:' && 
                           socketUrl.startsWith('http://');
      
      const socket = io(socketUrl, {
        transports: isHttpsToHttp ? ['polling'] : ['websocket', 'polling'],
        autoConnect: true,
        auth: {
          token: token
        },
        timeout: 10000,
        forceNew: true,
        upgrade: !isHttpsToHttp,
        rememberUpgrade: !isHttpsToHttp,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        isConnectingRef.current = false;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        isConnectingRef.current = false;
        
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected');
        } else if (reason !== 'io client disconnect') {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnectingRef.current) {
              socket.connect();
            }
          }, 2000);
        }
      });

      socket.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionError('Failed to connect to messaging server');
        onErrorRef.current?.('Failed to connect to messaging server');
        isConnectingRef.current = false;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isConnectingRef.current && socketRef.current) {
            socketRef.current.connect();
          }
        }, 5000);
      });

      socket.on('receiveMessage', (message) => {
        onMessageReceivedRef.current?.(message);
      });

      socket.on('conversationUpdated', (conversation) => {
        onConversationUpdatedRef.current?.(conversation);
      });

      socket.on('newConversation', (data) => {
        onNewConversationRef.current?.(data);
      });

      socket.on('error', (error) => {
        setConnectionError(error);
        onErrorRef.current?.(error);
      });

      return () => {
        isConnectingRef.current = false;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        socket.disconnect();
      };
    } catch (error) {
      setConnectionError('Failed to initialize connection');
      onErrorRef.current?.('Failed to initialize connection');
    }
  }, []);

  const joinConversation = (conversationId: number) => {
    if (socketRef.current) {
      socketRef.current.emit('joinConversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: number) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveConversation', conversationId);
    }
  };

  const sendMessage = (conversationId: number, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { conversationId, content });
    }
  };

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    isConnected,
    connectionError,
  };
};