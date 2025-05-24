'use client';

import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSuspect } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';
import Link from 'next/link';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface SuspectDetailPageProps {
  params: {
    id: string;
  };
}

export default function SuspectDetailPage({ params }: SuspectDetailPageProps) {
  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Define the Incident type
  type Incident = {
    id: string;
    Date: string;
    Description: string;
    TotalLoss: string;
    Time?: string;
    CashLoss?: string;
    MerchandiseLoss?: string;
    OtherLosses?: string;
    Notes?: string;
    Office?: number;
    IncidentType?: number;
  };

  useEffect(() => {
    async function loadSuspect() {
      try {
        const suspectId = params.id;
        console.log('Loading suspect with ID:', suspectId);
        const data = await getSuspect(suspectId);
        if (!data) {
          setError('No se pudo encontrar el sospechoso');
          return;
        }
        setSuspect(data);
        
        // Load incidents after loading suspect
        loadIncidents(data.Alias);
      } catch (err) {
        console.error('Error loading suspect:', err);
        setError('Error al cargar el sospechoso');
      } finally {
        setLoading(false);
      }
    }
    
    async function loadIncidents(alias: string) {
      if (!alias) {
        setIncidentsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/incidents/?suspect_alias=${encodeURIComponent(alias)}`);
        const data = await response.json();
        setIncidents(data.results || []);
      } catch (err) {
        console.error('Error loading incidents:', err);
      } finally {
        setIncidentsLoading(false);
      }
    }
    
    loadSuspect();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6 flex items-center justify-center h-64">
        <p>Cargando datos del sospechoso...</p>
      </div>
    );
  }
  
  if (error || !suspect) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/suspects">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'No se pudo cargar el sospechoso'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/suspects">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {suspect.Alias || 'Sin alias'}
          </h1>
          <Badge variant={suspect.Status === 1 ? 'default' : 'secondary'}>
            {suspect.Status === 1 ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <Button asChild>
          <Link href={`/dashboard/suspects/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Información del Sospechoso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                {suspect.PhotoUrl ? (
                  <AvatarImage src={suspect.PhotoUrl} alt={suspect.Alias} />
                ) : (
                  <AvatarFallback className="bg-gray-100">
                    <User className="h-8 w-8 text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Alias</p>
                <p className="font-medium">{suspect.Alias || 'Sin alias'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descripción Física</p>
                <p>{suspect.PhysicalDescription || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p>{suspect.Status === 1 ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidentes Relacionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incidentsLoading ? (
              <div className="py-4 text-center">
                <p>Cargando incidentes relacionados...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No se encontraron incidentes relacionados
              </div>
            ) : (
              <div className="space-y-2">
                {incidents.map((incident) => (
                  <div key={incident.id} className="border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{incident.Description || 'Sin descripción'}</div>
                        <div className="text-sm text-muted-foreground">
                          Fecha: {new Date(incident.Date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          ${parseFloat(incident.TotalLoss).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
