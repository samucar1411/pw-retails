'use client';

import React, { useState } from 'react';
import { Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventFilters {
  office_name?: string;
  staff_name?: string;
  device_name?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
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

interface ComboboxFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  filterOptions: {
    offices: string[];
    staff: string[];
    devices: string[];
  };
}

const filterGroups: FilterGroup[] = [
  {
    id: 'location',
    label: 'Ubicación',
    fields: [
      {
        key: 'office_name',
        label: 'Sucursal',
        type: 'select',
        placeholder: 'Seleccionar sucursal...'
      }
    ]
  },
  {
    id: 'personnel',
    label: 'Personal',
    fields: [
      {
        key: 'staff_name',
        label: 'Personal',
        type: 'select',
        placeholder: 'Seleccionar personal...'
      }
    ]
  },
  {
    id: 'devices',
    label: 'Dispositivos',
    fields: [
      {
        key: 'device_name',
        label: 'Dispositivo',
        type: 'select',
        placeholder: 'Seleccionar dispositivo...'
      }
    ]
  },
  {
    id: 'dates',
    label: 'Fechas',
    fields: [
      {
        key: 'date_from',
        label: 'Rango de fechas',
        type: 'date-range',
        placeholder: 'Seleccionar fechas...'
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

export function ComboboxFilters({ filters, onFiltersChange, filterOptions }: ComboboxFiltersProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'groups' | 'fields'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null);
  const [tempFilters, setTempFilters] = useState<EventFilters>({});
  const [originalGroupFilters, setOriginalGroupFilters] = useState<EventFilters>({});

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
      let options: Array<{ value: string; label: string }> = [];
      
      // Mapear las opciones según el tipo de campo
      if (field.key === 'office_name') {
        options = filterOptions.offices.map(office => ({ value: office, label: office }));
      } else if (field.key === 'staff_name') {
        options = filterOptions.staff.map(staff => ({ value: staff, label: staff }));
      } else if (field.key === 'device_name') {
        options = filterOptions.devices.map(device => ({ value: device, label: device }));
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
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'date-range') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <DateRangePicker
            onChange={(range) => {
              if (range?.from) {
                handleFilterChange('date_from', range.from.toISOString().split('T')[0]);
                if (range.to) {
                  handleFilterChange('date_to', range.to.toISOString().split('T')[0]);
                }
              }
            }}
            placeholder={field.placeholder}
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