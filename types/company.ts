export interface Company {
  id: string;
  name: string;
  emp_qty: number;
  country: string;
  business_name: string;
  identification_number: string;
  legal_names: string;
  legal_last_names: string;
  legal_identification_number: string;
  economy_activity: string;
  contact: string;
  email: string;
  image_url: string;
}

export type CompanyCreateInput = Omit<Company, 'id'> & {
  image?: FileList;
};

export interface CompanyUpdateInput extends Partial<Omit<Company, 'id'>> {}

export type CreateCompanyDTO = Omit<Company, 'id'>;
export type UpdateCompanyDTO = Partial<CreateCompanyDTO>; 