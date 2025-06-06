import { useQuery } from '@tanstack/react-query';
import { getAllSuspects } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';

interface AllSuspectsResult {
  suspects: Suspect[];
  total: number;
  hasMore: boolean;
  loadedPages: number;
}

// Global cache for progressive loading - shared across all components
const suspectsCache = new Map<string, AllSuspectsResult>();

// Smart delay that adapts based on server response
const adaptiveDelay = (requestCount: number) => {
  if (requestCount <= 4) return 150; // Slightly slower than incidents
  if (requestCount <= 12) return 300; 
  if (requestCount <= 25) return 500;
  return 1000; // More conservative for suspects
};

async function fetchAllSuspectsProgressive(): Promise<AllSuspectsResult> {
  const cacheKey = 'all-suspects';
  
  // Return cached data if available and recent
  if (suspectsCache.has(cacheKey)) {
    const cached = suspectsCache.get(cacheKey)!;
    return cached;
  }
  
  let allSuspects: Suspect[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  let totalFromServer = 0;
  
  // Phase 1: Quick initial load for immediate UI response
  const INITIAL_BATCH_SIZE = 20;
  const INITIAL_PAGES = 3; // Load first 3 pages quickly
  
  // Phase 2: Background loading with larger batches
  const BACKGROUND_BATCH_SIZE = 60;
  const MAX_TOTAL_PAGES = 75; // Conservative but sufficient maximum
  

  
  // Phase 1: Quick initial load
  while (hasNextPage && currentPage <= INITIAL_PAGES) {
    try {
      const response = await getAllSuspects({ 
        page: currentPage,
        page_size: INITIAL_BATCH_SIZE
      });
      
      if (response.results && response.results.length > 0) {
        allSuspects = [...allSuspects, ...response.results];
      }
      
      totalFromServer = response.count || 0;
      hasNextPage = !!response.next && currentPage < MAX_TOTAL_PAGES;
      
      // Cache intermediate results for immediate UI updates
      const intermediateResult: AllSuspectsResult = {
        suspects: allSuspects,
        total: totalFromServer,
        hasMore: hasNextPage,
        loadedPages: currentPage
      };
      suspectsCache.set(cacheKey, intermediateResult);
      
      currentPage++;
      
      // Quick initial delay
      if (hasNextPage && currentPage <= INITIAL_PAGES) {
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
      }
    } catch (error) {
      console.error(`Error fetching suspects page ${currentPage}:`, error);
      
      // Return partial data if we have some
      if (allSuspects.length > 0) {
        const partialResult: AllSuspectsResult = {
          suspects: allSuspects,
          total: allSuspects.length,
          hasMore: false,
          loadedPages: currentPage - 1
        };
        suspectsCache.set(cacheKey, partialResult);
        return partialResult;
      }
      
      throw error;
    }
  }
  
  // Phase 2: Background loading of remaining data with larger batches and delays
  while (hasNextPage && currentPage <= MAX_TOTAL_PAGES) {
    try {
      const response = await getAllSuspects({ 
        page: currentPage,
        page_size: BACKGROUND_BATCH_SIZE
      });
      
      if (response.results && response.results.length > 0) {
        allSuspects = [...allSuspects, ...response.results];
        
        // Update cache with new data
        const updatedResult: AllSuspectsResult = {
          suspects: allSuspects,
          total: Math.max(totalFromServer, allSuspects.length),
          hasMore: !!response.next && currentPage < MAX_TOTAL_PAGES,
          loadedPages: currentPage
        };
        suspectsCache.set(cacheKey, updatedResult);
      }
      
      totalFromServer = response.count || totalFromServer;
      hasNextPage = !!response.next && currentPage < MAX_TOTAL_PAGES;
      currentPage++;
      
      // Adaptive delay based on current load
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
      }
    } catch (error) {
      console.error(`Error in background suspects fetch page ${currentPage}:`, error);
      
      // If we get rate limited or blocked, stop gracefully but return what we have
      if (error instanceof Error && (
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('firewall')
      )) {
        console.warn(`Rate limit detected at suspects page ${currentPage}, stopping background fetch`);
        break;
      }
      
      // For other errors, continue trying a few more times
      if (currentPage <= MAX_TOTAL_PAGES - 5) {
        console.warn(`Error on suspects page ${currentPage}, will try to continue...`);
        currentPage++;
        await new Promise(resolve => setTimeout(resolve, 3000)); // Longer delay for suspects
        continue;
      }
      
      break; // Stop if too many errors near the end
    }
  }
  
  const finalResult: AllSuspectsResult = {
    suspects: allSuspects,
    total: Math.max(totalFromServer, allSuspects.length),
    hasMore: false,
    loadedPages: currentPage - 1
  };
  
  // Cache final result with longer TTL
  suspectsCache.set(cacheKey, finalResult);
  

  return finalResult;
}

// Clear cache when needed
export function clearSuspectsCache() {
  suspectsCache.clear();
}

export function useAllSuspects() {
  return useQuery({
    queryKey: ['all-suspects-progressive'],
    queryFn: fetchAllSuspectsProgressive,
    staleTime: 4 * 60 * 1000, // 4 minutes - suspects change less frequently
    gcTime: 45 * 60 * 1000, // 45 minutes - keep in memory longer
    retry: 2, // Allow 2 retries
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 30000), // Slower exponential backoff
    // More conservative refetch settings
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
} 