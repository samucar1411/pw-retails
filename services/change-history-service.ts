import { api } from './api';
import { ChangeHistory, ChangeHistoryCreateInput, ChangeHistoryFilters } from '@/types/change-history';

export async function createChangeRecord(data: ChangeHistoryCreateInput): Promise<ChangeHistory> {
  const response = await api.post('/api/change-history/', {
    entity_type: data.entityType,
    entity_id: data.entityId,
    change_type: data.changeType,
    field_name: data.fieldName,
    old_value: data.oldValue,
    new_value: data.newValue,
    changed_by: data.changedBy,
    description: data.description,
    metadata: data.metadata,
  });
  return response.data;
}

export async function getChangeHistory(
  entityType: string,
  entityId: string,
  filters?: ChangeHistoryFilters
): Promise<{ results: ChangeHistory[]; count: number }> {
  const params: Record<string, string> = {
    entity_type: entityType,
    entity_id: entityId,
  };

  if (filters?.changeType) params.change_type = filters.changeType;
  if (filters?.changedBy) params.changed_by = filters.changedBy;
  if (filters?.dateFrom) params.date_from = filters.dateFrom;
  if (filters?.dateTo) params.date_to = filters.dateTo;

  const response = await api.get('/api/change-history/', { params });
  
  return {
    results: response.data.results?.map((item: any) => ({
      id: item.id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      changeType: item.change_type,
      fieldName: item.field_name,
      oldValue: item.old_value,
      newValue: item.new_value,
      changedBy: item.changed_by,
      changedByName: item.changed_by_name,
      changeDate: item.change_date || item.created_at,
      description: item.description,
      metadata: item.metadata,
    })) || [],
    count: response.data.count || 0,
  };
}

export async function getAllChangeHistory(filters?: ChangeHistoryFilters): Promise<{ results: ChangeHistory[]; count: number }> {
  const params: Record<string, string> = {};
  
  if (filters?.entityType) params.entity_type = filters.entityType;
  if (filters?.entityId) params.entity_id = filters.entityId;
  if (filters?.changeType) params.change_type = filters.changeType;
  if (filters?.changedBy) params.changed_by = filters.changedBy;
  if (filters?.dateFrom) params.date_from = filters.dateFrom;
  if (filters?.dateTo) params.date_to = filters.dateTo;

  const response = await api.get('/api/change-history/', { params });
  
  return {
    results: response.data.results?.map((item: any) => ({
      id: item.id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      changeType: item.change_type,
      fieldName: item.field_name,
      oldValue: item.old_value,
      newValue: item.new_value,
      changedBy: item.changed_by,
      changedByName: item.changed_by_name,
      changeDate: item.change_date || item.created_at,
      description: item.description,
      metadata: item.metadata,
    })) || [],
    count: response.data.count || 0,
  };
}

// Helper function to create a change record for field updates
export function createFieldChangeRecord(
  entityType: 'incident' | 'suspect' | 'office' | 'company',
  entityId: string,
  fieldName: string,
  oldValue: any,
  newValue: any,
  changedBy: string,
  description?: string
): ChangeHistoryCreateInput {
  return {
    entityType,
    entityId,
    changeType: 'update',
    fieldName,
    oldValue: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
    newValue: newValue !== null && newValue !== undefined ? String(newValue) : null,
    changedBy,
    description: description || `Campo ${fieldName} actualizado`,
  };
}

// Helper function to track multiple field changes
export async function trackMultipleChanges(
  entityType: 'incident' | 'suspect' | 'office' | 'company',
  entityId: string,
  oldData: Record<string, any>,
  newData: Record<string, any>,
  changedBy: string,
  fieldsToTrack?: string[]
): Promise<void> {
  const changes: ChangeHistoryCreateInput[] = [];
  
  // Get all fields to check, or use provided list
  const fields = fieldsToTrack || Object.keys(newData);
  
  for (const field of fields) {
    const oldValue = oldData[field];
    const newValue = newData[field];
    
    // Only track if values are different
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push(createFieldChangeRecord(
        entityType,
        entityId,
        field,
        oldValue,
        newValue,
        changedBy
      ));
    }
  }
  
  // Create all change records
  await Promise.all(changes.map(change => createChangeRecord(change)));
}