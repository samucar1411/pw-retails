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
  return (
    <Select value={period} onValueChange={onPeriodChange}>
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