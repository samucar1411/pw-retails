export interface Lang {
  id: number;
  name: string;
  available: boolean;
}

export interface LangCreateInput extends Omit<Lang, 'id'> {}

export interface LangUpdateInput extends Partial<Omit<Lang, 'id'>> {}

export type CreateLangDTO = Omit<Lang, 'id'>;
export type UpdateLangDTO = Partial<CreateLangDTO>; 