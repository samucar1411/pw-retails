import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllSuspects } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';

interface AllSuspectsResult {
  suspects: Suspect[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface SuspectFilters {
  Status?: string;
  alias?: string;
  id?: string;
  suspects_tags?: string[];
  search?: string;
  fromDate?: string;
  toDate?: string;
  officeId?: string;
}

interface UseAllSuspectsParams {
  page?: number;
  pageSize?: number;
  filters?: SuspectFilters;
}

// Cache key para react-query
const SUSPECTS_QUERY_KEY = 'suspects';

async function fetchSuspects({ 
  page = 1, 
  pageSize = 10,
  filters = {}
}: UseAllSuspectsParams): Promise<AllSuspectsResult> {
  try {
    const response = await getAllSuspects({ 
      page,
      page_size: pageSize,
      ...filters
    });
    
    return {
      suspects: response.results || [],
      total: response.count || 0,
      currentPage: page,
      totalPages: Math.ceil((response.count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error fetching suspects:', error);
    throw error;
  }
}

export function useAllSuspects({ page = 1, pageSize = 10, filters = {} }: UseAllSuspectsParams = {}) {
  return useQuery({
    queryKey: [SUSPECTS_QUERY_KEY, page, pageSize, filters],
    queryFn: () => fetchSuspects({ page, pageSize, filters }),
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 45 * 60 * 1000, // 45 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 30000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Hook para limpiar el caché de sospechosos
export function useClearSuspectsCache() {
  const queryClient = useQueryClient();
  return () => {
    // Invalida todas las queries que empiecen con la key 'suspects'
    queryClient.invalidateQueries({
      queryKey: [SUSPECTS_QUERY_KEY],
    });
  };
} 