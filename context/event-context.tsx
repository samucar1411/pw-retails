import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { Event, EventsResponse } from '@/types/event';
import { eventService } from '@/services/event-service';
import { toast } from 'sonner';
import { Building2, User, Smartphone } from 'lucide-react';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalEvents: number;
  perPage: number;
  hasNewEvents: boolean;
  fetchEvents: () => Promise<void>;
  markNewEventsAsSeen: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const POLLING_INTERVAL = 10000; // Poll every 10 seconds

function EventToast({ event }: { event: Event }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">{event.staff_name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-primary" />
        <span className="text-foreground">{event.device_name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-foreground">{event.office_name}</span>
      </div>
    </div>
  );
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perPage] = useState(9);
  const [lastEventTimestamp, setLastEventTimestamp] = useState<number | null>(null);
  const [hasNewEvents, setHasNewEvents] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const response = await eventService.getEvents();
      
      // Sort events by created_at in descending order (newest first)
      const sortedEvents = response.data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // If this is not the initial load, check for new events
      if (lastEventTimestamp && sortedEvents.length > 0) {
        const latestEventTime = new Date(sortedEvents[0].created_at).getTime();
        if (latestEventTime > lastEventTimestamp) {
          setHasNewEvents(true);
          
          // Find new events
          const newEvents = sortedEvents.filter(event => 
            new Date(event.created_at).getTime() > (lastEventTimestamp ?? 0)
          );

          // Show toast for each new event
          newEvents.forEach(event => {
            toast.message(
              <EventToast event={event} />,
              {
                duration: 5000,
                position: "top-right",
                icon: "🔔",
                style: {
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                },
              }
            );
          });
        }
      }

      setEvents(sortedEvents);
      
      // Update the last event timestamp if we have events
      if (sortedEvents.length > 0) {
        setLastEventTimestamp(new Date(sortedEvents[0].created_at).getTime());
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    }
  }, [lastEventTimestamp]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchEvents().finally(() => setLoading(false));
  }, []);

  // Set up polling
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchEvents();
    }, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [fetchEvents]);

  // Calculate total events
  const totalEvents = useMemo(() => events.length, [events]);

  const markNewEventsAsSeen = useCallback(() => {
    setHasNewEvents(false);
  }, []);

  const value = {
    events,
    loading,
    error,
    totalEvents,
    perPage,
    hasNewEvents,
    fetchEvents,
    markNewEventsAsSeen,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
} 