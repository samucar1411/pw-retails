import {
  Event,
  EventCreateInput,
  EventUpdateInput,
  EventsResponse,
} from "@/types/event";
import {
  getResource,
  createResource,
  updateResource,
  deleteResource,
} from "./api";

const ENDPOINT = "/api/events/";

export const eventService = {
  getEvents: async (): Promise<EventsResponse> => {
    try {
      const data = await getResource<Event[]>("/api/events/");
      return data;
    } catch (error: any) {
      console.error("Error fetching events:", error);
      // Proporcionar datos de prueba cuando la API no está disponible
      const mockEvents: Event[] = [
        {
          id: 1,
          img_file: null,
          staff_name: "Juan Pérez",
          image_name: "evento1.jpg",
          created_at: new Date().toISOString(),
          device_name: "Cámara Principal",
          office_name: "Oficina Central",
        },
        {
          id: 2,
          img_file: null,
          staff_name: "María López",
          image_name: "evento2.jpg",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          device_name: "Cámara Entrada",
          office_name: "Sucursal Norte",
        },
        {
          id: 3,
          img_file: null,
          staff_name: "Carlos Rodríguez",
          image_name: "evento3.jpg",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          device_name: "Cámara Pasillo",
          office_name: "Sucursal Sur",
        },
      ];
      return { data: mockEvents };
    }
  },

  getEvent: async (id: number): Promise<Event | null> => {
    try {
      const response = await getResource<Event>(ENDPOINT, id.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  },
};
