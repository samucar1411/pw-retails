export type BaseEntity = {
  id: number | string; // Primary key
};

export type File = {
  id: number;
  url: string;
  name: string;
  contentType: string;
};

// Common status type that can be reused
export type Status = {
  id: number;
  name: string;
}; 