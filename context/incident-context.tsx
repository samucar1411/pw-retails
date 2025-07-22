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
import { SelectedSuspectFormValues } from "@/validators/incident";
import { File } from "@/types/common";
import {
  getIncidents,
  getIncidentsByOffice,
  createIncident,
  updateIncident,
  deleteIncident,
  uploadIncidentAttachments,
  getIncidentTypes,
  getIncidentById,
} from "@/services/incident-service";

interface IncidentFormData {
  officeId: number;
  date: string;
  time: string;
  incidentTypeId: number;
  description?: string;
  cashLoss: number;
  merchandiseLoss: number;
  otherLosses: number;
  totalLoss: number;
  notes?: string;
  selectedSuspects?: SelectedSuspectFormValues[];
  suspects?: string[]; // Array of suspect UUIDs for direct use
}

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
  loadIncident: (id: string) => Promise<void>;
  updateIncident: (id: string, data: Partial<Incident>) => Promise<Incident | null>;
  createIncident: (data: FormData | IncidentFormData) => Promise<Incident | null>;
  deleteIncident: (id: string) => Promise<void>;
  uploadAttachments: (id: string, files: globalThis.File[]) => Promise<void>;
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
    setError(null);
    try {
      // Use basic parameters to avoid potential parameter conflicts
      const data = await getIncidents({
        format: 'json',
        ordering: '-Date'
      });
      
      setIncidents(data.results || []);
      setError(null);
    } catch (error) {
      console.error("Error loading incidents:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to load incidents";
      if (error && typeof error === 'object') {
        const errorObj = error as { status?: number; response?: { status?: number } };
        const status = errorObj.status || errorObj.response?.status;
        
        if (status === 400) {
          errorMessage = "Solicitud inválida al cargar incidentes";
        } else if (status === 403) {
          errorMessage = "No tiene permisos para ver los incidentes";
        } else if (status === 500) {
          errorMessage = "Error del servidor al cargar incidentes";
        }
      }
      
      setError(errorMessage);
      setIncidents([]); // Set empty array to prevent undefined issues
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncidentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const types = await getIncidentTypes();
      setIncidentTypes(types.results);
      setError(null);
    } catch (error) {
      console.error("Error loading incident types:", error);
      setError("Failed to load incident types");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncident = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const incident = await getIncidentById(id);
      setSelectedIncident(incident);
      setError(null);
    } catch (error) {
      console.error("Error loading incident:", error);
      setError("Failed to load incident");
      setSelectedIncident(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIncidentHandler = useCallback(async (id: string, data: Partial<Incident>) => {
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

  const createIncidentHandler = useCallback(async (data: FormData | IncidentFormData) => {
    setLoading(true);
    try {
      // Using any to match the exact API payload structure as required
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let incidentData: any;
      
      if (data instanceof FormData) {
        // Map form fields to exact API field names as shown in payload example
        const description = (data.get('description') as string)?.trim();
        const notes = (data.get('notes') as string)?.trim();
        
        incidentData = {
          Office: Number(data.get('officeId')) || 0,
          Date: (data.get('date') as string) || '',
          Time: (data.get('time') as string) || '',
          IncidentType: Number(data.get('incidentTypeId')) || 1,
          // Only include Description if it has content
          ...(description && { Description: description }),
          CashLoss: Number(data.get('cashLoss')) || 0,
          MerchandiseLoss: Number(data.get('merchandiseLoss')) || 0,
          OtherLosses: Number(data.get('otherLosses')) || 0,
          // Only include Notes if it has content
          ...(notes && { Notes: notes }),
          Attachments: [],
          Report: null,
          // For FormData, suspects would need to be handled separately as it's complex data
          Suspects: [],
        };
      } else {
        // Use the suspects field directly if it exists, otherwise try to map from selectedSuspects
        let finalSuspects: string[] = [];
        
        if (data.suspects && Array.isArray(data.suspects)) {
          // Use suspects field directly - it's already formatted correctly
          finalSuspects = data.suspects;
        } else if (data.selectedSuspects && Array.isArray(data.selectedSuspects)) {
          // Map selectedSuspects to array of IDs
          finalSuspects = data.selectedSuspects
            ?.map(suspect => suspect.apiId)
            .filter((id): id is string => {
              const isValidId = Boolean(id) && typeof id === 'string' && id.trim() !== '';
              return isValidId;
            }) || [];
        }
        
        incidentData = {
          Date: data.date,
          Time: data.time,
          // Only include Description if it has content
          ...(data.description?.trim() && { Description: data.description.trim() }),
          CashLoss: data.cashLoss || 0,
          MerchandiseLoss: data.merchandiseLoss || 0,
          OtherLosses: data.otherLosses || 0,
          TotalLoss: data.totalLoss || 0, // ¡Este campo faltaba!
          // Only include Notes if it has content  
          ...(data.notes?.trim() && { Notes: data.notes.trim() }),
          Attachments: [],
          Report: null,
          Office: data.officeId,
          IncidentType: data.incidentTypeId,
          // Use the final suspects array
          Suspects: finalSuspects,
        };
      }

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

  const deleteIncidentHandler = useCallback(async (id: string) => {
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

  const uploadAttachments = useCallback(async (id: string, files: globalThis.File[]) => {
    setLoading(true);
    try {
      const response = await uploadIncidentAttachments(id, files);
      // Convert the returned attachments to the File type used in our app
      const attachments = response.attachments.map((att: { url: string }) => ({
        id: Math.floor(Math.random() * 10000),
        url: att.url,
        name: att.url.split("/").pop() || "file",
        contentType: "image/jpeg",
      }));
      // Update the incident with the new attachments
      const updatedIncident = await updateIncident(id, {
        Attachments: attachments
      });
      if (updatedIncident) {
        setIncidents(prev => prev.map(incident => incident.id === id ? updatedIncident : incident));
        setSelectedIncident(prev => (prev && prev.id === id ? updatedIncident : prev));
      }
      setError(null);
    } catch (error) {
      console.error("Error uploading attachments:", error);
      setError("Failed to upload attachments");
    } finally {
      setLoading(false);
    }
  }, []);

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
