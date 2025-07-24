"use client";

import { Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  search?: string;
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
    
    const search = searchParams.get('search');
    if (search) {
      urlFilters.search = search;
      setSearchTerm(search);
    }
    
    // Apply URL filters if any exist
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
      applyFilters(urlFilters);
    }
  }, [searchParams, applyFilters]);

  const handleFiltersChange = (newFilters: IncidentFiltersState) => {
    const updatedFilters = { 
      ...newFilters, 
      search: searchTerm
    };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const updatedFilters = { 
      ...filters, 
      search: value
    };
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

      {/* Active Filters Row */}
      <div className="w-full flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;
          return (
            <div key={key} className="inline-flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{key}:</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          );
        })}
        </div>
      
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
