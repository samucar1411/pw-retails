'use client';

import React, { useState } from 'react';
import { BellRing, RefreshCw, Building, User, Monitor, AlertTriangle, Info, CheckCircle, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/context/notification-context';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Event } from '@/types/event';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Función para construir URLs de imágenes del backend
const getImageUrl = (imgFile: string | null): string | null => {
  if (!imgFile) return null;
  
  // Si ya es una URL completa, retornarla
  if (imgFile.startsWith('http://') || imgFile.startsWith('https://')) {
    return imgFile;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sys.adminpy.com:18001';
  return `${baseUrl}${imgFile.startsWith('/') ? '' : '/'}${imgFile}`;
};



type SeverityStyle = {
  icon: React.ElementType;
  badge: 'destructive' | 'secondary' | 'outline';
  text: string;
  color: string;
  border: string;
};

interface EventFilters {
  office_name?: string;
  staff_name?: string;
  device_name?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  fields: Array<{
    key: keyof EventFilters;
    label: string;
    type: 'select' | 'date-range' | 'text';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
}

const filterGroups: FilterGroup[] = [
  // Filtros comentados - No funcionan en el backend
  // {
  //   id: 'location',
  //   label: 'Ubicación',
  //   fields: [
  //     {
  //       key: 'office_name',
  //       label: 'Sucursal',
  //       type: 'select',
  //       placeholder: 'Seleccionar sucursal...'
  //     }
  //   ]
  // },
  // {
  //   id: 'personnel',
  //   label: 'Personal',
  //   fields: [
  //     {
  //       key: 'staff_name',
  //       label: 'Personal',
  //       type: 'select',
  //       placeholder: 'Seleccionar personal...'
  //     }
  //   ]
  // },
  // {
  //   id: 'devices',
  //   label: 'Dispositivos',
  //   fields: [
  //     {
  //       key: 'device_name',
  //       label: 'Dispositivo',
  //       type: 'select',
  //       placeholder: 'Seleccionar dispositivo...'
  //     }
  //   ]
  // },
  // {
  //   id: 'dates',
  //   label: 'Fechas',
  //   fields: [
  //     {
  //       key: 'date_from',
  //       label: 'Rango de fechas',
  //       type: 'date-range',
  //       placeholder: 'Seleccionar fechas...'
  //     }
  //   ]
  // },
  {
    id: 'search',
    label: 'Búsqueda',
    fields: [
      {
        key: 'search',
        label: 'Búsqueda general',
        type: 'text',
        placeholder: 'Buscar por nombre, sucursal, dispositivo...'
      }
    ]
  },
  {
    id: 'ordering',
    label: 'Ordenamiento',
    fields: [
      {
        key: 'ordering',
        label: 'Ordenar por',
        type: 'select',
        placeholder: 'Seleccionar orden...',
        options: [
          { value: 'created_at', label: 'Fecha (descendente)' },
          { value: '-created_at', label: 'Fecha (ascendente)' },
          { value: 'staff_name', label: 'Personal (ascendente)' },
          { value: '-staff_name', label: 'Personal (descendente)' }
        ]
      }
    ]
  }
];

export default function EventsPage() {
  const { events, loading, error, totalCount, refreshEvents, applyFilters } = useEvents();
  const { markAllAsViewed } = useNotifications();
  
  const [filters, setFilters] = useState<EventFilters>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'groups' | 'fields'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null);
  const [tempFilters, setTempFilters] = useState<EventFilters>({});
  const [originalGroupFilters, setOriginalGroupFilters] = useState<EventFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Mostrar 12 eventos por página



  // Mark all notifications as viewed when entering the events page
  React.useEffect(() => {
    markAllAsViewed();
  }, [markAllAsViewed]);

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    applyFilters({ ...newFilters, page: currentPage.toString() });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    applyFilters({ ...filters, page: newPage.toString() });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  };

  const getGroupActiveCount = (groupId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.fields.filter(field => {
      const value = filters[field.key];
      return value !== undefined && value !== null && value !== "";
    }).length;
  };

  const getCurrentGroupTempCount = () => {
    return Object.values(tempFilters).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
  };

  const handleSelectGroup = (group: FilterGroup) => {
    setSelectedGroup(group);
    
    // Cargar filtros existentes para el grupo seleccionado
    const groupFilters: EventFilters = {};
    group.fields.forEach(field => {
      const currentValue = filters[field.key];
      if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
        groupFilters[field.key] = currentValue;
      }
    });
    
    setOriginalGroupFilters(groupFilters);
    setTempFilters(groupFilters);
    setStep('fields');
  };

  const handleBackToGroups = () => {
    setStep('groups');
    setSelectedGroup(null);
    setTempFilters({});
    setOriginalGroupFilters({});
  };

  const handleSaveFilters = () => {
    // Aplicar filtros temporales a los filtros reales
    const newFilters = { ...filters };
    
    // Primero limpiar los campos del grupo actual
    if (selectedGroup) {
      selectedGroup.fields.forEach(field => {
        delete newFilters[field.key];
      });
    }
    
    // Luego añadir los nuevos valores
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        newFilters[key as keyof EventFilters] = value;
      }
    });
    
    handleFiltersChange(newFilters);
    handleBackToGroups();
  };

  const handleDiscardFilters = () => {
    setTempFilters(originalGroupFilters);
    handleBackToGroups();
  };

  const handleClearGroup = () => {
    setTempFilters({});
  };

  const handleFilterChange = (key: keyof EventFilters, value: string | undefined) => {
    const newValue = value === "" || value === "none" ? undefined : value;
    const newTempFilters = { ...tempFilters, [key]: newValue };
    if (newValue === undefined) {
      delete newTempFilters[key];
    }
    setTempFilters(newTempFilters);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep('groups');
      setSelectedGroup(null);
    }
  };

  const renderField = (field: FilterGroup['fields'][0]) => {
    const value = tempFilters[field.key];

    if (field.type === 'select') {
      // Solo manejar ordering ya que es el único select que funciona
      if (field.key === 'ordering' && field.options) {
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Select
              value={value || "none"}
              onValueChange={(newValue) => handleFilterChange(field.key, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Por defecto</SelectItem>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
    }

    // Solo manejar search ya que es el único campo de texto que funciona
    if (field.type === 'text' && field.key === 'search') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Input
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        </div>
      );
    }

    // Los demás tipos de campos están comentados
    return null;
  };

  // Función para determinar la severidad del evento
  const getEventSeverity = (event: Event): 'high' | 'medium' | 'low' => {
    // let isNightTime = false;
    // if (event.created_at) {
    //   const hour = new Date(event.created_at).getHours();
    //   isNightTime = hour >= 22 || hour <= 5;
    // }
    
    if (event.blacklist) {
      return 'high';
    }
    return 'low';
  };

  // Función para obtener el estilo de la tarjeta según la severidad
  const getSeverityStyles = (severity: 'high' | 'medium' | 'low'): SeverityStyle => {
    switch (severity) {
      case 'high':
        return {
          icon: AlertTriangle,
          badge: 'destructive',
          text: 'Alta',
          color: 'text-destructive',
          border: 'border'
        };
      case 'medium':
        return {
          icon: Info,
          badge: 'outline',
          text: 'Media',
          color: 'text-yellow-500',
          border: 'border'
        };
      case 'low':
        return {
          icon: CheckCircle,
          badge: 'secondary',
          text: 'Baja',
          color: 'text-green-500',
          border: 'border'
        };
    }
  };



  // Componente de tarjeta de evento mejorada
  const EventCard = ({ event }: { event: Event }) => {
    const severity = getEventSeverity(event);
    const styles = getSeverityStyles(severity);
    const Icon = styles.icon;

    return (
      <div 
        className={`bg-card border rounded-lg hover:shadow-lg transition-all cursor-pointer ${styles.border} hover:border-opacity-100`}
        onClick={() => setSelectedEvent(event)}
      >
        <div className="p-4">
          {/* Imagen principal */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-muted">
            {getImageUrl(event.img_file) ? (
              <Image
                src={getImageUrl(event.img_file)!}
                alt={event.image_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={process.env.NODE_ENV === 'production'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className={`h-16 w-16 ${styles.color}`} />
              </div>
            )}
          </div>

          {/* Información del evento */}
          <div className="space-y-3">
            {/* Header con nombre y prioridad */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg truncate">
                  {event.staff_name || 'Evento sin nombre'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {event.created_at ? format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Fecha no disponible'}
                </p>
              </div>
              <Badge variant={styles.badge} className="ml-2 flex-shrink-0">
                {styles.text}
              </Badge>
            </div>

            {/* Detalles del evento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.staff_name || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{event.office_name || 'No especificada'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span>{event.device_name || 'No especificado'}</span>
              </div>
            </div>

            {/* Tiempo relativo */}
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                {event.created_at ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: es }) : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calcular paginación
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentEvents = events.slice(startIndex, endIndex);

  // Componente de paginación
  const Pagination = () => {
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, totalCount)} de {totalCount} eventos
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  };

  const EventDetailsModal = () => {
    if (!selectedEvent) return null;

    const severity = getEventSeverity(selectedEvent);
    const styles = getSeverityStyles(severity);
    const Icon = styles.icon;

    return (
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Icon className={`h-5 w-5 ${styles.color}`} />
              <span>Detalles de la Alerta</span>
              <Badge variant={styles.badge} className="ml-2">
                Prioridad {styles.text}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Nombre del evento si existe */}
            {selectedEvent.image_name && (
              <div className="text-lg font-medium">
                {selectedEvent.image_name}
              </div>
            )}

            {/* Imagen principal */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              {getImageUrl(selectedEvent.img_file) ? (
                <Image
                  src={getImageUrl(selectedEvent.img_file)!}
                  alt={selectedEvent.image_name || 'Imagen del evento'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={process.env.NODE_ENV === 'production'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className={`h-20 w-20 ${styles.color}`} />
                </div>
              )}
            </div>

            {/* Detalles del evento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Fecha y hora</Label>
                <p>{selectedEvent.created_at ? format(new Date(selectedEvent.created_at), 'PPpp', { locale: es }) : 'Fecha no disponible'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Personal</Label>
                <p>{selectedEvent.staff_name || 'No especificado'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Sucursal</Label>
                <p>{selectedEvent.office_name || 'No especificada'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Dispositivo</Label>
                <p>{selectedEvent.device_name || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Alertas</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {totalCount} alerta{totalCount !== 1 ? 's' : ''} registrada{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshEvents} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge className="ml-2 px-1.5 py-0.5 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              {step === 'groups' ? (
                // Paso 1: Seleccionar Grupo
                <Command>
                  <CommandInput placeholder="Buscar filtros..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron filtros.</CommandEmpty>
                    <CommandGroup>
                      {filterGroups.map((group) => {
                        const activeCount = getGroupActiveCount(group.id);
                        return (
                          <CommandItem
                            key={group.id}
                            onSelect={() => handleSelectGroup(group)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{group.label}</span>
                            {activeCount > 0 && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                {activeCount}
                              </Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              ) : (
                // Paso 2: Configurar Campos
                <div>
                  <div className="flex items-center border-b p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscardFilters}
                      className="p-1 h-auto mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-medium text-sm flex-1">{selectedGroup?.label}</h3>
                    {getCurrentGroupTempCount() > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6"
                        onClick={handleClearGroup}
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    {selectedGroup?.fields.map(renderField)}
                  </div>
                  
                  {/* Botones de Acción */}
                  <div className="border-t p-3 flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDiscardFilters}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveFilters}
                    >
                      Guardar Filtros
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer con estadísticas generales */}
              {getActiveFiltersCount() > 0 && step === 'groups' && (
                <div className="border-t p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} aplicado{getActiveFiltersCount() > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => handleFiltersChange({})}
                    >
                      Limpiar todos
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>



      {/* Events List */}
      {loading && events.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-6">
          {/* Grid de tarjetas de eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && <Pagination />}
        </div>
      ) : (
        <div className="text-center py-12">
          <BellRing className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay alertas</h3>
          <p className="text-muted-foreground">
            {filters.search
              ? 'Intenta ajustar la búsqueda'
              : 'No hay alertas registradas en el sistema'
            }
          </p>
        </div>
      )}

      {/* Modal de detalles */}
      <EventDetailsModal />
    </div>
  );
} 