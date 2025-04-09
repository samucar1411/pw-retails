'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Company } from '@/types/company';
import { getCompanies, getCompanyById, updateCompany, createCompany as createCompanyService, deleteCompany as deleteCompanyService } from '@/services/company-service';

type CompanyState = {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
};

type CompanyAction =
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_SELECTED_COMPANY'; payload: Company | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'DELETE_COMPANY'; payload: string }
  | { type: 'ADD_COMPANY'; payload: Company };

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  loading: false,
  error: null,
};

const CompanyContext = createContext<{
  state: CompanyState;
  loadCompanies: () => Promise<void>;
  loadCompany: (id: string) => Promise<void>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company | null>;
  createCompany: (data: FormData) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
} | null>(null);

function companyReducer(state: CompanyState, action: CompanyAction): CompanyState {
  switch (action.type) {
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload };
    case 'SET_SELECTED_COMPANY':
      return { ...state, selectedCompany: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? action.payload : company
        ),
        selectedCompany: state.selectedCompany?.id === action.payload.id
          ? action.payload
          : state.selectedCompany,
      };
    case 'DELETE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter(company => company.id !== action.payload),
        selectedCompany: state.selectedCompany?.id === action.payload
          ? null
          : state.selectedCompany,
      };
    case 'ADD_COMPANY':
      return {
        ...state,
        companies: [...state.companies, action.payload],
      };
    default:
      return state;
  }
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(companyReducer, initialState);

  const loadCompanies = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const companies = await getCompanies();
      dispatch({ type: 'SET_COMPANIES', payload: companies });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load companies' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadCompany = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const company = await getCompanyById(id);
      if (company) {
        dispatch({ type: 'SET_SELECTED_COMPANY', payload: company });
        dispatch({ type: 'SET_ERROR', payload: null });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Company not found' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load company' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const handleUpdateCompany = useCallback(async (id: string, data: Partial<Company>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updated = await updateCompany(id, data);
      if (updated) {
        dispatch({ type: 'UPDATE_COMPANY', payload: { ...updated, id } });
        if (state.selectedCompany?.id === id) {
          dispatch({ type: 'SET_SELECTED_COMPANY', payload: { ...updated, id } });
        }
        dispatch({ type: 'SET_ERROR', payload: null });
        return updated;
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update company' });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update company' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.selectedCompany?.id]);

  const handleCreateCompany = useCallback(async (data: FormData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const created = await createCompanyService(data);
      if (created) {
        dispatch({ type: 'ADD_COMPANY', payload: created });
        dispatch({ type: 'SET_ERROR', payload: null });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create company' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create company' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const handleDeleteCompany = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const success = await deleteCompanyService(id);
      if (success) {
        dispatch({ type: 'DELETE_COMPANY', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete company' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete company' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        state,
        loadCompanies,
        loadCompany,
        updateCompany: handleUpdateCompany,
        createCompany: handleCreateCompany,
        deleteCompany: handleDeleteCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 