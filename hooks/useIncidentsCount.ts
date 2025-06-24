import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface IncidentsCountResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: unknown[]; // We don't need the results, just the count
}

export function useIncidentsCount(
  fromDate?: string,
  toDate?: string,
  officeId?: string
) {
  return useQuery({
    queryKey: ['incidents-count', fromDate, toDate, officeId],
    queryFn: async (): Promise<number> => {
      // Build URL with filters but limit to just 1 result (we only need the count)
      let url = '/api/incidents/?ordering=-Date&format=json&page_size=1';
      
      // Only add date filters if they are provided
      if (fromDate && fromDate.trim() !== '') url += `&Date_after=${fromDate}`;
      if (toDate && toDate.trim() !== '') url += `&Date_before=${toDate}`;
      if (officeId && officeId !== '') url += `&Office=${officeId}`;
      
      try {
        const { data }: { data: IncidentsCountResponse } = await api.get(url);
        return data.count;
      } catch (error) {
        console.error('Error fetching incidents count:', error);
        throw error;
      }
    },
    // Always enabled - no longer requires date filters
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for counts
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    retry: 1, // Single retry to avoid excessive requests
    retryDelay: 2000, // 2 second delay between retries
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if data is still fresh
  });
} 