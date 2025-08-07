"use client";

import React, { useState, useEffect } from "react";
import { Office } from "@/types/office";
import { getOffice } from "@/services/office-service";
import { LoadingState } from "@/components/ui/loading-state";

interface OfficeInfoProps {
  officeId: number | Office;
}

export const OfficeInfo = React.memo(function OfficeInfo({ officeId }: OfficeInfoProps) {
  const [office, setOffice] = useState<Office | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchOffice = async () => {
      if (!officeId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (typeof officeId === 'number') {
          const data = await getOffice(officeId);
          setOffice(data);
        } else {
          setOffice(officeId);
        }
      } catch (error) {
        setError(error instanceof Error ? error : new Error("Error fetching office"));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffice();
  }, [officeId]);
  
  if (isLoading) return <LoadingState variant="inline" />;
  if (error) return <span className="text-xs text-destructive">Error</span>;
  
  return (
    <div className="font-medium">
      {office?.Name || (typeof officeId === 'number' ? `Sucursal ${officeId}` : 'Sin sucursal')}
    </div>
  );
});
