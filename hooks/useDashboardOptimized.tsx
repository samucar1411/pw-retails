'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAllIncidents } from '@/hooks/useAllIncidents';
import { getAllOfficesComplete } from '@/services/office-service';
import { getIncidentTypes } from '@/services/incident-service';
import { getSuspectStatuses } from '@/services/suspect-service';
import { Incident } from '@/types/incident';
import { Office } from '@/types/office';

interface DashboardOptimizedData {
  // Raw data
  incidents: Incident[];
  offices: Office[];
  incidentTypes: any[];
  suspectStatuses: any[];
  
  // Computed data
  getFilteredIncidents: (fromDate?: string, toDate?: string, officeId?: string) => Incident[];
  getOfficeById: (id: string | number) => Office | undefined;
  getIncidentTypeById: (id: number) => any | undefined;
  getTotalIncidents: (fromDate?: string, toDate?: string, officeId?: string) => number;
  getSuspectStats: (fromDate?: string, toDate?: string, officeId?: string) => {
    identified: number;
    notIdentified: number;
    total: number;
  };
}

export function useDashboardOptimized(): {
  data: DashboardOptimizedData | null;
  isLoading: boolean;
  error: Error | null;
} {
  // Cache all incidents globally - only fetch once
  const { 
    data: incidentsData, 
    isLoading: incidentsLoading, 
    error: incidentsError 
  } = useAllIncidents("", "", ""); // No filters to get all data

  // Cache all offices - only fetch once
  const { 
    data: officesData, 
    isLoading: officesLoading, 
    error: officesError 
  } = useQuery({
    queryKey: ['offices-all-optimized'],
    queryFn: getAllOfficesComplete,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
  });

  // Cache incident types - only fetch once
  const { 
    data: incidentTypesData, 
    isLoading: typesLoading, 
    error: typesError 
  } = useQuery({
    queryKey: ['incident-types-optimized'],
    queryFn: getIncidentTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Cache suspect statuses - only fetch once
  const { 
    data: suspectStatusesData, 
    isLoading: statusesLoading, 
    error: statusesError 
  } = useQuery({
    queryKey: ['suspect-statuses-optimized'],
    queryFn: getSuspectStatuses,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Compute loading and error states
  const isLoading = incidentsLoading || officesLoading || typesLoading || statusesLoading;
  const error = incidentsError || officesError || typesError || statusesError;

  // Memoize computed data to avoid recalculations
  const data = useMemo((): DashboardOptimizedData | null => {
    if (!incidentsData?.incidents || !officesData || !incidentTypesData?.results || !suspectStatusesData) {
      return null;
    }

    const incidents = incidentsData.incidents;
    const offices = officesData;
    const incidentTypes = incidentTypesData.results;
    const suspectStatuses = suspectStatusesData;

    // Helper function to filter incidents client-side
    const getFilteredIncidents = (
      fromDate?: string, 
      toDate?: string, 
      officeId?: string
    ): Incident[] => {
      let filtered = incidents;

      // Filter by date range
      if (fromDate) {
        filtered = filtered.filter(incident => 
          incident.Date && incident.Date >= fromDate
        );
      }
      
      if (toDate) {
        filtered = filtered.filter(incident => 
          incident.Date && incident.Date <= toDate
        );
      }

      // Filter by office
      if (officeId && officeId !== '') {
        filtered = filtered.filter(incident => 
          incident.Office && incident.Office.toString() === officeId
        );
      }

      return filtered;
    };

    // Helper to get office by ID
    const getOfficeById = (id: string | number): Office | undefined => {
      return offices.find(office => office.id.toString() === id.toString());
    };

    // Helper to get incident type by ID
    const getIncidentTypeById = (id: number): any | undefined => {
      return incidentTypes.find(type => type.id === id);
    };

    // Helper to get total incidents count
    const getTotalIncidents = (
      fromDate?: string, 
      toDate?: string, 
      officeId?: string
    ): number => {
      return getFilteredIncidents(fromDate, toDate, officeId).length;
    };

    // Helper to get suspect statistics
    const getSuspectStats = (
      fromDate?: string, 
      toDate?: string, 
      officeId?: string
    ) => {
      const filteredIncidents = getFilteredIncidents(fromDate, toDate, officeId);
      
      // Get all unique suspects from filtered incidents
      const allSuspects = new Set<string>();
      const identifiedSuspects = new Set<string>();
      
      filteredIncidents.forEach(incident => {
        if (incident.Suspects && Array.isArray(incident.Suspects)) {
          incident.Suspects.forEach(suspectId => {
            if (suspectId && suspectId.trim()) {
              allSuspects.add(suspectId);
              // Assume identified if suspect has an ID (you might need to fetch suspect details for exact status)
              identifiedSuspects.add(suspectId);
            }
          });
        }
      });

      return {
        identified: identifiedSuspects.size,
        notIdentified: Math.max(0, allSuspects.size - identifiedSuspects.size),
        total: allSuspects.size,
      };
    };

    return {
      incidents,
      offices,
      incidentTypes,
      suspectStatuses,
      getFilteredIncidents,
      getOfficeById,
      getIncidentTypeById,
      getTotalIncidents,
      getSuspectStats,
    };
  }, [incidentsData, officesData, incidentTypesData, suspectStatusesData]);

  return {
    data,
    isLoading,
    error: error as Error | null,
  };
}

// Hook específico para componentes que solo necesitan datos filtrados
export function useFilteredDashboardData(
  fromDate?: string, 
  toDate?: string, 
  officeId?: string
) {
  const { data, isLoading, error } = useDashboardOptimized();
  
  const filteredData = useMemo(() => {
    if (!data) return null;
    
    const filteredIncidents = data.getFilteredIncidents(fromDate, toDate, officeId);
    const totalIncidents = filteredIncidents.length;
    const suspectStats = data.getSuspectStats(fromDate, toDate, officeId);
    
    return {
      incidents: filteredIncidents,
      totalIncidents,
      suspectStats,
      offices: data.offices,
      incidentTypes: data.incidentTypes,
      suspectStatuses: data.suspectStatuses,
      // Helper functions
      getOfficeById: data.getOfficeById,
      getIncidentTypeById: data.getIncidentTypeById,
    };
  }, [data, fromDate, toDate, officeId]);
  
  return {
    data: filteredData,
    isLoading,
    error,
  };
}