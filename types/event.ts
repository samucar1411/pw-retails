export interface Event {
  id: number;
  img_file: string | null;
  staff_name: string;
  image_name: string;
  created_at: string;
  device_name: string;
  office_name: string;
}

export type EventCreateInput = Omit<Event, 'id'>;
export type EventUpdateInput = Partial<Event>;

export interface EventsResponse {
  data: Event[];
} 