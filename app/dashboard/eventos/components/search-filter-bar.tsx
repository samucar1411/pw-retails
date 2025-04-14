import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "visor-ui";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  officeFilter: string;
  onOfficeFilterChange: (value: string) => void;
  deviceFilter: string;
  onDeviceFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  offices: string[];
  devices: string[];
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  officeFilter,
  onOfficeFilterChange,
  deviceFilter,
  onDeviceFilterChange,
  dateFilter,
  onDateFilterChange,
  offices,
  devices,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={officeFilter} onValueChange={onOfficeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por oficina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las oficinas</SelectItem>
            {offices.map((office) => (
              <SelectItem key={office} value={office}>
                {office}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deviceFilter} onValueChange={onDeviceFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por dispositivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los dispositivos</SelectItem>
            {devices.map((device) => (
              <SelectItem key={device} value={device}>
                {device}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fechas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
