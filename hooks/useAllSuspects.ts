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
  let totalFromServer = 0;
  let totalPages = 0;
  
  // Configuration
  const PAGE_SIZE = 10; // API always returns 10 items per page
  
  try {
    // First, get the first page to determine total count and pages
    const firstResponse = await getAllSuspects({ 
      page: 1,
      page_size: PAGE_SIZE
    });
    
    totalFromServer = firstResponse.count || 0;
    totalPages = Math.ceil(totalFromServer / PAGE_SIZE);
    
    // Add first page results
    if (firstResponse.results && firstResponse.results.length > 0) {
      allSuspects = [...firstResponse.results];
    }
    
    // If there's only one page, return early
    if (totalPages <= 1) {
      const result: AllSuspectsResult = {
        suspects: allSuspects,
        total: totalFromServer,
        hasMore: false,
        loadedPages: 1
      };
      suspectsCache.set(cacheKey, result);
      return result;
    }
    
    // Cache initial result for immediate UI updates
    const initialResult: AllSuspectsResult = {
      suspects: allSuspects,
      total: totalFromServer,
      hasMore: totalPages > 1,
      loadedPages: 1
    };
    suspectsCache.set(cacheKey, initialResult);
    
    // Fetch remaining pages based on actual count
    currentPage = 2;
    while (currentPage <= totalPages) {
      try {
        const response = await getAllSuspects({ 
          page: currentPage,
          page_size: PAGE_SIZE
        });
        
        if (response.results && response.results.length > 0) {
          allSuspects = [...allSuspects, ...response.results];
          
          // Update cache with new data
          const updatedResult: AllSuspectsResult = {
            suspects: allSuspects,
            total: totalFromServer,
            hasMore: currentPage < totalPages,
            loadedPages: currentPage
          };
          suspectsCache.set(cacheKey, updatedResult);
        }
        
        currentPage++;
        
        // Add delay between requests to avoid overwhelming the server
        if (currentPage <= totalPages) {
          await new Promise(resolve => setTimeout(resolve, adaptiveDelay(currentPage)));
        }
      } catch (error) {
        console.error(`Error fetching suspects page ${currentPage}:`, error);
        
        // If we get rate limited or blocked, stop gracefully but return what we have
        if (error instanceof Error && (
          error.message.includes('429') || 
          error.message.includes('rate limit') ||
          error.message.includes('firewall')
        )) {
          console.warn(`Rate limit detected at suspects page ${currentPage}, stopping fetch`);
          break;
        }
        
        // For other errors, try a few more times with longer delay
        if (currentPage <= totalPages) {
          console.warn(`Error on suspects page ${currentPage}, retrying after delay...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          // Don't increment currentPage to retry the same page
          continue;
        }
        
        break;
      }
    }
    
  } catch (error) {
    console.error('Error in initial suspects fetch:', error);
    
    // Return empty result if first request fails
    const errorResult: AllSuspectsResult = {
      suspects: [],
      total: 0,
      hasMore: false,
      loadedPages: 0
    };
    return errorResult;
  }
  
  const finalResult: AllSuspectsResult = {
    suspects: allSuspects,
    total: totalFromServer,
    hasMore: false,
    loadedPages: Math.min(currentPage - 1, totalPages)
  };
  
  // Cache final result
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
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 45 * 60 * 1000, // 45 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
} 