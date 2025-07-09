'use client';

import React, { useState } from 'react';
import { Filter, X, Calendar as CalendarIcon, Building, Tag, CheckIcon, ChevronsUpDownIcon, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface IncidentFilters {
  Office?: string;
  IncidentType?: string;
  suspect_alias?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ElementType;
  type: 'select' | 'date-range';
  options?: Array<{ value: string; label: string }>;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: string | { from?: Date; to?: Date };
  displayValue: string;
}

interface IncidentFiltersProps {
  filters: IncidentFilters;
  onFiltersChange: (filters: IncidentFilters) => void;
  filterOptions: {
    offices: Array<{ id: string; name: string }>;
    incidentTypes: Array<{ id: string; name: string }>;
    suspects: Array<{ alias: string }>;
  };
}

export function IncidentFilters({ filters, onFiltersChange, filterOptions }: IncidentFiltersProps) {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [pendingFilterValue, setPendingFilterValue] = useState<string | { from?: Date; to?: Date } | null>(null);

  // Date range states
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // Combobox states for each filter type
  const [officeOpen, setOfficeOpen] = useState(false);
  const [incidentTypeOpen, setIncidentTypeOpen] = useState(false);
  const [suspectOpen, setSuspectOpen] = useState(false);

  const availableFilters: FilterOption[] = [
    {
      id: 'Office',
      label: 'Sucursal',
      icon: Building,
      type: 'select',
      options: filterOptions.offices.map(office => ({ value: office.id, label: office.name }))
    },
    {
      id: 'IncidentType',
      label: 'Tipo de Incidente',
      icon: Tag,
      type: 'select',
      options: filterOptions.incidentTypes.map(type => ({ value: type.id, label: type.name }))
    },
    {
      id: 'suspect_alias',
      label: 'Sospechoso',
      icon: User,
      type: 'select',
      options: filterOptions.suspects.map(suspect => ({ value: suspect.alias, label: suspect.alias }))
    },
    {
      id: 'date_range',
      label: 'Rango de fechas',
      icon: CalendarIcon,
      type: 'date-range'
    }
  ];

  // Update pending filter value when dates change
  React.useEffect(() => {
    if (selectedFilterType === 'date_range' && (fromDate || toDate)) {
      setPendingFilterValue({ from: fromDate, to: toDate });
    }
  }, [fromDate, toDate, selectedFilterType]);

  const handlePendingValueChange = (value: string | { from?: Date; to?: Date }) => {
    setPendingFilterValue(value);
  };

  const handleApplyFilter = () => {
    if (!selectedFilterType || !pendingFilterValue) return;

    const filterId = selectedFilterType;
    const value = pendingFilterValue;
    const filterOption = availableFilters.find(f => f.id === filterId);
    if (!filterOption) return;

    let displayValue = '';
    const newFilters = { ...filters };

    if (filterId === 'date_range' && typeof value === 'object') {
      if (value.from && value.to) {
        displayValue = `${value.from.toLocaleDateString('es-ES')} - ${value.to.toLocaleDateString('es-ES')}`;
        newFilters.fromDate = value.from.toISOString().split('T')[0];
        newFilters.toDate = value.to.toISOString().split('T')[0];
      } else if (value.from) {
        displayValue = `Desde ${value.from.toLocaleDateString('es-ES')}`;
        newFilters.fromDate = value.from.toISOString().split('T')[0];
      }
    } else if (typeof value === 'string' && value) {
      // For select filters, find the display label
      if (filterId === 'Office') {
        const office = filterOptions.offices.find(o => o.id === value);
        displayValue = office?.name || value;
        newFilters.Office = value;
      } else if (filterId === 'IncidentType') {
        const incidentType = filterOptions.incidentTypes.find(t => t.id === value);
        displayValue = incidentType?.name || value;
        newFilters.IncidentType = value;
      } else if (filterId === 'suspect_alias') {
        displayValue = value;
        newFilters.suspect_alias = value;
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

    // Reset state
    setSelectedFilterType('');
    setPendingFilterValue(null);
    setFromDate(undefined);
    setToDate(undefined);
    setIsMainOpen(false);
  };

  const handleCancelFilter = () => {
    setSelectedFilterType('');
    setPendingFilterValue(null);
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleBackToFilterTypes = () => {
    setSelectedFilterType('');
    setPendingFilterValue(null);
    setFromDate(undefined);
    setToDate(undefined);
  };

  const removeFilter = (filterId: string) => {
    const updatedActiveFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedActiveFilters);

    const newFilters = { ...filters };
    if (filterId === 'date_range') {
      delete newFilters.fromDate;
      delete newFilters.toDate;
    } else if (filterId === 'Office') {
      delete newFilters.Office;
    } else if (filterId === 'IncidentType') {
      delete newFilters.IncidentType;
    } else if (filterId === 'suspect_alias') {
      delete newFilters.suspect_alias;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange({});
  };

  const renderComboboxSelect = (filterId: string, options: Array<{ value: string; label: string }>, placeholder: string, open: boolean, setOpen: (open: boolean) => void) => {
    const currentValue = filterId === 'Office' ? filters.Office : 
                        filterId === 'IncidentType' ? filters.IncidentType : 
                        filterId === 'suspect_alias' ? filters.suspect_alias : '';

    const currentOption = options.find(option => option.value === currentValue);

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
              {currentOption?.label || placeholder}
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(value) => {
                        handlePendingValueChange(value);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentValue === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
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

  const renderDateRangeFilter = () => {
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium">Rango de fechas</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha inicio */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fecha inicio</label>
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              className="rounded-md border shadow-sm"
              captionLayout="dropdown"
            />
          </div>

          {/* Fecha fin */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fecha fin</label>
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              className="rounded-md border shadow-sm"
              captionLayout="dropdown"
              disabled={(date) => fromDate ? date < fromDate : false}
            />
          </div>
        </div>

        {/* Preview */}
        {(fromDate || toDate) && (
          <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground">
              Rango seleccionado: {' '}
              {fromDate ? fromDate.toLocaleDateString('es-ES') : '---'} - {' '}
              {toDate ? toDate.toLocaleDateString('es-ES') : '---'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFilterInput = () => {
    const filterOption = availableFilters.find(f => f.id === selectedFilterType);
    if (!filterOption) return null;

    switch (filterOption.type) {
      case 'select':
        if (selectedFilterType === 'Office') {
          return renderComboboxSelect('Office', filterOption.options || [], 'Seleccionar sucursal', officeOpen, setOfficeOpen);
        } else if (selectedFilterType === 'IncidentType') {
          return renderComboboxSelect('IncidentType', filterOption.options || [], 'Seleccionar tipo', incidentTypeOpen, setIncidentTypeOpen);
        } else if (selectedFilterType === 'suspect_alias') {
          return renderComboboxSelect('suspect_alias', filterOption.options || [], 'Seleccionar sospechoso', suspectOpen, setSuspectOpen);
        }
        break;

      case 'date-range':
        return renderDateRangeFilter();

      default:
        return null;
    }
  };

  return {
    filterButton: (
      <Popover open={isMainOpen} onOpenChange={setIsMainOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            <ChevronsUpDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(
          "p-0",
          selectedFilterType === 'date_range' ? "w-[600px]" : "w-64"
        )}>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToFilterTypes}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <h4 className="font-medium">Configurar filtro</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {renderFilterInput()}
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelFilter}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyFilter}
                  className="flex-1"
                  disabled={!pendingFilterValue}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    ),
    activeFilters: activeFilters.length > 0 ? (
      <div className="flex items-center gap-2 flex-wrap">
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
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Limpiar todos
        </Button>
      </div>
    ) : null
  };
} 