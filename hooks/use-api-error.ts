import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ApiErrorState {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
}

export function useApiError() {
  const [error, setError] = useState<ApiErrorState | null>(null);

  const handleError = useCallback((err: unknown, customMessage?: string) => {
    // Default error message
    let errorMessage = customMessage || 'Ha ocurrido un error en la solicitud.';
    let errorCode: string | number | undefined = undefined;
    let errorDetails: Record<string, any> | undefined = undefined;

    // Extract error information based on error type
    if (err instanceof Error) {
      errorMessage = err.message;
      
      // Handle Axios errors which typically have response data
      if ('response' in err && err.response) {
        const response = (err as any).response;
        errorCode = response.status;
        
        // Extract detailed error information from response
        if (response.data) {
          if (typeof response.data === 'string') {
            errorMessage = response.data;
          } else if (response.data.message) {
            errorMessage = response.data.message;
          } else if (response.data.error) {
            errorMessage = response.data.error;
          }
          
          errorDetails = response.data;
        }
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err && typeof err === 'object') {
      // Handle plain objects with error information
      const errorObj = err as Record<string, any>;
      if (errorObj.message) {
        errorMessage = errorObj.message;
      }
      if (errorObj.code) {
        errorCode = errorObj.code;
      }
      errorDetails = errorObj;
    }

    // Set the error state
    const errorState: ApiErrorState = {
      message: errorMessage,
      code: errorCode,
      details: errorDetails
    };
    
    setError(errorState);
    
    // Optionally show a toast notification
    toast.error(errorMessage);
    
    // Also log to console for debugging
    console.error('API Error:', errorState);
    
    return errorState;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    isError: error !== null
  };
}
