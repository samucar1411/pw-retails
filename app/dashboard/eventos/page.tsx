'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Building, User, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComboboxFilters } from '@/components/events/combobox-filters';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/context/notification-context';
import { EventFilters } from '@/services/event-service';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Event } from '@/types/event';
import Image from 'next/image';

export default function EventsPage() {
  const { events, loading, error, totalCount, filterOptions, refreshEvents, applyFilters } = useEvents();
  const { markAllAsViewed } = useNotifications();
  
  const [filters, setFilters] = useState<EventFilters>({});

  // Mark all notifications as viewed when entering the events page
  useEffect(() => {
    markAllAsViewed();
  }, [markAllAsViewed]);

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Event Image */}
          <div className="flex-shrink-0">
            {event.img_file ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={event.img_file}
                  alt={event.image_name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate">
                  {event.image_name || 'Evento sin nombre'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  ID: {event.id}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">{event.staff_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{event.office_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Monitor className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{event.device_name}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refreshEvents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos del Sistema</h1>
          <p className="text-muted-foreground">
            {totalCount} evento{totalCount !== 1 ? 's' : ''} registrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={refreshEvents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <ComboboxFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filterOptions={filterOptions}
          />
        </CardContent>
      </Card>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
              <p className="text-muted-foreground">
                {Object.values(filters).some(Boolean) 
                  ? 'Intenta ajustar los filtros para encontrar eventos'
                  : 'No hay eventos registrados en el sistema'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 