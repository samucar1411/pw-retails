"use client";


import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncidents } from '@/hooks/use-incident';
import { IncidentsTable } from "./components/incidents-table";

export default function IncidentesPage() {
  const router = useRouter();
  const { error, isLoading } = useIncidents(1);

  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Error al cargar los incidentes: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Incidentes</h1>
        <Button
          onClick={() => router.push("/dashboard/incidentes/crear")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Incidente
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <IncidentsTable />
      )}
    </div>
  );
}
