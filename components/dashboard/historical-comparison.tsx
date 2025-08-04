"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon,
  Loader2,
  Equal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getIncidents } from "@/services/incident-service";

interface HistoricalComparisonProps {
  officeId?: string;
}

interface Period {
  fromDate: string;
  toDate: string;
  label: string;
}

const COMPARISON_OPTIONS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '14', label: 'Últimos 14 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: 'custom', label: 'Período personalizado' }
];

function calculatePeriodFromDays(days: number): Period {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days + 1);
  
  return {
    fromDate: fromDate.toISOString().slice(0, 10),
    toDate: toDate.toISOString().slice(0, 10),
    label: `Últimos ${days} días`
  };
}

function calculatePreviousPeriod(fromDate: string, toDate: string): Period | null {
  // Return null if dates are empty or invalid
  if (!fromDate || !toDate || fromDate.trim() === '' || toDate.trim() === '') {
    return null;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  // Check if dates are valid
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return null;
  }
  
  // Calculate period duration in days
  const periodDuration = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate previous period dates
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - periodDuration + 1);
  
  return {
    fromDate: prevFrom.toISOString().slice(0, 10),
    toDate: prevTo.toISOString().slice(0, 10),
    label: `Período anterior (${periodDuration} días)`
  };
}

function formatPeriodLabel(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  const fromFormatted = from.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const toFormatted = to.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  
  return `${fromFormatted} - ${toFormatted}`;
}

export function HistoricalComparison({ officeId }: HistoricalComparisonProps = {}) {
  const [currentPeriodCount, setCurrentPeriodCount] = React.useState(0);
  const [previousPeriodCount, setPreviousPeriodCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasPreviousPeriod, setHasPreviousPeriod] = React.useState(false);
  
  // Internal state for period selection
  const [selectedOption, setSelectedOption] = React.useState('30');
  const [customFromDate, setCustomFromDate] = React.useState<Date>();
  const [customToDate, setCustomToDate] = React.useState<Date>();
  const [isCustomPeriod, setIsCustomPeriod] = React.useState(false);

  // Determine which dates to use (only internal selection, no dashboard filters)
  const fromDate = React.useMemo(() => {
    if (isCustomPeriod && customFromDate) {
      return customFromDate.toISOString().slice(0, 10);
    }
    if (selectedOption !== 'custom') {
      return calculatePeriodFromDays(parseInt(selectedOption)).fromDate;
    }
    return '';
  }, [isCustomPeriod, customFromDate, selectedOption]);

  const toDate = React.useMemo(() => {
    if (isCustomPeriod && customToDate) {
      return customToDate.toISOString().slice(0, 10);
    }
    if (selectedOption !== 'custom') {
      return calculatePeriodFromDays(parseInt(selectedOption)).toDate;
    }
    return '';
  }, [isCustomPeriod, customToDate, selectedOption]);

  // Calculate previous period
  const previousPeriod = React.useMemo(() => {
    return calculatePreviousPeriod(fromDate || '', toDate || '');
  }, [fromDate, toDate]);

  const fetchCurrentPeriodData = React.useCallback(async () => {
    if (!fromDate || !toDate || fromDate.trim() === '' || toDate.trim() === '') {
      setCurrentPeriodCount(0);
      return 0;
    }

    try {
      const filters = {
        fromDate,
        toDate,
        page_size: 1, // Only need count, not results
        ...(officeId && { Office: officeId })
      };
      
      const response = await getIncidents(filters);
      const count = response.count || 0;
      setCurrentPeriodCount(count);
      return count;
    } catch (error) {
      console.error('Error fetching current period data:', error);
      setCurrentPeriodCount(0);
      return 0;
    }
  }, [fromDate, toDate, officeId]);

  const fetchPreviousPeriodData = React.useCallback(async () => {
    if (!previousPeriod) {
      setPreviousPeriodCount(0);
      setHasPreviousPeriod(false);
      return 0;
    }

    try {
      const filters = {
        fromDate: previousPeriod.fromDate,
        toDate: previousPeriod.toDate,
        page_size: 1, // Only need count, not results
        ...(officeId && { Office: officeId })
      };
      
      const response = await getIncidents(filters);
      const count = response.count || 0;
      setPreviousPeriodCount(count);
      setHasPreviousPeriod(true);
      return count;
    } catch (error) {
      console.error('Error fetching previous period data:', error);
      setPreviousPeriodCount(0);
      setHasPreviousPeriod(false);
      return 0;
    }
  }, [previousPeriod, officeId]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch both periods in parallel
      await Promise.all([
        fetchCurrentPeriodData(),
        fetchPreviousPeriodData()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentPeriodData, fetchPreviousPeriodData]);

  // Load data when filters change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Handle option selection
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value === 'custom') {
      setIsCustomPeriod(true);
    } else {
      setIsCustomPeriod(false);
      setCustomFromDate(undefined);
      setCustomToDate(undefined);
    }
  };

  const difference = currentPeriodCount - previousPeriodCount;
  const percentage = previousPeriodCount > 0 ? ((difference / previousPeriodCount) * 100) : 0;

  // Determine if we have valid date filters
  const hasValidDateFilters = fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Comparativo de Incidentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Comparativo de Incidentes
        </CardTitle>
        <CardDescription>
          Compara incidentes entre períodos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Selection Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Select value={selectedOption} onValueChange={handleOptionChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {isCustomPeriod && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customFromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customFromDate ? format(customFromDate, "dd/MM/yyyy") : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customFromDate}
                    onSelect={(date) => setCustomFromDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">hasta</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customToDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customToDate ? format(customToDate, "dd/MM/yyyy") : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customToDate}
                    onSelect={setCustomToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {!hasValidDateFilters ? (
          <div className="text-center p-6 text-muted-foreground">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Selecciona un período para ver la comparación</p>
          </div>
        ) : (
          <>
            {/* Period Display */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Período actual</div>
                <div className="font-medium">{formatPeriodLabel(fromDate, toDate)}</div>
              </div>
              
              <span className="text-muted-foreground">VS</span>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Período anterior</div>
                <div className="font-medium">
                  {previousPeriod ? formatPeriodLabel(previousPeriod.fromDate, previousPeriod.toDate) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded border bg-primary/5">
                <div className="text-sm text-muted-foreground">Período actual</div>
                <div className="text-3xl font-bold mt-1 text-primary">{currentPeriodCount}</div>
                <div className="text-sm text-muted-foreground">incidentes</div>
              </div>
              
              <div className="text-center p-4 rounded border bg-muted/20">
                <div className="text-sm text-muted-foreground">Período anterior</div>
                <div className="text-3xl font-bold mt-1 text-muted-foreground">
                  {hasPreviousPeriod ? previousPeriodCount : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">incidentes</div>
              </div>
            </div>

            {/* Comparison */}
            {hasPreviousPeriod && (
              <div className="text-center p-3 rounded border bg-card">
                <div className="flex items-center justify-center gap-2">
                  {difference === 0 ? (
                    <Equal className="h-5 w-5 text-muted-foreground" />
                  ) : difference > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  )}
                  
                  <span className="text-lg font-semibold">
                    {difference === 0 ? 'Igual cantidad' : 
                     difference > 0 ? `+${difference} incidentes` : 
                     `${difference} incidentes`}
                  </span>
                  
                  {difference !== 0 && (
                    <span className={`text-sm px-2 py-1 rounded ${
                      difference > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {difference > 0 ? '+' : ''}{percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {!hasPreviousPeriod && (
              <div className="text-center p-3 rounded border bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  No hay datos del período anterior para comparar
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 