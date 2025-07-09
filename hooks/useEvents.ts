import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/event';
import { getAllEvents, getEventFilterOptions, EventFilters } from '@/services/event-service';

export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filterOptions: {
    offices: string[];
    staff: string[];
    devices: string[];
  };
  refreshEvents: () => Promise<void>;
  applyFilters: (filters: EventFilters) => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    offices: [] as string[],
    staff: [] as string[],
    devices: [] as string[],
  });

  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsResponse = await getAllEvents(filters);
      setEvents(eventsResponse.results);
      setTotalCount(eventsResponse.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await getEventFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const applyFilters = useCallback(async (filters: EventFilters) => {
    await fetchEvents(filters);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
    fetchFilterOptions();
  }, [fetchEvents, fetchFilterOptions]);

  return {
    events,
    loading,
    error,
    totalCount,
    filterOptions,
    refreshEvents,
    applyFilters,
  };
} 