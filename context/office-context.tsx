"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Office } from '@/types/office';
import { getAllOffices } from '@/services/office-service';

interface OfficeContextType {
  offices: Office[];
  isLoading: boolean;
  error: Error | null;
  fetchOffices: () => Promise<void>; // Function to manually refetch offices
  selectedOffice: Office | null;
  selectOffice: (office: Office) => void;
}

const OfficeContext = createContext<OfficeContextType | null>(null);

export const OfficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const fetchOfficesData = useCallback(async () => {
    console.log("[OfficeContext] Starting fetch of all offices...");
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOffices = await getAllOffices(); // Assuming getAllOffices returns Office[]
      console.log(`[OfficeContext] Fetched ${fetchedOffices.length} offices successfully`);
      setOffices(fetchedOffices);
      // If no office is selected and we fetched some, select the first one by default
      if (!selectedOffice && fetchedOffices.length > 0) {
        setSelectedOffice(fetchedOffices[0]);
        console.log(`[OfficeContext] Default office selected: ${fetchedOffices[0].Name}`);
      }
    } catch (err) {
      console.error("[OfficeContext] Failed to fetch offices:", err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred while fetching offices'));
      setOffices([]);
    } finally {
      setIsLoading(false);
      console.log("[OfficeContext] Fetch finished.");
    }
  }, []); // Remove selectedOffice from dependencies to prevent infinite loop

  useEffect(() => {
    console.log("[OfficeContext] Provider mounted, triggering fetch.");
    // Fetch offices when the provider mounts
    fetchOfficesData();
  }, [fetchOfficesData]); // fetchOfficesData is stable due to useCallback with empty deps

  const selectOffice = (office: Office) => {
    setSelectedOffice(office);
  };

  return (
    <OfficeContext.Provider value={{ offices, isLoading, error, fetchOffices: fetchOfficesData, selectedOffice, selectOffice }}>
      {children}
    </OfficeContext.Provider>
  );
};

export const useOffice = () => {
  const context = useContext(OfficeContext);
  if (!context) {
    throw new Error('useOffice must be used within an OfficeProvider');
  }
  return context;
};

/**
 * OfficeDebugger: React component to display all offices from context for debugging
 */
export const OfficeDebugger: React.FC = () => {
  const { offices, isLoading, error } = useOffice();
  if (isLoading) return <div>Loading offices...</div>;
  if (error) return <div>Error fetching offices: {error.message}</div>;
  return (
    <div>
      <h2>Offices</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(offices, null, 2)}
      </pre>
    </div>
  );
};