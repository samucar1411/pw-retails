import { useQuery } from '@tanstack/react-query';
import { getIncidents } from '@/services/incident-service';
import { Incident } from '@/types/incident';

interface AllIncidentsResult {
  incidents: Incident[];
  total: number;
  hasMore: boolean;
  loadedPages: number;
}

interface AllIncidentsParams {
  fromDate?: string;
  toDate?: string;
  Office?: string;
}

// Global cache for progressive loading - shared across all components
const incidentCache = new Map<string, AllIncidentsResult>();

// Smart delay that adapts based on server response
const adaptiveDelay = (requestCount: number) => {
  if (requestCount <= 5) return 100; // Fast for first few requests
  if (requestCount <= 15) return 200; // Medium for next batch
  if (requestCount <= 30) return 400; // Slower for more requests
  return 800; // Much slower for heavy load
};

async function fetchAllIncidentsProgressive(params: AllIncidentsParams): Promise<AllIncidentsResult> {
  const cacheKey = JSON.stringify(params);
  
  // Return cached data if available and recent
  if (incidentCache.has(cacheKey)) {
    const cached = incidentCache.get(cacheKey)!;
    return cached;
  }
  
  let allIncidents: Incident[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  let totalFromServer = 0;
  
  // Phase 1: Quick initial load for immediate UI response (small batches)
  const INITIAL_BATCH_SIZE = 25;
  const INITIAL_PAGES = 3; // Load first 3 pages quickly
  
  // Phase 2: Background loading with larger batches
  const BACKGROUND_BATCH_SIZE = 75;
  const MAX_TOTAL_PAGES = 100; // Reasonable maximum but much higher
  
  // Phase 1: Quick initial load
  while (hasNextPage && currentPage <= INITIAL_PAGES) {
    try {
      const response = await getIncidents({ 
        page: currentPage,
        page_size: INITIAL_BATCH_SIZE,
        fromDate: params.fromDate,
        toDate: params.toDate,
        Office: params.Office
      });
      
      if (response.results && response.results.length > 0) {
        allIncidents = [...allIncidents, ...response.results];
      }
      
      totalFromServer = response.count || 0;
      hasNextPage = !!response.next && currentPage < MAX_TOTAL_PAGES;
      
      // Cache intermediate results for immediate UI updates
      const intermediateResult: AllIncidentsResult = {
        incidents: allIncidents,
        total: totalFromServer,
        hasMore: hasNextPage,
        loadedPages: currentPage
      };
      incidentCache.set(cacheKey, intermediateResult);
      
      currentPage++;
      
      // Quick initial delay
      if (hasNextPage && currentPage <= INITIAL_PAGES) {
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
      }
    } catch (error) {
      console.error(`Error fetching incidents page ${currentPage}:`, error);
      
      // Return partial data if we have some
      if (allIncidents.length > 0) {
        const partialResult: AllIncidentsResult = {
          incidents: allIncidents,
          total: allIncidents.length,
          hasMore: false,
          loadedPages: currentPage - 1
        };
        incidentCache.set(cacheKey, partialResult);
        return partialResult;
      }
      
      throw error;
    }
  }
  
  // Phase 2: Background loading of remaining data with larger batches and delays
  while (hasNextPage && currentPage <= MAX_TOTAL_PAGES) {
    try {
      const response = await getIncidents({ 
        page: currentPage,
        page_size: BACKGROUND_BATCH_SIZE,
        fromDate: params.fromDate,
        toDate: params.toDate,
        Office: params.Office
      });
      
      if (response.results && response.results.length > 0) {
        allIncidents = [...allIncidents, ...response.results];
        
        // Update cache with new data
        const updatedResult: AllIncidentsResult = {
          incidents: allIncidents,
          total: Math.max(totalFromServer, allIncidents.length),
          hasMore: !!response.next && currentPage < MAX_TOTAL_PAGES,
          loadedPages: currentPage
        };
        incidentCache.set(cacheKey, updatedResult);
      }
      
      totalFromServer = response.count || totalFromServer;
      hasNextPage = !!response.next && currentPage < MAX_TOTAL_PAGES;
      currentPage++;
      
      // Adaptive delay based on current load
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
      }
    } catch (error) {
      console.error(`Error in background fetch page ${currentPage}:`, error);
      
      // If we get rate limited or blocked, stop gracefully but return what we have
      if (error instanceof Error && (
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('firewall')
      )) {
        console.warn(`Rate limit detected at page ${currentPage}, stopping background fetch`);
        break;
      }
      
      // For other errors, continue trying a few more times
      if (currentPage <= MAX_TOTAL_PAGES - 5) {
        console.warn(`Error on page ${currentPage}, will try to continue...`);
        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay after error
        continue;
      }
      
      break; // Stop if too many errors near the end
    }
  }
  
  const finalResult: AllIncidentsResult = {
    incidents: allIncidents,
    total: Math.max(totalFromServer, allIncidents.length),
    hasMore: false,
    loadedPages: currentPage - 1
  };
  
  // Cache final result with longer TTL
  incidentCache.set(cacheKey, finalResult);
  
  return finalResult;
}

// Clear cache when needed (called from filters change)
export function clearIncidentsCache() {
  incidentCache.clear();
}

export function useAllIncidents(fromDate?: string, toDate?: string, officeId?: string) {
  return useQuery({
    queryKey: ['all-incidents-progressive', fromDate, toDate, officeId],
    queryFn: () => fetchAllIncidentsProgressive({ fromDate, toDate, Office: officeId }),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more real-time feel
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    retry: 2, // Allow 2 retries for better reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Enable background refetch for data freshness
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false,
  });
} 