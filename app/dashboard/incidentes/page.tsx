"use client";


import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";



import Alert from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDescription } from "visor-ui";

import { useIncidents } from '@/hooks/use-incident';
import { IncidentsTable } from "./components/incidents-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentesPage() {
  const router = useRouter();
  const { error, isLoading } = useIncidents(1);

  
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Incidentes</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* <Input
                placeholder="Buscar incidentes..."
                className="w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              /> */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={() => router.push("/dashboard/incidentes/crear")}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo cliente
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <IncidentsTable />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
