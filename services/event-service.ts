import { Event } from '@/types/event';
import { api } from './api';

export interface EventFilters {
  office?: string;
  device?: string;
  staff?: string;
  severity?: 'high' | 'medium' | 'low';
  startDate?: string;
  endDate?: string;
  search?: string;
  ordering?: string;
  page?: string;
}

export interface EventsResponse {
  results: Event[];
  count: number;
  page: number;
}

export interface FilterOptions {
  offices: string[];
  staff: string[];
  devices: string[];
}

export async function getAllEvents(filters: EventFilters = {}): Promise<EventsResponse> {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  // Ensure page is always present
  if (!queryParams.has('page')) {
    queryParams.append('page', '1');
  }

  try {
    const response = await api.get<EventsResponse>(`/api/events?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}
