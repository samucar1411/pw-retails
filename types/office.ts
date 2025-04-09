export interface Office {
  id: number;
  syncVersion: string | null;
  Closed: boolean | null;
  ZipCode: string;
  Province: string;
  Phone: string;
  Mobile: string;
  Code: string;
  Name: string;
  ShortCode: string;
  Country: number;
  Fax: string;
  Email: string;
  CameraCount: number;
  NumberOfAccessDoors: number;
  Address: string;
  City: number;
  Geo: string;
  Company: number;
}

export interface OfficeCreateInput extends Omit<Office, 'id'> {}

export interface OfficeUpdateInput extends Partial<Omit<Office, 'id'>> {}

export type CreateOfficeDTO = Omit<Office, 'id'>;
export type UpdateOfficeDTO = Partial<CreateOfficeDTO>; 