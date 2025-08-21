'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuspectsData } from '@/context/dashboard-context';
import { Loader2, AlertTriangle, Users, Building, FileText } from 'lucide-react';

export function SuspectsWithDashboardData() {
  const { suspects, suspectStatuses, offices, isLoading, error } = useSuspectsData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datos de Sospechosos (Dashboard)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando datos del dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Error al cargar datos: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Datos de Sospechosos (Desde Dashboard)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Sospechosos</p>
                <p className="text-sm text-muted-foreground">{suspects.length} total</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Oficinas</p>
                <p className="text-sm text-muted-foreground">{offices.length} disponibles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Estados</p>
                <p className="text-sm text-muted-foreground">{suspectStatuses.length} tipos</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Estados de Sospechosos:</h4>
            <div className="flex flex-wrap gap-2">
              {suspectStatuses.map((status: { id: number; Name: string }) => (
                <span key={status.id} className="px-2 py-1 bg-secondary rounded text-xs">
                  {status.Name}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 