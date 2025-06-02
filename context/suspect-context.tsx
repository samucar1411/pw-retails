"use client";

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { Suspect } from '@/types/suspect';
import * as suspectService from '@/services/suspect-service';

type SuspectStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface SuspectContextType {
  suspects: Suspect[];
  suspectStatuses: SuspectStatus[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  fetchSuspects: (params?: { page?: number; pageSize?: number; search?: string }) => Promise<void>;
  fetchSuspectStatuses: () => Promise<void>;
  addSuspect: (suspect: Partial<Suspect>) => Promise<Suspect | null>;
  updateSuspect: (id: string, suspect: Partial<Suspect>) => Promise<Suspect | null>;
  deleteSuspect: (id: string) => Promise<boolean>;
  uploadSuspectPhoto: (id: string, file: File) => Promise<{ photoUrl: string } | null>;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setSearchTerm: (term: string) => void;
}

const SuspectContext = createContext<SuspectContextType | undefined>(undefined);

export function SuspectProvider({ children }: { children: ReactNode }) {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const statuses = useMemo<SuspectStatus[]>(() => ['ACTIVE', 'INACTIVE', 'PENDING'], []);
  const [suspectStatuses] = useState<SuspectStatus[]>(statuses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const fetchSuspects = useCallback(async (params?: { page?: number; pageSize?: number; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Use the provided page or default to 1 (1-based for the API)
      const pageToFetch = params?.page !== undefined ? params.page : 1;
      const pageSizeToFetch = params?.pageSize || pagination.pageSize;
      const effectiveSearchTerm = params?.search !== undefined ? params.search : searchTerm;

      console.log(`[SuspectContext] fetchSuspects: Called with params:`, params, 
        `Effective API Call: page=${pageToFetch}, pageSize=${pageSizeToFetch}, search=${effectiveSearchTerm}`);

      const response = await suspectService.getAllSuspects({
        page: pageToFetch,
        page_size: pageSizeToFetch,
        search: effectiveSearchTerm,
      });
      
      setSuspects(response.results);
      setPaginationState(prev => {
        const newState = {
          ...prev,
          pageIndex: pageToFetch, // Store as 1-based to match API
          pageSize: pageSizeToFetch,
          totalCount: response.count,
          totalPages: Math.ceil(response.count / pageSizeToFetch) || 1,
        };
        console.log('[SuspectContext] fetchSuspects: setPaginationState. Prev:', prev, 'New:', newState);
        return newState;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suspects');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.pageSize, setPaginationState]);

  const fetchSuspectStatuses = useCallback(async (): Promise<void> => {
    // Statuses are already set in state, no need to fetch them
    return Promise.resolve();
  }, []);

  const addSuspect = useCallback(async (suspect: Partial<Suspect>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.createSuspect(suspect);
      if (data) { 
        setSuspects((prev) => [...prev, data]);
      }
      return data;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to add suspect");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSuspect = useCallback(async (id: string, updatedSuspect: Partial<Suspect>) => {
    try {
      setLoading(true);
      const data = await suspectService.updateSuspect(id, updatedSuspect);
      if (data) {
        setSuspects(prevSuspects => 
          prevSuspects.map(suspect => 
            suspect.id === id ? { ...suspect, ...data } : suspect
          )
        );
      }
      return data;
    } catch (error) {
      console.error('Error updating suspect:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSuspect = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await suspectService.deleteSuspect(id);
      setSuspects(prev => prev.filter(suspect => suspect.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting suspect:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadSuspectPhoto = useCallback(async (id: string, file: File) => {
    try {
      setLoading(true);
      const response = await suspectService.uploadSuspectPhoto(id, file);
      const photoUrl = response?.PhotoUrl || '';
      
      setSuspects(prev => 
        prev.map(suspect => 
          suspect.id === id ? { ...suspect, photoUrl } : suspect
        )
      );
      
      return { photoUrl };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for initial data load - should run only once
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const initialPage = 1;
        const initialPageSize = pagination.pageSize; // Use the default/initial pageSize
        const initialSearchTerm = searchTerm; // Use the default/initial searchTerm

        const response = await suspectService.getAllSuspects({
          page: initialPage,
          page_size: initialPageSize,
          search: initialSearchTerm,
        });
        setSuspects(response.results);
        setPaginationState(prev => ({
          ...prev,
          pageIndex: initialPage - 1, // Set for page 1
          pageSize: initialPageSize, // Ensure pageSize is consistent
          totalCount: response.count,
          totalPages: Math.ceil(response.count / initialPageSize),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch initial suspects');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    fetchSuspectStatuses(); // Assuming this is also safe to run once or is stable

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only on mount

  const updatePaginationContextState = useCallback((newPaginationPartial: Partial<PaginationState>) => {
    console.log('[SuspectContext] updatePaginationContextState (exposed as setPagination) called with:', newPaginationPartial);
    setPaginationState(prev => {
      const updated = { ...prev, ...newPaginationPartial };
      console.log('[SuspectContext] updatePaginationContextState: prev state:', prev, 'new state:', updated);
      return updated;
    });
  }, [setPaginationState]);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    updatePaginationContextState({ pageIndex: 0 }); 
  }, [updatePaginationContextState]);

  return (
    <SuspectContext.Provider
      value={{
        suspects,
        suspectStatuses,
        loading,
        error,
        pagination, 
        fetchSuspects,
        fetchSuspectStatuses,
        addSuspect,
        updateSuspect,
        deleteSuspect,
        uploadSuspectPhoto,
        setPagination: updatePaginationContextState, 
        setSearchTerm: handleSearchTermChange,
      }}
    >
      {children}
    </SuspectContext.Provider>
  );
}

export function useSuspects() {
  const context = useContext(SuspectContext);
  if (!context) {
    throw new Error("useSuspects must be used within a SuspectProvider");
  }
  return context;
}
