"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Office } from '@/types/office';
import { getOffices } from '@/services/office-service';

interface OfficeContextType {
  offices: Office[];
  isLoading: boolean;
  error: Error | null;
  fetchOffices: () => Promise<void>; // Function to manually refetch offices
}

const OfficeContext = createContext<OfficeContextType | null>(null);

export const OfficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOfficesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOffices();
      setOffices(data);
    } catch (err) {
      console.error("Failed to fetch offices:", err);
      // Ensure the error is an Error object
      setError(err instanceof Error ? err : new Error('An unknown error occurred while fetching offices'));
      setOffices([]); // Clear offices on error
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    // Fetch offices when the provider mounts
    fetchOfficesData();
  }, [fetchOfficesData]); // fetchOfficesData is stable due to useCallback with empty deps

  return (
    <OfficeContext.Provider value={{ offices, isLoading, error, fetchOffices: fetchOfficesData }}>
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