import { BaseEntity } from './common';

export type SuspectStatus = BaseEntity & {
  name: string;
};

export type Suspect = BaseEntity & {
  alias: string;
  statusId: number; // FK to SuspectStatus
  physicalDescription?: string;
  photoUrl?: string;
}; 