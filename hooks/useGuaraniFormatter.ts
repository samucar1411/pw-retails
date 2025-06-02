import { useCallback } from 'react';

export function useGuaraniFormatter() {
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatNumber = useCallback((value: number): string => {
    return new Intl.NumberFormat('es-PY').format(value);
  }, []);

  const parseNumber = useCallback((value: string): number => {
    // Remove currency symbols and spaces, replace comma with dot
    const cleanValue = value
      .replace(/[₲\s]/g, '') // Remove guarani symbol and spaces
      .replace(/\./g, '') // Remove thousand separators
      .replace(/,/g, '.'); // Replace comma decimal separator with dot
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  const formatInputValue = useCallback((value: number): string => {
    if (value === 0) return '';
    return formatNumber(value);
  }, [formatNumber]);

  return {
    formatCurrency,
    formatNumber,
    parseNumber,
    formatInputValue,
  };
} 