export interface Nationality {
  id: number;
  syncVersion: number;
  Closed: boolean;
  Code: string;
  Name: string;
}

export type NationalityCreateInput = Omit<Nationality, 'id' | 'syncVersion'>;
export type NationalityUpdateInput = Partial<NationalityCreateInput>;

export type CreateNationalityDTO = Omit<Nationality, 'id'>;
export type UpdateNationalityDTO = Partial<CreateNationalityDTO>; 