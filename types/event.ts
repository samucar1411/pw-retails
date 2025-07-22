export interface Event {
  id: number;
  img_file: string | null;
  uuid: string;
  staff_name: string;
  image_name: string;
  created_at: string;
  device_name: string;
  office_name: string;
  status?: string | null;
  score?: string;
  blacklist?: string | null;
}

export type EventCreateInput = Omit<Event, 'id'>;
export type EventUpdateInput = Partial<Event>;

export interface EventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
} 