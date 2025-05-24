

export interface SuspectStatus {
  id: number;
  Name: string;
}

export interface Suspect {
  // Basic Information
  id: string;
  Alias: string;
  PhysicalDescription: string;
  PhotoUrl: string;
  Status: number; // This should be the ID of the status
  StatusDetails?: SuspectStatus; // Optional details about the status
}

// For table display
export type SuspectTableItem = Suspect; 