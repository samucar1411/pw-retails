import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/context/notification-context';
import { Event } from '@/types/event';

interface WebSocketMessage {
  type: 'new_event' | 'event_update' | 'ping';
  data?: Event;
  timestamp?: string;
}

export function useWebSocketEvents(enabled: boolean = false) {
  const { addNotification } = useNotifications();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      // Reemplaza con tu URL de WebSocket
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://sys.adminpy.com:18001/ws/events/';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket conectado para eventos en tiempo real');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'new_event':
              if (message.data) {
                console.log('🚨 Nuevo evento recibido via WebSocket:', message.data);
                addNotification(message.data);
              }
              break;
            
            case 'event_update':
              console.log('📝 Evento actualizado:', message.data);
              // Aquí podrías actualizar el evento existente si es necesario
              break;
            
            case 'ping':
              // Responder al ping para mantener la conexión viva
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'pong' }));
              }
              break;
          }
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        
        // Intentar reconectar si no fue un cierre intencional
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reintentando conexión en ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
      };

    } catch (error) {
      console.error('Error conectando WebSocket:', error);
    }
  }, [enabled, addNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexión intencional');
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttempts.current,
    connect,
    disconnect
  };
} 