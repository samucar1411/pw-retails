"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SalesChartFilterProps {
  period: '7d' | '30d' | '90d';
  onPeriodChange: (value: '7d' | '30d' | '90d') => void;
}

export function SalesChartFilter({ period, onPeriodChange }: SalesChartFilterProps) {
  // Función helper para asegurar el tipo correcto
  const handleValueChange = (value: string) => {
    // Verificamos que el valor sea uno de los esperados
    if (value === '7d' || value === '30d' || value === '90d') {
      onPeriodChange(value);
    }
  };

  return (
    <Select
      value={period}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleccionar período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Últimos 7 días</SelectItem>
        <SelectItem value="30d">Últimos 30 días</SelectItem>
        <SelectItem value="90d">Últimos 90 días</SelectItem>
      </SelectContent>
    </Select>
  )
}