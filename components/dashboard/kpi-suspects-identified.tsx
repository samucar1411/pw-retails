"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Loader2 } from "lucide-react";
import { useAllSuspects } from "@/hooks/useAllSuspects";
import Link from "next/link";

interface KpiSuspectsIdentifiedProps {
  fromDate?: string;
  toDate?: string;
  officeId?: string;
}

export function KpiSuspectsIdentified({ fromDate, toDate, officeId }: KpiSuspectsIdentifiedProps) {
  // Fetch suspects with Status=3 (Preso) and use the count from API response
  const { 
    data: suspectsData, 
    isLoading, 
    error 
  } = useAllSuspects({ 
    page: 1, 
    pageSize: 1,  // We only need the count, so minimal page size
    filters: { Status: '3' }  // Filter for imprisoned suspects
  });

  // Get count directly from API response
  const imprisonedCount = suspectsData?.total || 0;

  // Build link to suspects page with filters
  const suspectsLink = React.useMemo(() => {
    const link = `/dashboard/sospechosos`;
    const params = new URLSearchParams();
    
    // Add status filter for imprisoned suspects (Status 3 - Preso)
    params.append('Status', '3');
    
    if (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '') {
      params.append('fromDate', fromDate);
      params.append('toDate', toDate);
    }
    
    if (officeId && officeId !== '') {
      params.append('officeId', officeId);
    }
    
    const queryString = params.toString();
    return queryString ? `${link}?${queryString}` : link;
  }, [fromDate, toDate, officeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sospechosos presos</CardTitle>
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
          <CardTitle className="text-sm font-medium">Sospechosos presos</CardTitle>
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
        <CardTitle className="text-sm font-medium">Sospechosos presos</CardTitle>
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-green-600">{imprisonedCount.toLocaleString()}</div>
          
          <div className="text-xs text-muted-foreground">
            Sospechosos que están en prisión
          </div>
          
          <div className="pt-2">
            <Link href={suspectsLink}>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
                Ver presos →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 