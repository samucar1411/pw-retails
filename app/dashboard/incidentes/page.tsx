"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useIncidents } from '@/hooks/use-incident';
import { IncidentsTable } from "./components/incidents-table";
import { ErrorDisplay } from "@/components/ui/error-display";
import { LoadingState } from "@/components/ui/loading-state";
import { withErrorBoundary } from "@/components/error-boundary";

function IncidentesPage() {
  const router = useRouter();
  const { error, isLoading, refetch } = useIncidents(1);

  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ErrorDisplay 
          title="Error al cargar los incidentes" 
          message={error.message} 
          error={error} 
          retry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incidentes</h1>
        <Button
          onClick={() => router.push("/dashboard/incidentes/nuevo")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Incidente
        </Button>
      </div>
      
      {isLoading ? (
        <LoadingState variant="skeleton" count={5} height="h-12" />
      ) : (
        <IncidentsTable />
      )}
    </div>
  );
}

// Export the component wrapped with error boundary
export default withErrorBoundary(IncidentesPage);
