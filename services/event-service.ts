import { Event, EventCreateInput, EventUpdateInput, EventsResponse } from '@/types/event';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/events/';

export const eventService = {
  getEvents: async (): Promise<EventsResponse> => {
    try {
      const data = await getResource<Event[]>('/api/events/');
      return data;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return { data: [] };
    }
  },

  getEvent: async (id: number): Promise<Event | null> => {
    try {
      const response = await getResource<Event>(ENDPOINT, id.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }
}; 