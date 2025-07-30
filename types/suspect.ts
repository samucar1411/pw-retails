

export interface SuspectStatus {
  id: number;
  Name: string;
}

export interface Suspect {
  id: string;
  Alias: string;
  Status: number;
  PhotoUrl?: string;
  LastSeen?: string;
  IncidentsCount?: number;
  PhysicalDescription?: string;
  Tags?: Record<string, string>; // Changed to object format
  // Nuevos campos
  CI?: string;
  Name?: string;
  LastName?: string;
  LastName2?: string;
  Nationality?: string;
}

// For table display
export type SuspectTableItem = Suspect; 

export interface SuspectPartnerRelation {
  id?: string;
  notes: string;
  tags: string[] | null;
  suspect: string | null;  // ID of the main suspect
  partners: string[];      // Array of partner suspect IDs
}

export interface SuspectPartnerRelationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SuspectPartnerRelation[];
} 