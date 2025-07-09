'use client';

import React, { useState } from 'react';
import { Filter, X, Calendar, Building, User, Monitor, Search, CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { cn } from '@/lib/utils';

interface EventFilters {
  office_name?: string;
  staff_name?: string;
  device_name?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ElementType;
  type: 'select' | 'date-range' | 'text';
  options?: string[];
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string | { from?: Date; to?: Date };
  displayValue: string;
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

export function ComboboxFilters({ filters, onFiltersChange, filterOptions }: ComboboxFiltersProps) {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);



  // Combobox states for each filter type
  const [officeOpen, setOfficeOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);

  const availableFilters: FilterOption[] = [
    {
      id: 'office_name',
      label: 'Sucursal',
      icon: Building,
      type: 'select',
      options: filterOptions.offices
    },
    {
      id: 'staff_name',
      label: 'Personal',
      icon: User,
      type: 'select',
      options: filterOptions.staff
    },
    {
      id: 'device_name',
      label: 'Dispositivo',
      icon: Monitor,
      type: 'select',
      options: filterOptions.devices
    },
    {
      id: 'date_range',
      label: 'Rango de fechas',
      icon: Calendar,
      type: 'date-range'
    },
    {
      id: 'search',
      label: 'Búsqueda general',
      icon: Search,
      type: 'text'
    }
  ];

  const handleAddFilter = (filterId: string, value: string | { from?: Date; to?: Date }) => {
    const filterOption = availableFilters.find(f => f.id === filterId);
    if (!filterOption) return;

    let displayValue = '';
    const newFilters = { ...filters };

    if (filterId === 'date_range' && typeof value === 'object') {
      if (value.from && value.to) {
        displayValue = `${value.from.toLocaleDateString('es-ES')} - ${value.to.toLocaleDateString('es-ES')}`;
        newFilters.date_from = value.from.toISOString().split('T')[0];
        newFilters.date_to = value.to.toISOString().split('T')[0];
      } else if (value.from) {
        displayValue = `Desde ${value.from.toLocaleDateString('es-ES')}`;
        newFilters.date_from = value.from.toISOString().split('T')[0];
      }
    } else if (typeof value === 'string' && value) {
      displayValue = value;
      if (filterId === 'office_name') {
        newFilters.office_name = value;
      } else if (filterId === 'staff_name') {
        newFilters.staff_name = value;
      } else if (filterId === 'device_name') {
        newFilters.device_name = value;
      } else if (filterId === 'search') {
        newFilters.search = value;
      }
    }

    if (displayValue) {
      const newActiveFilter: ActiveFilter = {
        id: filterId,
        label: filterOption.label,
        value,
        displayValue
      };

      // Remove existing filter of same type
      const updatedActiveFilters = activeFilters.filter(f => f.id !== filterId);
      updatedActiveFilters.push(newActiveFilter);
      setActiveFilters(updatedActiveFilters);

      onFiltersChange(newFilters);
    }

    setSelectedFilterType('');
    setIsMainOpen(false);
  };

  const removeFilter = (filterId: string) => {
    const updatedActiveFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedActiveFilters);

    const newFilters = { ...filters };
    if (filterId === 'date_range') {
      delete newFilters.date_from;
      delete newFilters.date_to;
    } else if (filterId === 'office_name') {
      delete newFilters.office_name;
    } else if (filterId === 'staff_name') {
      delete newFilters.staff_name;
    } else if (filterId === 'device_name') {
      delete newFilters.device_name;
    } else if (filterId === 'search') {
      delete newFilters.search;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange({});
  };

  const renderComboboxSelect = (filterId: string, options: string[], placeholder: string, open: boolean, setOpen: (open: boolean) => void) => {
    const currentValue = filterId === 'office_name' ? filters.office_name : 
                        filterId === 'staff_name' ? filters.staff_name : 
                        filterId === 'device_name' ? filters.device_name : '';

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium">
          {availableFilters.find(f => f.id === filterId)?.label}
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {currentValue || placeholder}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(value) => {
                        const actualValue = value === option.toLowerCase() ? option : value;
                        handleAddFilter(filterId, actualValue);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentValue === option ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderFilterInput = () => {
    const filterOption = availableFilters.find(f => f.id === selectedFilterType);
    if (!filterOption) return null;

    switch (filterOption.type) {
      case 'select':
        if (selectedFilterType === 'office_name') {
          return renderComboboxSelect('office_name', filterOptions.offices, 'Seleccionar sucursal', officeOpen, setOfficeOpen);
        } else if (selectedFilterType === 'staff_name') {
          return renderComboboxSelect('staff_name', filterOptions.staff, 'Seleccionar personal', staffOpen, setStaffOpen);
        } else if (selectedFilterType === 'device_name') {
          return renderComboboxSelect('device_name', filterOptions.devices, 'Seleccionar dispositivo', deviceOpen, setDeviceOpen);
        }
        break;

      case 'date-range':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium">{filterOption.label}</label>
            <DateRangePicker
              onChange={(range) => handleAddFilter(selectedFilterType, range)}
              placeholder="Seleccionar rango de fechas"
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium">{filterOption.label}</label>
            <div className="flex gap-2">
              <Input
                placeholder="Escribir término de búsqueda..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value;
                    if (value) {
                      handleAddFilter(selectedFilterType, value);
                    }
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Escribir término de búsqueda..."]') as HTMLInputElement;
                  if (input?.value) {
                    handleAddFilter(selectedFilterType, input.value);
                  }
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter button and active filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isMainOpen} onOpenChange={setIsMainOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronsUpDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            {!selectedFilterType ? (
              // Step 1: Select filter type using Command
              <Command>
                <CommandInput placeholder="Buscar tipo de filtro..." />
                <CommandList>
                  <CommandEmpty>No se encontraron filtros.</CommandEmpty>
                  <CommandGroup heading="Tipos de filtro">
                    {availableFilters.map((filter) => {
                      const Icon = filter.icon;
                      const isDisabled = activeFilters.some(af => af.id === filter.id);
                      
                      return (
                        <CommandItem
                          key={filter.id}
                          value={filter.label}
                          onSelect={() => {
                            if (!isDisabled) {
                              setSelectedFilterType(filter.id);
                            }
                          }}
                          disabled={isDisabled}
                          className={cn(
                            "flex items-center gap-3 p-3",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium">{filter.label}</div>
                            {isDisabled && (
                              <div className="text-xs text-muted-foreground">Ya aplicado</div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            ) : (
              // Step 2: Configure filter
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Configurar filtro</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFilterType('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderFilterInput()}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Active filters */}
        {activeFilters.map((filter) => (
          <Badge key={filter.id} variant="secondary" className="gap-1">
            {filter.label}: {filter.displayValue}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter(filter.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Clear all button */}
        {activeFilters.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Limpiar todos
          </Button>
        )}
      </div>
    </div>
  );
} 