'use client';

import React, { useState } from 'react';
import { Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useQuery } from '@tanstack/react-query';
import { getAllOfficesComplete } from '@/services/office-service';
import { Office } from '@/types/office';
import { format } from 'date-fns';

interface IncidentFiltersState {
  Office?: string;
  IncidentType?: string;
  suspect_alias?: string;
  id?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  fields: Array<{
    key: keyof IncidentFiltersState;
    label: string;
    type: 'select' | 'date-range' | 'text' | 'date';
    placeholder?: string;
    options?: Array<{ value: string; label: string; description?: string }>;
  }>;
}

interface IncidentFiltersProps {
  filters: IncidentFiltersState;
  onFiltersChange: (filters: IncidentFiltersState) => void;
  filterOptions: {
    incidentTypes: Array<{ id: string; Name: string }>;
    suspects: Array<{ alias: string }>;
  };
}

const filterGroups: FilterGroup[] = [
  {
    id: 'location',
    label: 'Ubicación',
    fields: [
      {
        key: 'Office',
        label: 'Sucursal',
        type: 'select',
        placeholder: 'Seleccionar sucursal...'
      }
    ]
  },
  {
    id: 'incident',
    label: 'Incidente',
    fields: [
      {
        key: 'IncidentType',
        label: 'Tipo de Incidente',
        type: 'select',
        placeholder: 'Seleccionar tipo...'
      },
      {
        key: 'id',
        label: 'ID del Incidente',
        type: 'text',
        placeholder: 'Buscar por ID...'
      }
    ]
  },
  {
    id: 'suspect',
    label: 'Sospechoso',
    fields: [
      {
        key: 'suspect_alias',
        label: 'Alias del Sospechoso',
        type: 'select',
        placeholder: 'Seleccionar sospechoso...'
      }
    ]
  },
  {
    id: 'dates',
    label: 'Fechas',
    fields: [
      {
        key: 'fromDate',
        label: 'Fecha de inicio',
        type: 'date',
        placeholder: 'Seleccionar fecha de inicio...'
      },
      {
        key: 'toDate',
        label: 'Fecha final',
        type: 'date',
        placeholder: 'Seleccionar fecha final...'
      }
    ]
  },
  {
    id: 'search',
    label: 'Búsqueda',
    fields: [
      {
        key: 'search',
        label: 'Búsqueda general',
        type: 'text',
        placeholder: 'Buscar...'
      }
    ]
  }
];

export function IncidentFilters({
  filters,
  onFiltersChange,
  filterOptions
}: IncidentFiltersProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'groups' | 'fields'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null);
  const [tempFilters, setTempFilters] = useState<IncidentFiltersState>({});
  const [originalGroupFilters, setOriginalGroupFilters] = useState<IncidentFiltersState>({});
  const [datePopovers, setDatePopovers] = useState<{ [key: string]: boolean }>({});

  // Fetch all offices
  const { data: offices = [] } = useQuery<Office[], Error>({
    queryKey: ['all-offices-complete'],
    queryFn: getAllOfficesComplete,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

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
    const groupFilters: IncidentFiltersState = {};
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
        newFilters[key as keyof IncidentFiltersState] = value;
      }
    });
    
    onFiltersChange(newFilters);
    handleBackToGroups();
  };

  const handleDiscardFilters = () => {
    setTempFilters(originalGroupFilters);
    handleBackToGroups();
  };

  const handleClearGroup = () => {
    setTempFilters({});
  };

  const handleFilterChange = (key: keyof IncidentFiltersState, value: string | undefined) => {
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
      let options: Array<{ value: string; label: string; description?: string }> = [];
      
      // Mapear las opciones según el tipo de campo
      if (field.key === 'Office') {
        options = offices.map((office: Office) => ({
          value: office.id.toString(),
          label: `${office.Name} (${office.Code})`,
          description: office.Address
        }));
      } else if (field.key === 'IncidentType') {
        options = filterOptions.incidentTypes.map((type) => ({
          value: type.id,
          label: type.Name
        }));
      } else if (field.key === 'suspect_alias') {
        options = filterOptions.suspects.map((suspect) => ({
          value: suspect.alias,
          label: suspect.alias
        }));
      }

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
              <SelectItem value="none">Todos</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'date') {
      const currentDate = tempFilters[field.key] ? new Date(tempFilters[field.key]!) : undefined;
      const isOpen = datePopovers[field.key] || false;
      
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Popover 
            open={isOpen} 
            onOpenChange={(open) => setDatePopovers(prev => ({ ...prev, [field.key]: open }))}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {currentDate ? format(currentDate, 'dd/MM/yyyy') : field.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    handleFilterChange(field.key, format(date, 'yyyy-MM-dd'));
                  } else {
                    handleFilterChange(field.key, undefined);
                  }
                  setDatePopovers(prev => ({ ...prev, [field.key]: false }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    if (field.type === 'date-range') {
      const fromDate = tempFilters.fromDate ? new Date(tempFilters.fromDate) : undefined;
      const toDate = tempFilters.toDate ? new Date(tempFilters.toDate) : undefined;
      
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Calendar
            mode="range"
            selected={{
              from: fromDate,
              to: toDate
            }}
            onSelect={(range) => {
              if (range?.from) {
                handleFilterChange('fromDate', format(range.from, 'yyyy-MM-dd'));
                if (range.to) {
                  handleFilterChange('toDate', format(range.to, 'yyyy-MM-dd'));
                } else {
                  handleFilterChange('toDate', undefined);
                }
              } else {
                handleFilterChange('fromDate', undefined);
                handleFilterChange('toDate', undefined);
              }
            }}
            className="rounded-md border"
            numberOfMonths={2}
          />
        </div>
      );
    }

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
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
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
        {activeFiltersCount > 0 && step === 'groups' && (
          <div className="border-t p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} aplicado{activeFiltersCount > 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => onFiltersChange({})}
              >
                Limpiar todos
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 