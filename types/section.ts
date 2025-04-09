export interface Section {
  id: number;
  syncVersion: string | null;
  Closed: boolean | null;
  Code: string;
  Name: string;
  Company: number;
}

export interface SectionCreateInput extends Omit<Section, 'id'> {}

export interface SectionUpdateInput extends Partial<Omit<Section, 'id'>> {}

export type CreateSectionDTO = Omit<Section, 'id'>;
export type UpdateSectionDTO = Partial<CreateSectionDTO>; 