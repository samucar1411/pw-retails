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
  ApiResponse,
} from "./api";

const ENDPOINT = "/api/events/";

// Datos simulados para utilizar cuando la API no está disponible
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

export const eventService = {
  getEvents: async (): Promise<EventsResponse> => {
    try {
      // Intentar obtener los datos de la API
      const response = await getResource<Event[]>(ENDPOINT);
      // Devolver los datos de la respuesta
      return { data: response.data };
    } catch (error: any) {
      console.error("Error fetching events:", error);
      
      // Siempre devolver datos simulados en caso de error
      return { data: mockEvents };
    }
  },

  getEvent: async (id: number): Promise<Event | null> => {
    try {
      const response = await getResource<Event>(ENDPOINT, id.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      
      // Devolver un evento simulado para el ID solicitado
      const mockEvent = mockEvents.find(event => event.id === id);
      return mockEvent || null;
    }
  },
};
