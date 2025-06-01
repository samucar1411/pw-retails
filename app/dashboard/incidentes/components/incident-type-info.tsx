"use client";

import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { IncidentType } from "@/types/incident";
import { getIncidentTypeById } from "@/services/incident-type-service";
import { LoadingState } from "@/components/ui/loading-state";

interface IncidentTypeInfoProps {
  typeId: number;
}

export const IncidentTypeInfo = React.memo(function IncidentTypeInfo({ typeId }: IncidentTypeInfoProps) {
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchIncidentType = async () => {
      if (!typeId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getIncidentTypeById(typeId);
        setIncidentType(data);
      } catch (error) {
        console.error("Error fetching incident type:", error);
        setError(error instanceof Error ? error : new Error("Error fetching incident type"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIncidentType();
  }, [typeId]);
  
  if (isLoading) return <LoadingState variant="inline" size="xs" />;
  if (error) return <span className="text-xs text-destructive">Error</span>;
  if (!incidentType) return <span className="text-xs text-muted-foreground">No disponible</span>;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs font-medium">
          {incidentType.Name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[300px] text-sm">
        <div className="space-y-1">
          <p className="font-semibold">{incidentType.Name}</p>
          {incidentType.Description && (
            <p className="text-muted-foreground">{incidentType.Description}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});
