"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIncidentsWithFilters } from '@/hooks/useIncidentsWithFilters';
import { IncidentsTable } from "./components/incidents-table";
import { IncidentFilters } from "@/components/incidents/incident-filters";
import { ErrorDisplay } from "@/components/ui/error-display";
import { LoadingState } from "@/components/ui/loading-state";
import { withErrorBoundary } from "@/components/error-boundary";

interface IncidentFiltersState {
  Office?: string;
  IncidentType?: string;
  suspect_alias?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

function IncidentesPage() {
  const router = useRouter();
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

  const handleFiltersChange = (newFilters: IncidentFiltersState) => {
    const updatedFilters = { ...newFilters, search: searchTerm };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const updatedFilters = { ...filters, search: value };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchChange((e.target as HTMLInputElement).value);
    }
  };

  const filtersComponent = IncidentFilters({ 
    filters, 
    onFiltersChange: handleFiltersChange, 
    filterOptions 
  });

  
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
          {filtersComponent.filterButton}
        </div>
      </div>

      {/* Active Filters Row */}
      {filtersComponent.activeFilters && (
        <div className="w-full">
          {filtersComponent.activeFilters}
        </div>
      )}
      
      {/* Incidents Table */}
      {loading ? (
        <LoadingState variant="skeleton" count={5} height="h-12" />
      ) : (
        <IncidentsTable 
          incidents={incidents}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          onRefresh={refreshIncidents}
        />
      )}
    </div>
  );
}

// Export the component wrapped with error boundary
export default withErrorBoundary(IncidentesPage);
