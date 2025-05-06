// Datos de ejemplo para el preview de incidente/denuncia
export const singleMockIncidentData = {
  id: "INC-F78A3B12",
  branchId: "punto-560",
  date: "2023-04-22",
  time: "15:30",
  type: "hurto",
  description: "Se reporta el hurto de mercadería en el depósito principal. El incidente ocurrió durante la tarde cuando se encontraba poco personal. Los artículos sustraídos incluyen equipos electrónicos y mercadería de valor.",
  cash: 250000,
  merchandise: 3500000,
  otherLosses: 150000,
  total: 3900000,
  suspects: [
    { id: "susp-1", alias: "Juan Pérez", status: "detenido", description: "Hombre de aprox. 30 años, 1.75m, cabello negro corto", imageUrl: "https://randomuser.me/api/portraits/men/42.jpg" },
    { id: "susp-2", alias: "Carlos Martínez", status: "libre", description: "Hombre de aprox. 25 años, 1.70m, tatuaje en brazo derecho", imageUrl: "https://randomuser.me/api/portraits/men/36.jpg" },
    { id: "susp-3", alias: "María González", status: "detenido", description: "Mujer de aprox. 28 años, 1.65m, cabello castaño largo", imageUrl: "https://randomuser.me/api/portraits/women/26.jpg" }
  ],
  notes: "El sospechoso principal fue identificado. Se han identificado dos cómplices. Coordinado con policía local.",
  created_at: new Date(2023, 3, 22, 16, 0).toISOString()
};

// Lista de incidentes de ejemplo para la tabla
export const mockIncidentList = [
  singleMockIncidentData,
  {
    id: "INC-A1B2C3D4",
    branchId: "punto-430",
    date: "2023-04-21",
    time: "10:00",
    type: "robo",
    description: "Robo a mano armada en la entrada principal. Se llevaron efectivo de la caja registradora.",
    cash: 1500000,
    merchandise: 0,
    otherLosses: 0,
    total: 1500000,
    suspects: [
      { id: "susp-4", alias: "Desconocido 1", status: "libre", description: "Sujeto con casco de moto y tapabocas." },
      { id: "susp-5", alias: "Desconocido 2", status: "libre", description: "Esperaba afuera en una motocicleta roja." }
    ],
    notes: "Se revisan cámaras de seguridad externas. Testigos mencionan motocicleta roja sin patente visible.",
    created_at: new Date(2023, 3, 21, 10, 30).toISOString()
  },
  {
    id: "INC-X9Y8Z7W6",
    branchId: "punto-212",
    date: "2023-04-20",
    time: "22:15",
    type: "vandalismo",
    description: "Graffiti en la fachada principal del local y rotura de vidriera.",
    cash: 0,
    merchandise: 0,
    otherLosses: 850000, // Costo estimado de reparación
    total: 850000,
    suspects: [], // Sin sospechosos identificados
    notes: "Ocurrió durante la noche. Vecinos no reportaron actividad sospechosa.",
    created_at: new Date(2023, 3, 21, 8, 0).toISOString() 
  },
    {
    id: "INC-L4M5N6P7",
    branchId: "punto-105",
    date: "2023-04-19",
    time: "14:00",
    type: "otro",
    description: "Intento de estafa telefónica solicitando datos bancarios de la empresa.",
    cash: 0,
    merchandise: 0,
    otherLosses: 0, 
    total: 0,
    suspects: [], 
    notes: "Llamada proveniente de número desconocido. Se alertó al personal.",
    created_at: new Date(2023, 3, 19, 14, 15).toISOString() 
  }
];

export function loadMockData() {
  // Guardar datos de ejemplo del *primer* incidente para el preview individual
  localStorage.setItem('current_incident', JSON.stringify(singleMockIncidentData));
  return singleMockIncidentData;
} 