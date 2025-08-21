'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData, useDashboardFilters } from '@/context/dashboard-context';
import { Loader2, AlertTriangle } from 'lucide-react';

export function DashboardDataDisplay() {
  const { data, isLoading, error } = useDashboardData();
  const { filters } = useDashboardFilters();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Data</CardTitle>
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
          <CardTitle>Datos del Dashboard (Cacheados)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Incidentes</h4>
              <p>Total: {data.incidents.total}</p>
              <p>Recientes: {data.incidents.recent.length}</p>
            </div>
            <div>
              <h4 className="font-semibold">Sospechosos</h4>
              <p>Identificados: {data.suspects.identified}</p>
              <p>No identificados: {data.suspects.notIdentified}</p>
            </div>
            <div>
              <h4 className="font-semibold">Oficinas</h4>
              <p>Branches 24h: {data.offices.branches24h}</p>
            </div>
            <div>
              <h4 className="font-semibold">Filtros Activos</h4>
              <p>Desde: {filters.fromDate || 'Sin filtro'}</p>
              <p>Hasta: {filters.toDate || 'Sin filtro'}</p>
              <p>Oficina: {filters.officeId || 'Todas'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 