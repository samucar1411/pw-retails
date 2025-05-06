"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Suspect, SuspectStatus } from "@/types/suspect";
import * as suspectService from "@/services/suspect-service";

interface SuspectContextType {
  suspects: Suspect[];
  suspectStatuses: SuspectStatus[];
  loading: boolean;
  error: string | null;
  fetchSuspects: () => Promise<void>;
  fetchSuspectStatuses: () => Promise<void>;
  addSuspect: (suspect: Partial<Suspect>) => Promise<Suspect | null>;
  updateSuspect: (id: number, suspect: Partial<Suspect>) => Promise<Suspect | null>;
  deleteSuspect: (id: number) => Promise<boolean>;
  uploadSuspectPhoto: (id: number, file: File) => Promise<{ photoUrl: string } | null>;
}

const SuspectContext = createContext<SuspectContextType | undefined>(undefined);

export function SuspectProvider({ children }: { children: ReactNode }) {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [suspectStatuses, setSuspectStatuses] = useState<SuspectStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuspects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.getAllSuspects();
      setSuspects(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to fetch suspects");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuspectStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.getAllSuspectStatuses();
      setSuspectStatuses(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to fetch suspect statuses");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addSuspect = useCallback(async (suspect: Partial<Suspect>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.createSuspect(suspect);
      setSuspects((prev) => [...prev, data]);
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

  const updateSuspect = useCallback(async (id: number, suspect: Partial<Suspect>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.updateSuspect(id, suspect);
      setSuspects((prev) => prev.map((s) => (s.id === id ? data : s)));
      return data;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to update suspect");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSuspect = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await suspectService.deleteSuspect(id);
      setSuspects((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to delete suspect");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadSuspectPhoto = useCallback(async (id: number, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await suspectService.uploadSuspectPhoto(id, file);
      setSuspects((prev) => prev.map((s) => 
        s.id === id ? { ...s, photoUrl: data.photoUrl } : s
      ));
      return data;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to upload suspect photo");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuspects();
    fetchSuspectStatuses();
  }, [fetchSuspects, fetchSuspectStatuses]);

  return (
    <SuspectContext.Provider
      value={{
        suspects,
        suspectStatuses,
        loading,
        error,
        fetchSuspects,
        fetchSuspectStatuses,
        addSuspect,
        updateSuspect,
        deleteSuspect,
        uploadSuspectPhoto,
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
