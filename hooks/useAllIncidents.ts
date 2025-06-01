import { useQuery } from '@tanstack/react-query';
import { getIncidents } from '@/services/incident-service';
import { Incident } from '@/types/incident';

interface AllIncidentsResult {
  incidents: Incident[];
  total: number;
}

interface AllIncidentsParams {
  fromDate?: string;
  toDate?: string;
  Office?: string;
}

// Add delay between requests to avoid overwhelming the backend
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllIncidents(params: AllIncidentsParams): Promise<AllIncidentsResult> {
  let allIncidents: Incident[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  
  // CRITICAL: Reduce maximum pages to prevent firewall blocking
  const MAX_PAGES = 15; // Reduced from 100 to 15
  const PAGE_SIZE = 50; // Reduced from 100 to 50  
  const DELAY_BETWEEN_REQUESTS = 300; // 300ms delay between requests
  
  while (hasNextPage && currentPage <= MAX_PAGES) {
    try {
      const response = await getIncidents({ 
        page: currentPage,
        page_size: PAGE_SIZE,
        fromDate: params.fromDate,
        toDate: params.toDate,
        Office: params.Office
      });
      
      if (response.results && response.results.length > 0) {
        allIncidents = [...allIncidents, ...response.results];
      }
      
      // Check if there's a next page
      hasNextPage = !!response.next;
      currentPage++;
      
      // Add delay between requests to avoid overwhelming the backend
      if (hasNextPage && currentPage <= MAX_PAGES) {
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    } catch (error) {
      console.error(`Error fetching incidents page ${currentPage}:`, error);
      // If we get a rate limit or connection error, stop fetching
      if (error instanceof Error && (
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('firewall')
      )) {
        console.warn('Rate limit detected, stopping incident fetch');
        break;
      }
      throw error;
    }
  }
  
  console.log(`Fetched ${allIncidents.length} incidents from ${currentPage - 1} pages`);
  
  return {
    incidents: allIncidents,
    total: allIncidents.length
  };
}

export function useAllIncidents(fromDate?: string, toDate?: string, officeId?: string) {
  return useQuery({
    queryKey: ['all-incidents-complete', fromDate, toDate, officeId],
    queryFn: () => fetchAllIncidents({ fromDate, toDate, Office: officeId }),
    staleTime: 8 * 60 * 1000, // Increased to 8 minutes
    gcTime: 15 * 60 * 1000, // Increased to 15 minutes
    // Reduce retry attempts
    retry: 1,
    // Add retry delay
    retryDelay: 3000, // 3 seconds between retries
  });
} 