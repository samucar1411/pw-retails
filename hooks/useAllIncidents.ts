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
  let totalFromServer = 0;
  let totalPages = 0;
  
  // Configuration
  const PAGE_SIZE = 10; // API always returns 10 items per page
  
  try {
    // First, get the first page to determine total count and pages
    const firstResponse = await getIncidents({ 
      page: 1,
      page_size: PAGE_SIZE,
      fromDate: params.fromDate,
      toDate: params.toDate,
      Office: params.Office
    });
    
    totalFromServer = firstResponse.count || 0;
    totalPages = Math.ceil(totalFromServer / PAGE_SIZE);
    
    // Add first page results
    if (firstResponse.results && firstResponse.results.length > 0) {
      allIncidents = [...firstResponse.results];
    }
    
    // If there's only one page, return early
    if (totalPages <= 1) {
      const result: AllIncidentsResult = {
        incidents: allIncidents,
        total: totalFromServer,
        hasMore: false,
        loadedPages: 1
      };
      incidentCache.set(cacheKey, result);
      return result;
    }
    
    // Cache initial result for immediate UI updates
    const initialResult: AllIncidentsResult = {
      incidents: allIncidents,
      total: totalFromServer,
      hasMore: totalPages > 1,
      loadedPages: 1
    };
    incidentCache.set(cacheKey, initialResult);
    
    // Fetch remaining pages based on actual count
    currentPage = 2;
    while (currentPage <= totalPages) {
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
          
          // Update cache with new data
          const updatedResult: AllIncidentsResult = {
            incidents: allIncidents,
            total: totalFromServer,
            hasMore: currentPage < totalPages,
            loadedPages: currentPage
          };
          incidentCache.set(cacheKey, updatedResult);
        }
        
        currentPage++;
        
        // Add delay between requests to avoid overwhelming the server
        if (currentPage <= totalPages) {
          await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
        }
      } catch (error) {
        console.error(`Error fetching incidents page ${currentPage}:`, error);
        
        // If we get rate limited or blocked, stop gracefully but return what we have
        if (error instanceof Error && (
          error.message.includes('429') || 
          error.message.includes('rate limit') ||
          error.message.includes('firewall')
        )) {
          console.warn(`Rate limit detected at page ${currentPage}, stopping fetch`);
          break;
        }
        
        // For other errors, try a few more times with longer delay
        if (currentPage <= totalPages) {
          console.warn(`Error on page ${currentPage}, retrying after delay...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Don't increment currentPage to retry the same page
          continue;
        }
        
        break;
      }
    }
    
  } catch (error) {
    console.error('Error in initial fetch:', error);
    
    // Return empty result if first request fails
    const errorResult: AllIncidentsResult = {
      incidents: [],
      total: 0,
      hasMore: false,
      loadedPages: 0
    };
    return errorResult;
  }
  
  const finalResult: AllIncidentsResult = {
    incidents: allIncidents,
    total: totalFromServer,
    hasMore: false,
    loadedPages: Math.min(currentPage - 1, totalPages)
  };
  
  // Cache final result
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
} 