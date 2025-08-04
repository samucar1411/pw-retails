export interface ChangeHistory {
  id: string;
  entityType: 'incident' | 'suspect' | 'office' | 'company';
  entityId: string;
  changeType: 'create' | 'update' | 'delete';
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy: string;
  changedByName?: string;
  changeDate: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ChangeHistoryCreateInput {
  entityType: 'incident' | 'suspect' | 'office' | 'company';
  entityId: string;
  changeType: 'create' | 'update' | 'delete';
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ChangeHistoryFilters {
  entityType?: string;
  entityId?: string;
  changeType?: string;
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}