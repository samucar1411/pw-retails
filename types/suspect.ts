

export type Suspect =  {
  // Basic Information
  id: string;
  Alias: string;
  PhysicalDescription: string;
  PhotoUrl: string;
  Status: number;
};

// For table display
export type SuspectTableItem = Suspect; 