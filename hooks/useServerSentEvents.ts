import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/context/notification-context';
import { Event } from '@/types/event';

export function useServerSentEvents(enabled: boolean = false) {
  const { addNotification } = useNotifications();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      // URL del endpoint SSE en tu backend
      const sseUrl = process.env.NEXT_PUBLIC_SSE_URL || 'https://sys.adminpy.com:18001/api/events/stream/';
      
      eventSourceRef.current = new EventSource(sseUrl);

      eventSourceRef.current.onopen = () => {
        console.log('✅ SSE conectado para eventos en tiempo real');
        reconnectAttempts.current = 0;
      };

      // Escuchar eventos de nuevos eventos
      eventSourceRef.current.addEventListener('new_event', (event) => {
        try {
          const eventData: Event = JSON.parse(event.data);
          console.log('🚨 Nuevo evento recibido via SSE:', eventData);
          addNotification(eventData);
        } catch (error) {
          console.error('Error procesando evento SSE:', error);
        }
      });

      // Escuchar heartbeat para mantener conexión
      eventSourceRef.current.addEventListener('heartbeat', (event) => {
        console.log('💓 Heartbeat recibido:', event.data);
      });

      eventSourceRef.current.onerror = (error) => {
        console.error('❌ Error en SSE:', error);
        
        // Intentar reconectar
        if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reintentando conexión SSE en ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            eventSourceRef.current?.close();
            connect();
          }, delay);
        }
      };

    } catch (error) {
      console.error('Error conectando SSE:', error);
    }
  }, [enabled, addNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
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
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnectAttempts: reconnectAttempts.current,
    connect,
    disconnect
  };
} 