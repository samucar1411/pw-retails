"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserMinus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAllIncidents } from "@/hooks/useAllIncidents";
import { getSuspect } from "@/services/suspect-service";
import { Suspect } from "@/types/suspect";
import { getSafeImageUrl } from "@/lib/utils";

interface TopRepeatSuspectsProps {
  fromDate?: string;
  toDate?: string;
  officeId?: string;
}

interface SuspectStats {
  id: string;
  count: number;
  suspect?: Suspect;
}

export function TopRepeatSuspects({}: TopRepeatSuspectsProps = {}) {
  const { 
    data: incidentsData, 
    isLoading, 
    error 
  } = useAllIncidents("", "", ""); // Use empty strings to get all data without date filtering

  const [suspectData, setSuspectData] = React.useState<Record<string, Suspect>>({});
  const [loadingSuspects, setLoadingSuspects] = React.useState(false);

  // Calculate suspect counts
  const suspectCounts = React.useMemo(() => {
    if (!incidentsData?.incidents?.length) return [];

    const incidents = incidentsData.incidents;
    const counts: Record<string, number> = {};
    
    incidents.forEach(incident => {
      if (incident.Suspects && Array.isArray(incident.Suspects)) {
        incident.Suspects.forEach(suspectId => {
          if (suspectId && suspectId.trim()) {
            counts[suspectId] = (counts[suspectId] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [incidentsData]);

  // Fetch suspect details for top suspects
  React.useEffect(() => {
    const fetchSuspectData = async () => {
      if (!suspectCounts.length) return;

      setLoadingSuspects(true);
      const suspectPromises = suspectCounts.map(({ id }) => getSuspect(id));

      try {
        const suspects = await Promise.all(suspectPromises);
        const suspectMap: Record<string, Suspect> = {};
        suspects.forEach((suspect, index) => {
          if (suspect) {
            suspectMap[suspectCounts[index].id] = suspect;
          }
        });
        setSuspectData(suspectMap);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
      } finally {
        setLoadingSuspects(false);
      }
    };

    fetchSuspectData();
  }, [suspectCounts]);

  const topSuspects: SuspectStats[] = React.useMemo(() => {
    return suspectCounts.map(({ id, count }) => ({
      id,
      count,
      suspect: suspectData[id]
    }));
  }, [suspectCounts, suspectData]);

  if (isLoading || loadingSuspects) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserMinus className="h-5 w-5 text-primary" />
            Sospechosos Recurrentes
          </CardTitle>
          <CardDescription>
            Top 5 sospechosos que más veces aparecen ({topSuspects.reduce((sum, s) => sum + s.count, 0)} apariciones total)
            {incidentsData?.total ? ` (${incidentsData.total} incidentes analizados)` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserMinus className="h-5 w-5 text-primary" />
            Sospechosos Recurrentes
          </CardTitle>
          <CardDescription>
            Top 5 sospechosos que más veces aparecen ({topSuspects.reduce((sum, s) => sum + s.count, 0)} apariciones total)
            {incidentsData?.total ? ` (${incidentsData.total} incidentes analizados)` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos de sospechos</div>
        </CardContent>
      </Card>
    );
  }

  if (topSuspects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserMinus className="h-5 w-5 text-primary" />
            Sospechosos Recurrentes
          </CardTitle>
          <CardDescription>
            Top 5 sospechosos que más veces aparecen ({topSuspects.reduce((sum, s) => sum + s.count, 0)} apariciones total)
            {incidentsData?.total ? ` (${incidentsData.total} incidentes analizados)` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <UserMinus className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay sospechos repetidos</p>
            <p className="text-xs">No se identificaron sospechos en este período</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserMinus className="h-5 w-5" />
          Sospechosos Recurrentes
        </CardTitle>
        <CardDescription>
          Top 5 sospechosos que más veces aparecen ({topSuspects.reduce((sum, s) => sum + s.count, 0)} apariciones total)
          {incidentsData?.total ? ` (${incidentsData.total} incidentes analizados)` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-4">
          {topSuspects.map((suspectStat, index) => {
            const suspect = suspectStat.suspect;
            const initials = suspect?.Alias 
              ? suspect.Alias.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : suspectStat.id.slice(0, 2).toUpperCase();

            return (
              <Link key={suspectStat.id} href={`/dashboard/sospechosos/${suspectStat.id}`}>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer group">
                  <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"} className="text-xs px-1.5 sm:px-2">
                    #{index + 1}
                  </Badge>
                  
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage 
                      src={getSafeImageUrl(suspect?.PhotoUrl)} 
                      alt={suspect?.Alias || `Sospechoso`}
                    />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {suspect?.Alias || `SIN ALIAS`}
                      </p>
                      <code className="text-xs bg-muted px-1 sm:px-1.5 py-0.5 rounded shrink-0">
                        {suspectStat.id.slice(-8)}
                      </code>
                    </div>
                    {suspect?.PhysicalDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {suspect.PhysicalDescription.length > 45 
                          ? `${suspect.PhysicalDescription.slice(0, 45)}...` 
                          : suspect.PhysicalDescription}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold text-primary">
                      {suspectStat.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      apariciones
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Summary stats */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t bg-muted/20 rounded-lg p-2 sm:p-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-lg sm:text-xl font-bold">{topSuspects.length}</p>
              <p className="text-xs text-muted-foreground">Sospechosos únicos</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">
                {topSuspects.reduce((sum, s) => sum + s.count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Apariciones total</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">
                {topSuspects.length > 0 ? 
                  (topSuspects.reduce((sum, s) => sum + s.count, 0) / topSuspects.length).toFixed(1) 
                  : '0'}
              </p>
              <p className="text-xs text-muted-foreground">Promedio por sospechoso</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 