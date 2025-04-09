export interface City {
  id: number;
  syncVersion: number;
  Closed: boolean;
  Code: string;
  Name: string;
  Country: string;
}

export type CityCreateInput = Omit<City, 'id' | 'syncVersion'>;

export type CityUpdateInput = Partial<CityCreateInput>;

export type CreateCityDTO = Omit<City, 'id'>;
export type UpdateCityDTO = Partial<CreateCityDTO>; 