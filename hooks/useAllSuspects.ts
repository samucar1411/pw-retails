import { useQuery } from '@tanstack/react-query';
import { getAllSuspects } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';

interface AllSuspectsResult {
  suspects: Suspect[];
  total: number;
}

// Add delay between requests to avoid overwhelming the backend
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllSuspects(): Promise<AllSuspectsResult> {
  let allSuspects: Suspect[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  
  // CRITICAL: Reduce maximum pages to prevent firewall blocking
  const MAX_PAGES = 10; // Reduced from 100 to 10
  const PAGE_SIZE = 50; // Reduced from 100 to 50
  const DELAY_BETWEEN_REQUESTS = 200; // 200ms delay between requests
  
  while (hasNextPage && currentPage <= MAX_PAGES) {
    try {
      const response = await getAllSuspects({ 
        page: currentPage,
        page_size: PAGE_SIZE
      });
      
      if (response.results && response.results.length > 0) {
        allSuspects = [...allSuspects, ...response.results];
      }
      
      // Check if there's a next page
      hasNextPage = !!response.next;
      currentPage++;
      
      // Add delay between requests to avoid overwhelming the backend
      if (hasNextPage && currentPage <= MAX_PAGES) {
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    } catch (error) {
      console.error(`Error fetching suspects page ${currentPage}:`, error);
      // If we get a rate limit or connection error, stop fetching
      if (error instanceof Error && (
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('firewall')
      )) {
        console.warn('Rate limit detected, stopping suspect fetch');
        break;
      }
      throw error;
    }
  }
  
  console.log(`Fetched ${allSuspects.length} suspects from ${currentPage - 1} pages`);
  
  return {
    suspects: allSuspects,
    total: allSuspects.length
  };
}

export function useAllSuspects() {
  return useQuery({
    queryKey: ['all-suspects-complete'],
    queryFn: fetchAllSuspects,
    staleTime: 10 * 60 * 1000, // Increased to 10 minutes
    gcTime: 20 * 60 * 1000, // Increased to 20 minutes
    // Reduce retry attempts
    retry: 1,
    // Add retry delay
    retryDelay: 5000, // 5 seconds between retries
  });
} 