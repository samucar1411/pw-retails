import { useQuery } from '@tanstack/react-query';
import { Incident } from '@/types/incident';
import { getIncidents } from '@/services/incident-service';

export function usePaginatedIncidents(
  fromDate?: string,
  toDate?: string,
  officeId?: string
) {
  return useQuery({
    queryKey: ['paginated-incidents', fromDate, toDate, officeId],
    queryFn: async () => {
      const allIncidents: Incident[] = [];
      let page = 1;
      let hasNextPage = true;
      
      // Prepare filters object
      const filters: {
        ordering: string;
        page_size: number;
        fromDate?: string;
        toDate?: string;
        Office?: string;
      } = {
        ordering: '-Date',
        page_size: 50, // Reasonable page size
      };
      
      // Only add filters if they have valid values
      if (fromDate && fromDate.trim() !== '') {
        filters.fromDate = fromDate;
      }
      if (toDate && toDate.trim() !== '') {
        filters.toDate = toDate;
      }
      if (officeId && officeId !== '') {
        filters.Office = officeId;
      }
      
      // Only create date objects if dates are provided for client-side filtering
      const fromDateObj = (fromDate && fromDate.trim() !== '') ? new Date(fromDate) : null;
      const toDateObj = (toDate && toDate.trim() !== '') ? new Date(toDate) : null;
      const shouldFilterClientSide = fromDateObj !== null || toDateObj !== null;
      
      while (hasNextPage) {
        try {
          const response = await getIncidents({
            ...filters,
            page,
          });
          
          let shouldBreak = false;
          
          // Process each incident in current page
          for (const incident of response.results) {
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
          
          // Check if there's a next page
          hasNextPage = !!response.next;
          page++;
          
          // Safety limit to prevent infinite loops
          if (page > 100) {
            console.warn('Reached page limit (100) while fetching incidents');
            break;
          }
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