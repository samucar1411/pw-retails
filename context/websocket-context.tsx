'use client';

import React, { createContext, useContext } from 'react';
import { useWebSocketEvents } from '@/hooks/useWebSocketEvents';

interface WebSocketContextType {
  isConnected: boolean;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, reconnectAttempts, connect, disconnect } = useWebSocketEvents(true);

  const value: WebSocketContextType = {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketStatus() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketStatus must be used within a WebSocketProvider');
  }
  return context;
} 