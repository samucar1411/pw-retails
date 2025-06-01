"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Loader2 } from "lucide-react";
import { useAllSuspects } from "@/hooks/useAllSuspects";
import Link from "next/link";

export function KpiSuspectsIdentified() {
  // Fetch all suspects across all pages
  const { 
    data: suspectsData, 
    isLoading, 
    error 
  } = useAllSuspects();

  // Filter suspects that are identified (Detenido: 1 or Preso: 3)
  const identifiedCount = React.useMemo(() => {
    if (!suspectsData?.suspects) return 0;
    return suspectsData.suspects.filter(suspect => 
      suspect.Status === 1 || suspect.Status === 3
    ).length;
  }, [suspectsData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sospechosos capturados</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sospechosos capturados</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sospechosos capturados</CardTitle>
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-green-600">{identifiedCount.toLocaleString()}</div>
          
          <div className="text-xs text-muted-foreground">
            Detenidos o en prisión (de {suspectsData?.total || 0} total)
          </div>
          
          <div className="pt-2">
            <Link href="/dashboard/sospechosos">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
                Ver sospechosos →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 