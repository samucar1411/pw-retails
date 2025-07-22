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
import { SuspectStatus } from '@/types/suspect';

type FilterValue = string | string[] | undefined;

interface SuspectFiltersState {
  Status?: string;
  alias?: string;
  id?: string;
  suspects_tags?: string[];
  search?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  fields: Array<{
    key: keyof SuspectFiltersState;
    label: string;
    type: 'select' | 'text' | 'tags';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    tagGroups?: {
      [category: string]: Array<{ value: string; label: string }>;
    };
  }>;
}

interface SuspectFiltersProps {
  filters: SuspectFiltersState;
  onFiltersChange: (filters: SuspectFiltersState) => void;
  filterOptions: {
    statuses: SuspectStatus[];
  };
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  tagOptions: {
    [category: string]: {
      value: string;
      label: string;
    }[];
  };
}

const filterGroups: FilterGroup[] = [
  {
    id: 'suspect',
    label: 'Sospechoso',
    fields: [
      {
        key: 'id',
        label: 'ID',
        type: 'text',
        placeholder: 'Buscar por ID...'
      },
      {
        key: 'alias',
        label: 'Alias',
        type: 'text',
        placeholder: 'Buscar por alias...'
      }
    ]
  },
  {
    id: 'status',
    label: 'Estado',
    fields: [
      {
        key: 'Status',
        label: 'Estado',
        type: 'select',
        placeholder: 'Seleccionar estado...'
      }
    ]
  },
  {
    id: 'characteristics',
    label: 'Características',
    fields: [
      {
        key: 'suspects_tags',
        label: 'Características',
        type: 'tags',
        placeholder: 'Seleccionar características...'
      }
    ]
  }
];

export function SuspectFilters({
  filters,
  onFiltersChange,
  filterOptions,
  selectedTags,
  onTagSelect,
  tagOptions
}: SuspectFiltersProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'groups' | 'fields'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<FilterGroup | null>(null);
  const [tempFilters, setTempFilters] = useState<SuspectFiltersState>({});
  const [originalGroupFilters, setOriginalGroupFilters] = useState<SuspectFiltersState>({});

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== "" && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const getGroupActiveCount = (groupId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.fields.filter(field => {
      const value = filters[field.key];
      return value !== undefined && value !== null && value !== "" &&
        (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  const getCurrentGroupTempCount = () => {
    return Object.values(tempFilters).filter(
      (value) => value !== undefined && value !== null && value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const handleSelectGroup = (group: FilterGroup) => {
    setSelectedGroup(group);
    
    // Cargar filtros existentes para el grupo seleccionado
    const groupFilters: SuspectFiltersState = {};
    group.fields.forEach(field => {
      const currentValue = filters[field.key];
      if (currentValue !== undefined && currentValue !== null && currentValue !== "" &&
          (Array.isArray(currentValue) ? currentValue.length > 0 : true)) {
        switch (field.key) {
          case 'suspects_tags':
            groupFilters[field.key] = Array.isArray(currentValue) ? currentValue : typeof currentValue === 'string' ? [currentValue] : undefined;
            break;
          case 'Status':
          case 'alias':
          case 'id':
          case 'search':
            groupFilters[field.key] = typeof currentValue === 'string' ? currentValue : undefined;
            break;
        }
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
      if (value !== undefined && value !== null && value !== "" &&
          (Array.isArray(value) ? value.length > 0 : true)) {
        newFilters[key as keyof SuspectFiltersState] = value;
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

  const handleFilterChange = (key: keyof SuspectFiltersState, value: FilterValue) => {
    const newTempFilters = { ...tempFilters };
    
    if (value === undefined || value === "") {
      delete newTempFilters[key];
    } else {
      switch (key) {
        case 'suspects_tags':
          newTempFilters[key] = Array.isArray(value) ? value : typeof value === 'string' ? [value] : undefined;
          break;
        case 'Status':
        case 'alias':
        case 'id':
        case 'search':
          newTempFilters[key] = typeof value === 'string' ? value : undefined;
          break;
      }
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
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Select
            value={value as string || "none"}
            onValueChange={(newValue) => handleFilterChange(field.key, newValue === "none" ? undefined : newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Todos</SelectItem>
              {filterOptions.statuses.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === 'tags') {
      return (
        <div key={field.key} className="space-y-4">
          <Label>{field.label}</Label>
          {Object.entries(tagOptions).map(([category, tags]) => (
            <div key={category} className="space-y-2">
              <Label className="text-sm text-muted-foreground">{category}</Label>
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge
                    key={tag.value}
                    variant={selectedTags.includes(tag.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => onTagSelect(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label>{field.label}</Label>
        <Input
          placeholder={field.placeholder}
          value={value as string || ""}
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