import { VideoManager } from "./video-manager";

export interface OfficeCamManager {
  id: number;
  syncVersion: string | null;
  Closed: boolean | null;
  Type: VideoManager;
  Enable: boolean;
  EnableAuthentication: boolean;
  Username: string;
  Password: string;
  Address: string;
  Port: number;
  Path: string;
  Company: number;
  Office: number;
  Name: string;
  Description: string;
  User: string;
}

export interface OfficeCamManagerCreateInput extends Omit<OfficeCamManager, 'id'> {}

export interface OfficeCamManagerUpdateInput extends Partial<Omit<OfficeCamManager, 'id'>> {}

export type CreateOfficeCamManagerDTO = Omit<OfficeCamManager, 'id'>;
export type UpdateOfficeCamManagerDTO = Partial<CreateOfficeCamManagerDTO>; 