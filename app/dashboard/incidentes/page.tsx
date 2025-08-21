"use client";

import { Plus, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIncidentsWithFilters } from '@/hooks/useIncidentsWithFilters';
import { IncidentFilters } from "@/components/incidents/incident-filters";
import { ErrorDisplay } from "@/components/ui/error-display";
import { LoadingState } from "@/components/ui/loading-state";
import { withErrorBoundary } from "@/components/error-boundary";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/incidents-table/columns";

interface IncidentFiltersState {
  Office?: string;
  IncidentType?: string;
  suspect_alias?: string;
  fromDate?: string;
  toDate?: string;
  Search?: string;
}

function IncidentesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    incidents, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    totalPages, 
    filterOptions, 
    refreshIncidents, 
    applyFilters, 
    goToPage 
  } = useIncidentsWithFilters(10);
  
  const [filters, setFilters] = useState<IncidentFiltersState>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Read URL parameters on component mount
  useEffect(() => {
    const urlFilters: IncidentFiltersState = {};
    
    // Read date filters
    const dateAfter = searchParams.get('Date_after');
    const dateBefore = searchParams.get('Date_before');
    if (dateAfter) urlFilters.fromDate = dateAfter;
    if (dateBefore) urlFilters.toDate = dateBefore;
    
    // Read office filter
    const office = searchParams.get('Office');
    if (office) urlFilters.Office = office;
    
    // Read other filters
    const incidentType = searchParams.get('IncidentType');
    if (incidentType) urlFilters.IncidentType = incidentType;
    
    const suspectAlias = searchParams.get('suspect_alias');
    if (suspectAlias) urlFilters.suspect_alias = suspectAlias;
    
    const search = searchParams.get('Search');
    if (search) {
      urlFilters.Search = search;
      setSearchTerm(search);
    }
    
    // Always apply URL filters, even if empty (this will trigger a fresh load)
    setFilters(urlFilters);
    applyFilters(urlFilters);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFiltersChange = (newFilters: IncidentFiltersState) => {
    const updatedFilters = { 
      ...newFilters, 
      Search: searchTerm
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const updatedFilters = { 
      ...filters, 
      Search: value
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const getFilterDisplayText = (key: string, value: string) => {
    if (key === 'fromDate') {
      return `Desde: ${new Date(value).toLocaleDateString('es-ES')}`;
    }
    if (key === 'toDate') {
      return `Hasta: ${new Date(value).toLocaleDateString('es-ES')}`;
    }
    if (key === 'Office') {
      const office = filterOptions.offices.find(o => o.id === value);
      return `Sucursal: ${office?.name || value}`;
    }
    if (key === 'IncidentType') {
      const type = filterOptions.incidentTypes.find(t => t.id === value);
      return `Tipo: ${type?.Name || value}`;
    }
    if (key === 'suspect_alias') {
      return `Sospechoso: ${value}`;
    }
    if (key === 'Search') {
      return `Búsqueda: ${value}`;
    }
    return `${key}: ${value}`;
  };

  const handleRemoveFilter = (key: string) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key as keyof IncidentFiltersState];
    
    if (key === 'Search') {
      setSearchTerm('');
    }
    
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchChange((e.target as HTMLInputElement).value);
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorDisplay 
          title="Error al cargar los incidentes" 
          message={error} 
          error={new Error(error)} 
          retry={refreshIncidents}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Incidentes</h1>
          <p className="text-muted-foreground">
            {totalCount} incidente{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/incidentes/nuevo")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Incidente
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar incidentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex-shrink-0">
          <IncidentFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            filterOptions={filterOptions}
          />
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).some(key => filters[key as keyof IncidentFiltersState]) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '') return null;
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
        </div>
      )}
      
      {/* Incidents Table */}
      {loading ? (
        <LoadingState variant="skeleton" count={5} height="h-12" />
      ) : (
        <DataTable 
          columns={columns}
          data={incidents}
          pageCount={totalPages}
          pagination={{
            pageIndex: currentPage - 1,
            pageSize: 10
          }}
          onPaginationChange={({ pageIndex }) => goToPage(pageIndex + 1)}
          loading={loading}
          isError={!!error}
        />
      )}
    </div>
  );
}

function IncidentesPage() {
  return (
    <Suspense fallback={<LoadingState variant="skeleton" count={5} height="h-12" />}>
      <IncidentesPageContent />
    </Suspense>
  );
}

// Export the component wrapped with error boundary
export default withErrorBoundary(IncidentesPage);
