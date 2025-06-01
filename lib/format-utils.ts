/**
 * Helper to parse numeric string values
 */
export const parseNumeric = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
};

/**
 * Format currency with proper symbol and thousands separators
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  });
};
