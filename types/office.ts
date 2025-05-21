import { BaseEntity } from './common';

export type Office = BaseEntity & {
  syncVersion: string | null;
  Closed: boolean | null;
  ZipCode: string;
  Province: string;
  Phone: string;
  Mobile: string;
  Code: string;
  Name: string;
  ShortCode: string;
  Fax: string | null;
  Email: string;
  CameraCount: number;
  NumberOfAccessDoors: number;
  Address: string;
  Geo: string | null;
  Country: number;
  City: number;
  Company: number;
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