import { useQuery } from '@tanstack/react-query';
import { Incident } from '@/types/incident';
import { api } from '@/services/api';

interface PaginatedIncidentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Incident[];
}

export function usePaginatedIncidents(
  fromDate?: string,
  toDate?: string,
  officeId?: string
) {
  return useQuery({
    queryKey: ['paginated-incidents', fromDate, toDate, officeId],
    queryFn: async () => {
      const allIncidents: Incident[] = [];
      
      // Build initial URL - always start with ordering
      let nextUrl: string | null = '/api/incidents/?ordering=-Date&format=json';
      
      // Only add date filters if they are provided
      if (fromDate && fromDate.trim() !== '') nextUrl += `&Date_after=${fromDate}`;
      if (toDate && toDate.trim() !== '') nextUrl += `&Date_before=${toDate}`;
      if (officeId && officeId !== '') nextUrl += `&Office=${officeId}`;
      
      // Only create date objects if dates are provided
      const fromDateObj = (fromDate && fromDate.trim() !== '') ? new Date(fromDate) : null;
      const toDateObj = (toDate && toDate.trim() !== '') ? new Date(toDate) : null;
      
      // If no date filters are applied, we can rely on the API's built-in filtering
      // and don't need to do client-side date filtering
      const shouldFilterClientSide = fromDateObj !== null || toDateObj !== null;
      
      while (nextUrl) {
        try {
          const { data }: { data: PaginatedIncidentsResponse } = await api.get(nextUrl);
          
          let shouldBreak = false;
          
          // Process each incident in current page
          for (const incident of data.results) {
            // If no client-side filtering needed, add all incidents
            if (!shouldFilterClientSide) {
              allIncidents.push(incident);
              continue;
            }

            // Apply client-side date filtering when needed
            const incidentDate = new Date(incident.Date);
            
            // If incident date is before fromDate, break pagination (since data is ordered)
            if (fromDateObj && incidentDate < fromDateObj) {
              shouldBreak = true;
              break;
            }
            
            // If incident is within range, add it
            if (
              (!fromDateObj || incidentDate >= fromDateObj) &&
              (!toDateObj || incidentDate <= toDateObj)
            ) {
              allIncidents.push(incident);
            }
          }
          
          if (shouldBreak) {
            break;
          }
          
          // Move to next page
          nextUrl = data.next;
        } catch (error) {
          console.error('Error fetching incidents page:', error);
          break;
        }
      }
      
      return allIncidents;
    },
    // Always enabled - no longer requires date filters
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 