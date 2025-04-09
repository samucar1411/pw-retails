export interface WorkTeam {
  id: number;
  syncVersion: string | null;
  Closed: boolean | null;
  Code: string;
  Name: string;
}

export interface WorkTeamCreateInput extends Omit<WorkTeam, 'id'> {}

export interface WorkTeamUpdateInput extends Partial<Omit<WorkTeam, 'id'>> {}

export type CreateWorkTeamDTO = Omit<WorkTeam, 'id'>;
export type UpdateWorkTeamDTO = Partial<CreateWorkTeamDTO>; 