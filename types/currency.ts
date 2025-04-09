export interface Currency {
  id: number;
  syncVersion: number;
  Closed: boolean;
  Code: string;
  RoundOff: number | null;
  ConvertionBase: number | null;
  ConvertionDirection: string | null;
  FrFactor: number | null;
  ToFactor: number | null;
  Alias: string;
}

export type CurrencyCreateInput = Omit<Currency, 'id' | 'syncVersion'>;

export type CurrencyUpdateInput = Partial<CurrencyCreateInput>;

export type CreateCurrencyDTO = Omit<Currency, 'id'>;
export type UpdateCurrencyDTO = Partial<CreateCurrencyDTO>; 