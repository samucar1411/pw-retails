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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getIncidents } from "@/services/incident-service";

interface HistoricalComparisonProps {
  officeId?: string;
}

function formatPeriodLabel(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  const fromFormatted = from.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const toFormatted = to.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  
  return `${fromFormatted} - ${toFormatted}`;
}

export function HistoricalComparison({ officeId }: HistoricalComparisonProps = {}) {
  const [periodACount, setPeriodACount] = React.useState(0);
  const [periodBCount, setPeriodBCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Period A (first period)
  const [periodAFromDate, setPeriodAFromDate] = React.useState<Date>();
  const [periodAToDate, setPeriodAToDate] = React.useState<Date>();
  
  // Period B (second period)
  const [periodBFromDate, setPeriodBFromDate] = React.useState<Date>();
  const [periodBToDate, setPeriodBToDate] = React.useState<Date>();

  const fetchPeriodData = React.useCallback(async (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate || fromDate.trim() === '' || toDate.trim() === '') {
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
      return response.count || 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 0;
    }
  }, [officeId]);

  const loadData = React.useCallback(async () => {
    const periodAFromStr = periodAFromDate?.toISOString().slice(0, 10);
    const periodAToStr = periodAToDate?.toISOString().slice(0, 10);
    const periodBFromStr = periodBFromDate?.toISOString().slice(0, 10);
    const periodBToStr = periodBToDate?.toISOString().slice(0, 10);
    
    // Only load if we have both periods defined
    if (!periodAFromStr || !periodAToStr || !periodBFromStr || !periodBToStr) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch both periods in parallel
      const [countA, countB] = await Promise.all([
        fetchPeriodData(periodAFromStr, periodAToStr),
        fetchPeriodData(periodBFromStr, periodBToStr)
      ]);
      
      setPeriodACount(countA);
      setPeriodBCount(countB);
    } finally {
      setIsLoading(false);
    }
  }, [periodAFromDate, periodAToDate, periodBFromDate, periodBToDate, fetchPeriodData]);

  // Load data when periods change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const difference = periodACount - periodBCount;
  const bothPeriodsSet = periodAFromDate && periodAToDate && periodBFromDate && periodBToDate;

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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Comparativo de Períodos
        </CardTitle>
        <CardDescription>
          Compara la cantidad de incidentes entre dos períodos específicos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Period Selection */}
        <div className="space-y-6">
          {/* Period A */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Período A</h3>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !periodAFromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodAFromDate ? format(periodAFromDate, "dd/MM/yyyy") : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodAFromDate}
                    onSelect={setPeriodAFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-sm text-muted-foreground">hasta</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !periodAToDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodAToDate ? format(periodAToDate, "dd/MM/yyyy") : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodAToDate}
                    onSelect={setPeriodAToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Period B */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-600">Período B</h3>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !periodBFromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodBFromDate ? format(periodBFromDate, "dd/MM/yyyy") : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodBFromDate}
                    onSelect={setPeriodBFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-sm text-muted-foreground">hasta</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !periodBToDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodBToDate ? format(periodBToDate, "dd/MM/yyyy") : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodBToDate}
                    onSelect={setPeriodBToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {!bothPeriodsSet ? (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">Configura ambos períodos</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona las fechas de inicio y fin para ambos períodos A y B
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Comparison Display */}
            <div className="grid grid-cols-2 gap-4">
              {/* Period A */}
              <div className="relative p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="text-center">
                  <div className="text-sm font-medium text-primary/70 uppercase tracking-wide mb-1">
                    Período A
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {periodACount}
                  </div>
                  <div className="text-sm text-primary/70 mb-2">
                    {periodACount === 1 ? 'incidente' : 'incidentes'}
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-primary/20 pt-2">
                    {periodAFromDate && periodAToDate ? 
                      formatPeriodLabel(periodAFromDate.toISOString().slice(0, 10), periodAToDate.toISOString().slice(0, 10)) 
                      : 'Sin fechas'
                    }
                  </div>
                </div>
              </div>
              
              {/* Period B */}
              <div className="relative p-6 rounded-lg border-2 border-orange-200 bg-orange-50">
                <div className="text-center">
                  <div className="text-sm font-medium text-orange-700 uppercase tracking-wide mb-1">
                    Período B
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {periodBCount}
                  </div>
                  <div className="text-sm text-orange-700 mb-2">
                    {periodBCount === 1 ? 'incidente' : 'incidentes'}
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-orange-200 pt-2">
                    {periodBFromDate && periodBToDate ? 
                      formatPeriodLabel(periodBFromDate.toISOString().slice(0, 10), periodBToDate.toISOString().slice(0, 10))
                      : 'Sin fechas'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Comparison Result */}
            <div className="relative">
              <div className={`p-6 rounded-lg border-2 text-center ${
                difference === 0 
                  ? 'border-blue-200 bg-blue-50' 
                  : difference > 0 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  {difference === 0 ? (
                    <>
                      <Equal className="h-8 w-8 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        Misma cantidad de incidentes
                      </span>
                    </>
                  ) : difference > 0 ? (
                    <>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        Período A tuvo {Math.abs(difference)} incidente{Math.abs(difference) !== 1 ? 's' : ''} más
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-8 w-8 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-600">
                        Período B tuvo {Math.abs(difference)} incidente{Math.abs(difference) !== 1 ? 's' : ''} más
                      </span>
                    </>
                  )}
                </div>
                
                {difference === 0 && (
                  <div className="text-sm text-blue-600/70 mt-2">
                    Ambos períodos tuvieron exactamente {periodACount} incidente{periodACount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 