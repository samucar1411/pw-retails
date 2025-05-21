"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Incident, IncidentType } from "@/types/incident";
import { File } from "@/types/common";
import {
  getIncidents,
  getIncidentsByOffice,
  createIncident,
  updateIncident,
  deleteIncident,
  uploadIncidentAttachments,
  getAllIncidentTypes,
} from "@/services/incident-service";

interface IncidentContextType {
  loadIncidentsWithFilters: (filters: {
    created_at_after?: string;
    created_at_before?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    [key: string]: string | number | boolean | undefined;
  }) => Promise<void>;
  incidents: Incident[];
  incidentTypes: IncidentType[];
  selectedIncident: Incident | null;
  loading: boolean;
  error: string | null;
  loadIncidents: () => Promise<void>;
  loadIncidentTypes: () => Promise<void>;
  loadIncident: (id: number) => Promise<void>;
  updateIncident: (id: number, data: Partial<Incident>) => Promise<Incident | null>;
  createIncident: (data: FormData) => Promise<Incident | null>;
  deleteIncident: (id: number) => Promise<void>;
  uploadAttachments: (id: number, files: globalThis.File[]) => Promise<void>;
  getByOffice: (officeId: number) => Promise<void>;
  getByDateRange: (startDate: string, endDate: string) => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | null>(null);

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data.results);
      setError(null);
    } catch (error) {
      console.error("Error loading incidents:", error);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncidentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const types = await getAllIncidentTypes();
      setIncidentTypes(types);
      setError(null);
    } catch (error) {
      console.error("Error loading incident types:", error);
      setError("Failed to load incident types");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncident = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await getIncidentsByOffice(id);
      // Handle both paginated and non-paginated responses
      const incidents = 'results' in response ? response.results : Array.isArray(response) ? response : [];
      setSelectedIncident(incidents[0] || null);
      setError(null);
    } catch (error) {
      console.error("Error loading incident:", error);
      setError("Failed to load incident");
      setSelectedIncident(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncidentHandler = useCallback(async (id: number, data: Partial<Incident>) => {
    setLoading(true);
    try {
      const updated = await updateIncident(id, data);
      if (updated) {
        setIncidents(prev => prev.map(incident => incident.id === updated.id ? updated : incident));
        setSelectedIncident(prev => (prev && prev.id === updated.id ? updated : prev));
        setError(null);
        return updated;
      }
      setError("Failed to update incident");
      return null;
    } catch (error) {
      console.error("Error updating incident:", error);
      setError("Failed to update incident");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncidentHandler = useCallback(async (data: FormData) => {
    setLoading(true);
    try {
      const incidentData: Partial<Incident> = {
        officeId: Number(data.get('officeId')),
        date: data.get('date') as string,
        time: data.get('time') as string,
        incidentTypeId: Number(data.get('incidentTypeId')),
        description: data.get('description') as string,
        cashLoss: Number(data.get('cashLoss')),
        merchandiseLoss: Number(data.get('merchandiseLoss')),
        otherLosses: Number(data.get('otherLosses')),
        totalLoss: Number(data.get('totalLoss')),
        notes: data.get('notes') as string,
      };

      const created = await createIncident(incidentData);
      setIncidents(prev => [...prev, created]);
      setError(null);
      return created;
    } catch (error) {
      console.error("Error creating incident:", error);
      setError("Failed to create incident");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncidentHandler = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await deleteIncident(id);
      setIncidents(prev => prev.filter(incident => incident.id !== id));
      setSelectedIncident(prev => (prev && prev.id === id ? null : prev));
      setError(null);
    } catch (error) {
      console.error("Error deleting incident:", error);
      setError("Failed to delete incident");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAttachments = useCallback(async (id: number, files: globalThis.File[]) => {
    setLoading(true);
    try {
      const result = await uploadIncidentAttachments(id, files);
      // Convert the returned attachments to the File type used in our app
      const attachments = result.attachments.map((att: { url: string }) => ({
        id: Math.floor(Math.random() * 10000),
        url: att.url,
        name: att.url.split("/").pop() || "file",
        contentType: "image/jpeg",
      }));
      if (attachments.length > 0) {
        await updateIncidentHandler(id, { attachments });
      }
      setError(null);
    } catch (error) {
      console.error("Error uploading attachments:", error);
      setError("Failed to upload attachments");
    } finally {
      setLoading(false);
    }
  }, [updateIncidentHandler]);

  const getByOffice = useCallback(async (officeId: number) => {
    setLoading(true);
    try {
      const response = await getIncidentsByOffice(officeId);
      // Handle both paginated and non-paginated responses
      const incidents = 'results' in response ? response.results : Array.isArray(response) ? response : [];
      setIncidents(incidents);
      setError(null);
    } catch (error) {
      console.error("Error loading office incidents:", error);
      setError("Failed to load office incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getByDateRange = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const data = await getIncidents({
        created_at_after: startDate,
        created_at_before: endDate
      });
      // Handle both paginated and non-paginated responses
      const incidents = 'results' in data ? data.results : Array.isArray(data) ? data : [];
      setIncidents(incidents);
      setError(null);
    } catch (error) {
      console.error("Error loading incidents by date range:", error);
      setError("Failed to load incidents by date range");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    loadIncidentTypes();
  }, [loadIncidents, loadIncidentTypes]);

  // Nueva función para cargar incidentes con filtros
  const loadIncidentsWithFilters = useCallback(async (filters: {
    created_at_after?: string;
    created_at_before?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    [key: string]: string | number | boolean | undefined;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getIncidents(filters);
      // Handle both paginated and non-paginated responses
      const incidents = 'results' in response ? response.results : Array.isArray(response) ? response : [];
      setIncidents(incidents);
    } catch (error) {
      console.error("Error loading filtered incidents:", error);
      setError("Failed to load filtered incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: IncidentContextType = {
    loadIncidentsWithFilters,
    incidents,
    incidentTypes,
    selectedIncident,
    loading,
    error,
    loadIncidents,
    loadIncidentTypes,
    loadIncident,
    updateIncident: updateIncidentHandler,
    createIncident: createIncidentHandler,
    deleteIncident: deleteIncidentHandler,
    uploadAttachments,
    getByOffice,
    getByDateRange,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncident() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncident must be used within an IncidentProvider");
  }
  return context;
}
