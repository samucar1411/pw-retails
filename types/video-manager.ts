export interface VideoManager {
  id: number;
  syncVersion: string | null;
  Closed: boolean | null;
  Code: string;
}

export type VideoManagerCreateInput = Omit<VideoManager, 'id' | 'syncVersion'>;

export type VideoManagerUpdateInput = Partial<VideoManagerCreateInput>;

export type CreateVideoManagerDTO = Omit<VideoManager, 'id'>;
export type UpdateVideoManagerDTO = Partial<CreateVideoManagerDTO>; 