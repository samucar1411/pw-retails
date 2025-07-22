import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/event';
import { getAllEvents, EventFilters } from '@/services/event-service';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState('1');
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchEvents = useCallback(async (pageNum: string, filters: EventFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsResponse = await getAllEvents({
        ...filters,
        page: pageNum
      });

      if (pageNum === '1') {
        setEvents(eventsResponse.results);
      } else {
        // Prevent duplicates by filtering out events that already exist
        setEvents(prev => {
          const existingIds = new Set(prev.map(event => event.id));
          const newEvents = eventsResponse.results.filter(event => !existingIds.has(event.id));
          return [...prev, ...newEvents];
        });
      }
      
      setTotalCount(eventsResponse.count);
      // Fix: Calculate hasNextPage based on current total events vs total count
      const currentTotalEvents = pageNum === '1' ? eventsResponse.results.length : events.length + eventsResponse.results.length;
      setHasNextPage(eventsResponse.results.length > 0 && currentTotalEvents < eventsResponse.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [events.length]);

  const refreshEvents = useCallback(() => {
    setPage('1');
    fetchEvents('1');
  }, [fetchEvents]);

  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !loading) {
      const nextPage = (parseInt(page) + 1).toString();
      setPage(nextPage);
      fetchEvents(nextPage);
    }
  }, [hasNextPage, loading, page, fetchEvents]);

  const applyFilters = useCallback((filters: EventFilters) => {
    setPage('1');
    fetchEvents('1', filters);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents('1');
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    totalCount,
    refreshEvents,
    applyFilters,
    fetchNextPage,
    hasNextPage,
  };
} 