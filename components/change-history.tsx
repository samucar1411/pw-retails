'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getChangeHistory } from '@/services/change-history-service';
import { ChangeHistory } from '@/types/change-history';

interface ChangeHistoryComponentProps {
  entityType: 'incident' | 'suspect' | 'office' | 'company';
  entityId: string;
  className?: string;
}

export function ChangeHistoryComponent({ 
  entityType, 
  entityId, 
  className = '' 
}: ChangeHistoryComponentProps) {
  const [changes, setChanges] = useState<ChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchChanges = async () => {
      try {
        setLoading(true);
        const response = await getChangeHistory(entityType, entityId);
        setChanges(response.results || []);
      } catch (error) {
        console.error('Error fetching change history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChanges();
  }, [entityType, entityId]);

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'Creado';
      case 'update':
        return 'Actualizado';
      case 'delete':
        return 'Eliminado';
      default:
        return changeType;
    }
  };

  const formatFieldName = (fieldName: string) => {
    const fieldLabels: Record<string, string> = {
      'Date': 'Fecha',
      'Time': 'Hora',
      'IncidentType': 'Tipo de incidente',
      'Office': 'Sucursal',
      'Description': 'Descripción',
      'Notes': 'Notas',
      'CashLoss': 'Pérdida en efectivo',
      'MerchandiseLoss': 'Pérdida en mercadería',
      'OtherLosses': 'Otras pérdidas',
      'TotalLoss': 'Pérdida total',
      'Suspects': 'Sospechosos',
      'Alias': 'Alias',
      'PhysicalDescription': 'Descripción física',
      'Status': 'Estado',
    };
    
    return fieldLabels[fieldName] || fieldName;
  };

  const formatValue = (value: string | null | undefined, fieldName?: string) => {
    if (value === null || value === undefined) return 'Sin valor';
    if (value === '') return 'Vacío';
    
    // Format currency values
    if (fieldName && ['CashLoss', 'MerchandiseLoss', 'OtherLosses', 'TotalLoss'].includes(fieldName)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `Gs. ${numValue.toLocaleString('es-PY')}`;
      }
    }
    
    return value;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de cambios
                {changes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {changes.length}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
        </CardHeader>
        
        {isOpen && (
          <CardContent>
            {changes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cambios registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {change.changedByName || `Usuario ${change.changedBy}`}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={getChangeTypeColor(change.changeType)}
                        >
                          {getChangeTypeLabel(change.changeType)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(change.changeDate), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                      </span>
                    </div>
                    
                    {change.fieldName && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">
                          {formatFieldName(change.fieldName)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Valor anterior:</span>
                            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                              {formatValue(change.oldValue, change.fieldName)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor nuevo:</span>
                            <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-green-800">
                              {formatValue(change.newValue, change.fieldName)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {change.description && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        {change.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}