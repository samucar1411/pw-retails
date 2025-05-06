import { BaseEntity } from './common';

export type Office = BaseEntity & {
  Name: string;
  Code: string;
  ShortCode: string;
  Address: string;
  ZipCode: string;
  Province: string;
  Phone: string;
  Mobile: string;
  Fax?: string | null;
  Email: string;
  City: number;
  Company: number;
  Country: number;
  CameraCount: number;
  NumberOfAccessDoors: number;
  Geo?: string | null;
  Closed?: boolean | null;
  syncVersion?: string | null;
};

// Area type is kept here since it's a core entity and not defined elsewhere
export type Area = BaseEntity & {
  name: string;
  code: string;
  syncVersion?: string;
  isClosed?: boolean;
};

// Define the structure for the paginated API response
export type PaginatedOfficesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Office[];
};

export type OfficeCreateInput = Omit<Office, 'id'>;
export type OfficeUpdateInput = Partial<OfficeCreateInput>;

export type CreateOfficeDTO = Omit<Office, 'id'>;
export type UpdateOfficeDTO = Partial<CreateOfficeDTO>; 