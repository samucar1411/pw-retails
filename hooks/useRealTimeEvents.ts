import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/context/notification-context';
import { getAllEvents } from '@/services/event-service';

export function useRealTimeEvents(enabled: boolean = false, pollingInterval: number = 30000) {
  const { addNotification } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventIdRef = useRef<number | null>(null);

  const checkForNewEvents = useCallback(async () => {
    try {
      // Get recent events (last hour or so)
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const eventsResponse = await getAllEvents({
        date_from: oneHourAgo.toISOString().split('T')[0],
        date_to: now.toISOString().split('T')[0]
      });

      const events = eventsResponse.results || [];

      if (events.length > 0) {
        // Sort events by creation date (newest first)
        const sortedEvents = events.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Check for new events since last check
        if (lastEventIdRef.current !== null) {
          const newEvents = sortedEvents.filter(event => 
            event.id > lastEventIdRef.current!
          );

          // Add notifications for new events
          newEvents.forEach(event => {
            console.log('🚨 Nuevo evento detectado:', event);
            addNotification(event);
          });

          if (newEvents.length > 0) {
            console.log(`✅ Se agregaron ${newEvents.length} nuevas notificaciones`);
          }
        }

        // Update the last event ID
        if (sortedEvents.length > 0) {
          lastEventIdRef.current = sortedEvents[0].id;
        }
      }
    } catch (error) {
      console.error('Error checking for new events:', error);
    }
  }, [addNotification]);

  const initializeLastEventId = useCallback(async () => {
    try {
      const eventsResponse = await getAllEvents({
        page_size: 1 // Get just the latest event
      });
      
      const events = eventsResponse.results || [];
      
      if (events.length > 0) {
        lastEventIdRef.current = events[0].id;
      }
    } catch (error) {
      console.error('Error initializing last event ID:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize with the latest event ID
    initializeLastEventId();

    // Set up polling interval
    intervalRef.current = setInterval(checkForNewEvents, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollingInterval, checkForNewEvents, initializeLastEventId]);

  return null;
} 