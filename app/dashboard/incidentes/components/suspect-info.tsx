"use client";

import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { UserIcon } from "lucide-react";
import { Suspect } from "@/types/suspect";
import { getSuspectById } from "@/services/suspect-service";
import { LoadingState } from "@/components/ui/loading-state";

interface SuspectInfoProps {
  suspectId: string;
}

export const SuspectInfo = React.memo(function SuspectInfo({ suspectId }: SuspectInfoProps) {
  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchSuspect = async () => {
      if (!suspectId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getSuspectById(suspectId);
        setSuspect(data);
      } catch (error) {
        console.error("Error fetching suspect:", error);
        setError(error instanceof Error ? error : new Error("Error fetching suspect"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuspect();
  }, [suspectId]);
  
  if (isLoading) return <LoadingState variant="inline" />;
  if (error) return <span className="text-xs text-destructive">Error</span>;
  if (!suspect) return <span className="text-xs text-muted-foreground">No disponible</span>;
  
  return (
    <div className="flex items-center gap-1.5 group">
      <UserIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs font-medium text-foreground/90 hover:underline cursor-help truncate max-w-[120px]">
            {suspect.Alias || 'Sospechoso'}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px] text-sm">
          <div className="space-y-1">
            <p className="font-semibold">{suspect.Alias || 'Sospechoso'}</p>
            {suspect.PhysicalDescription && (
              <p className="text-muted-foreground">{suspect.PhysicalDescription}</p>
            )}
            <div className="mt-1">
              <Badge variant={suspect.Status === 1 ? 'destructive' : 'outline'} className="text-xs">
                {suspect.Status === 1 ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
