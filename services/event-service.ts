import { api } from './api';
import { Event, EventsResponse } from '@/types/event';

export interface EventFilters {
  office_name?: string;
  staff_name?: string;
  device_name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export async function getAllEvents(filters?: EventFilters): Promise<EventsResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const { data } = await api.get<EventsResponse>(`/api/events/${params.toString() ? `?${params.toString()}` : ''}`);
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty response instead of throwing to prevent app crash
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const { data } = await api.get<Event>(`/api/events/${id}/`);
    return data;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/events/${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

// Get unique values for filters
export async function getEventFilterOptions(): Promise<{
  offices: string[];
  staff: string[];
  devices: string[];
}> {
  try {
    const eventsResponse = await getAllEvents();
    const events = eventsResponse.results;
    
    const offices = [...new Set(events.map((e: Event) => e.office_name).filter(Boolean))];
    const staff = [...new Set(events.map((e: Event) => e.staff_name).filter(Boolean))];
    const devices = [...new Set(events.map((e: Event) => e.device_name).filter(Boolean))];
    
    return { offices, staff, devices };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { offices: [], staff: [], devices: [] };
  }
} 