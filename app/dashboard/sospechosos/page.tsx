'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { SuspectFilters } from '@/components/suspects/suspect-filters';
import { useAllSuspects } from '@/hooks/useAllSuspects';
import { getSuspectStatuses } from '@/services/suspect-service';
import { SuspectStatus } from '@/types/suspect';
import { Search, X, Plus } from 'lucide-react';
import { columns } from './columns';
import { Suspect } from '@/types/suspect';

interface SuspectFiltersState {
  Status?: string;
  alias?: string;
  id?: string;
  suspects_tags?: string[];
  search?: string;
}

// Definir las opciones de tags disponibles
const SUSPECT_TAG_OPTIONS = {
  'Género': [
    { value: 'masculino', label: 'Hombre' },
    { value: 'femenino', label: 'Mujer' },
    { value: 'desconocido', label: 'Desconocido' }
  ],
  'Altura': [
    { value: 'bajo', label: 'Bajo' },
    { value: 'normal', label: 'Normal' },
    { value: 'alto', label: 'Alto' },
    { value: 'muy_alto', label: 'Muy Alto' }
  ],
  'Contextura': [
    { value: 'flaco', label: 'Flaco' },
    { value: 'normal', label: 'Normal' },
    { value: 'musculoso', label: 'Musculoso' },
    { value: 'sobrepeso', label: 'Sobrepeso' }
  ],
  'Tono de Piel': [
    { value: 'clara', label: 'Clara' },
    { value: 'triguena', label: 'Trigueña' },
    { value: 'oscura', label: 'Oscura' },
    { value: 'negra', label: 'Negra' }
  ],
  'Piercings': [
    { value: 'nariz', label: 'Nariz' },
    { value: 'oreja', label: 'Oreja' },
    { value: 'cejas', label: 'Cejas' },
    { value: 'lengua', label: 'Lengua' },
    { value: 'labios', label: 'Labios' }
  ],
  'Tatuajes': [
    { value: 'brazos', label: 'Brazos' },
    { value: 'cara', label: 'Cara' },
    { value: 'cuello', label: 'Cuello' },
    { value: 'piernas', label: 'Piernas' },
    { value: 'mano', label: 'Mano' }
  ],
  'Accesorios': [
    { value: 'lentes_sol', label: 'Lentes de sol' },
    { value: 'bolsa', label: 'Bolsa' },
    { value: 'lentes', label: 'Lentes' },
    { value: 'casco', label: 'Casco' },
    { value: 'mochila', label: 'Mochila' }
  ],
  'Comportamiento': [
    { value: 'nervioso', label: 'Nervioso' },
    { value: 'agresivo', label: 'Agresivo' },
    { value: 'portaba_armas', label: 'Portaba Armas' },
    { value: 'abuso_fisico', label: 'Abuso Físico' },
    { value: 'alcohol_droga', label: 'Alcoholizado/Drogado' }
  ],
  'Elementos que Dificultan ID': [
    { value: 'mascarilla', label: 'Mascarilla/barbijo' },
    { value: 'casco', label: 'Casco' },
    { value: 'pasamontanas', label: 'Pasamontañas' },
    { value: 'capucha', label: 'Capucha' },
    { value: 'lentes_oscuros', label: 'Lentes Oscuros' }
  ]
};

function SuspectsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [suspectStatuses, setSuspectStatuses] = useState<SuspectStatus[]>([]);
  const [filters, setFilters] = useState<SuspectFiltersState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useAllSuspects({
    page,
    pageSize,
    filters: {
      ...filters,
      search: searchTerm || undefined
    }
  }) as {
    data: {
      suspects: Suspect[];
      total: number;
      currentPage: number;
      totalPages: number;
    } | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  // Load suspect statuses
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await getSuspectStatuses();
        setSuspectStatuses(statuses);
      } catch (error) {
        console.error('Error loading suspect statuses:', error);
        setSuspectStatuses([
          { id: 1, Name: 'Libre' },
          { id: 2, Name: 'Detenido' }
        ]);
      }
    };

    loadStatuses();
  }, []);

  const handleFiltersChange = (newFilters: SuspectFiltersState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleTagSelect = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    const updatedFilters = { 
      ...filters, 
      suspects_tags: newTags.length > 0 ? newTags : undefined 
    };
    setFilters(updatedFilters);
    setPage(1); // Reset to first page when tags change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1); // Reset to first page when search changes
  };

  const getFilterDisplayText = (key: string, value: string) => {
    if (key === 'suspects_tags') {
      // Buscar en todas las categorías
      for (const [category, tags] of Object.entries(SUSPECT_TAG_OPTIONS)) {
        const tag = tags.find(t => t.value === value);
        if (tag) {
          return `${category}: ${tag.label}`;
        }
      }
      return value;
    }
    if (key === 'Status') {
      const status = suspectStatuses.find(s => s.id.toString() === value);
      return `Estado: ${status?.Name || value}`;
    }
    return `${key}: ${value}`;
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key as keyof SuspectFiltersState] = undefined;
      setSelectedTags(selectedTags.filter(t => t !== value));
    } else {
      newFilters[key as keyof SuspectFiltersState] = undefined;
    }
    setFilters(newFilters);
    setPage(1); // Reset to first page when removing filters
  };

  // Loading skeleton
  if (isLoading && (!data || data.suspects.length === 0)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorDisplay 
          title="Error al cargar los sospechosos" 
          message={error.message} 
          error={error}
          retry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sospechosos</h1>
          <p className="text-muted-foreground">
            {data?.total || 0} sospechoso{data?.total !== 1 ? 's' : ''} encontrado{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sospechosos/nuevo")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Nuevo sospechoso</span>
          Nuevo Sospechoso
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sospechosos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex-shrink-0">
          <SuspectFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filterOptions={{ statuses: suspectStatuses }}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            tagOptions={SUSPECT_TAG_OPTIONS}
          />
        </div>
      </div>

      {/* Active Filters */}
      {(Object.keys(filters).length > 0 || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === 'suspects_tags') return null;
            return (
              <Badge
                key={key}
                variant="secondary"
                className="px-2 py-1 text-xs"
              >
                {getFilterDisplayText(key, value)}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveFilter(key)}
                />
              </Badge>
            );
          })}
          {selectedTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-2 py-1 text-xs"
            >
              {getFilterDisplayText('suspects_tags', tag)}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveFilter('suspects_tags', tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Suspects Table */}
      {data && (
        <DataTable
          columns={columns}
          data={data.suspects}
          pageCount={data.totalPages}
          pagination={{
            pageIndex: data.currentPage - 1,
            pageSize: pageSize
          }}
          onPaginationChange={({ pageIndex }) => setPage(pageIndex + 1)}
          loading={isLoading}
          isError={!!error}
        />
      )}
    </div>
  );
}

export default SuspectsPage;

