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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Loader2,
  Equal
} from "lucide-react";
import { getIncidents } from "@/services/incident-service";

interface HistoricalComparisonProps {
  fromDate?: string;
  toDate?: string;
  officeId?: string;
}

export function HistoricalComparison({ officeId }: HistoricalComparisonProps = {}) {
  const currentYear = new Date().getFullYear();
  const [year1, setYear1] = React.useState(currentYear - 1);
  const [year2, setYear2] = React.useState(currentYear);
  const [year1Count, setYear1Count] = React.useState(0);
  const [year2Count, setYear2Count] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastFetchKey, setLastFetchKey] = React.useState('');

  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

  // Create a cache for historical data
  const dataCache = React.useRef<Map<string, { year1Count: number; year2Count: number }>>(new Map());

  const fetchYear1Data = React.useCallback(async () => {
    try {
      const yearFromDate = `${year1}-01-01`;
      const yearToDate = `${year1}-12-31`;
      
      const filters = {
        fromDate: yearFromDate,
        toDate: yearToDate,
        page_size: 1, // Only need count, not results
        ...(officeId && { Office: officeId })
      };
      
      const response = await getIncidents(filters);
      const count = response.count || 0;
      setYear1Count(count);
      return count;
    } catch (error) {
      console.error(`Error fetching ${year1} data:`, error);
      setYear1Count(0);
      return 0;
    }
  }, [year1, officeId]);

  const fetchYear2Data = React.useCallback(async () => {
    try {
      const yearFromDate = `${year2}-01-01`;
      const yearToDate = `${year2}-12-31`;
      
      const filters = {
        fromDate: yearFromDate,
        toDate: yearToDate,
        page_size: 1, // Only need count, not results
        ...(officeId && { Office: officeId })
      };
      
      const response = await getIncidents(filters);
      const count = response.count || 0;
      setYear2Count(count);
      return count;
    } catch (error) {
      console.error(`Error fetching ${year2} data:`, error);
      setYear2Count(0);
      return 0;
    }
  }, [year2, officeId]);

  const loadData = React.useCallback(async () => {
    // Create a cache key based on parameters
    const cacheKey = `${year1}-${year2}-${officeId}`;
    
    // Check if we already have cached data
    const cachedData = dataCache.current.get(cacheKey);
    if (cachedData && cacheKey === lastFetchKey) {
      setYear1Count(cachedData.year1Count);
      setYear2Count(cachedData.year2Count);
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch each year independently using the service with delay between requests
      const [count1, count2] = await Promise.all([
        fetchYear1Data(),
        new Promise(resolve => setTimeout(resolve, 200)).then(() => fetchYear2Data()) // Small delay
      ]);
      
      // Cache the results
      dataCache.current.set(cacheKey, { year1Count: count1, year2Count: count2 });
      setLastFetchKey(cacheKey);
    } finally {
      setIsLoading(false);
    }
  }, [year1, year2, officeId, fetchYear1Data, fetchYear2Data, lastFetchKey]);

  // Debounce the data loading to avoid excessive calls
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const difference = year2Count - year1Count;
  const percentage = year1Count > 0 ? ((difference / year1Count) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
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
          <Calendar className="h-5 w-5" />
          Comparativo de Incidentes
        </CardTitle>
        <CardDescription>
          Cantidad de incidentes por año
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Selectors */}
        <div className="flex items-center justify-center gap-4">
          <Select value={year1.toString()} onValueChange={(value) => setYear1(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()} disabled={year === year2}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-muted-foreground">VS</span>
          
          <Select value={year2.toString()} onValueChange={(value) => setYear2(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()} disabled={year === year1}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded border bg-muted/20">
            <div className="text-2xl font-bold text-muted-foreground">{year1}</div>
            <div className="text-3xl font-bold mt-1">{year1Count}</div>
            <div className="text-sm text-muted-foreground">incidentes</div>
          </div>
          
          <div className="text-center p-4 rounded border bg-primary/5">
            <div className="text-2xl font-bold text-primary">{year2}</div>
            <div className="text-3xl font-bold mt-1">{year2Count}</div>
            <div className="text-sm text-muted-foreground">incidentes</div>
          </div>
        </div>

        {/* Comparison */}
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
      </CardContent>
    </Card>
  );
} 