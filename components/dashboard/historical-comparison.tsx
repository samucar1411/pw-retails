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
  BarChart3,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface HistoricalComparisonProps {
  officeId?: string;
}

interface MonthlyData {
  month: string;
  monthIndex: number;
  details: Array<{
    type: string;
    year1: number;
    year2: number;
  }>;
  [key: string]: string | number | Array<{ type: string; year1: number; year2: number; }>;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const monthMapping: { [key: string]: string } = {
  'January': 'Enero',
  'February': 'Febrero', 
  'March': 'Marzo',
  'April': 'Abril',
  'May': 'Mayo',
  'June': 'Junio',
  'July': 'Julio',
  'August': 'Agosto',
  'September': 'Septiembre',
  'October': 'Octubre',
  'November': 'Noviembre',
  'December': 'Diciembre'
};

const getCurrentYear = () => new Date().getFullYear();

interface Incident {
  Date?: string;
  IncidentType?: number;
}

interface PivotData {
  month: string;
  type: string;
  year1: number;
  year2: number;
}

// Fallback function to process regular incidents into pivot format
const processIncidentsForPivot = (incidents: Incident[], year1: number, year2: number): PivotData[] => {
  const pivotData: PivotData[] = [];
  const monthlyStats = new Map<string, Map<string, { year1: number; year2: number }>>();
  
  incidents.forEach((incident) => {
    if (!incident.Date || !incident.IncidentType) return;
    
    const date = new Date(incident.Date);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const incidentTypeName = `Tipo ${incident.IncidentType}`; // Simplified type name
    
    // Only process data for the requested years
    if (year !== year1 && year !== year2) return;
    
    const key = `${month}-${incidentTypeName}`;
    if (!monthlyStats.has(key)) {
      monthlyStats.set(key, new Map([
        ['year1', { year1: 0, year2: 0 }],
        ['year2', { year1: 0, year2: 0 }]
      ]));
    }
    
    const stats = monthlyStats.get(key)!.get('year1')!;
    if (year === year1) {
      stats.year1++;
    } else if (year === year2) {
      stats.year2++;
    }
  });
  
  // Convert map to array format expected by the component
  monthlyStats.forEach((typeStats, key) => {
    const [month, type] = key.split('-');
    const stats = typeStats.get('year1')!;
    
    pivotData.push({
      month,
      type,
      year1: stats.year1,
      year2: stats.year2
    });
  });
  
  return pivotData;
};

export function HistoricalComparison({ officeId }: HistoricalComparisonProps = {}) {
  const currentYear = getCurrentYear();
  const router = useRouter();
  const [year1, setYear1] = React.useState(currentYear);
  const [year2, setYear2] = React.useState(currentYear - 1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [chartData, setChartData] = React.useState<MonthlyData[]>([]);
  
  // Generate year options (current year and previous 5 years)
  const yearOptions = React.useMemo(() => {
    const years = [];
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);
  

  // Load data using the new pivot endpoint
  const loadData = React.useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    
    // Build the URL with parameters
    const params = new URLSearchParams({
      year1: year1.toString(),
      year2: year2.toString()
    });
    
    // Add Office parameter if officeId is provided
    if (officeId) {
      params.append('Office', officeId);
    }
    
    try {
      let data;
      
      // Try the pivot endpoint first, fallback to regular incidents if not available
      try {
        const response = await api.get(`/incidents_pivot_by_type/?${params.toString()}`, {
          signal: controller.signal
        });
        data = response.data;
      } catch {
        console.warn('Pivot endpoint not available, using fallback approach');
        // Fallback: Get regular incidents and process them client-side
        const response = await api.get(`/incidents/?${params.toString()}&page_size=1000`, {
          signal: controller.signal
        });
        data = processIncidentsForPivot(response.data?.results || [], year1, year2);
      }
      
      // Initialize data structure for all months
      const monthlyData: MonthlyData[] = monthNames.map((month, index) => ({
        month: month,
        monthIndex: index + 1,
        details: [],
        [year1.toString()]: 0,
        [year2.toString()]: 0
      }));
      
      // Process the pivot API response
      // Structure: [{month: "January", type: "Hurto", year1: 2, year2: 5, defs: {...}}, ...]
      if (data && Array.isArray(data)) {
        // Group data by month and collect all details
        const monthDetails: { [month: string]: { 
          year1: number; 
          year2: number; 
          types: Array<{type: string, year1: number, year2: number}>
        } } = {};
        
        data.forEach((item: { month: string; type: string; year1: number; year2: number; }) => {
          const englishMonth = item.month;
          const spanishMonth = monthMapping[englishMonth];
          const year1Count = item.year1 || 0;
          const year2Count = item.year2 || 0;
          const incidentType = item.type;
          
          if (!spanishMonth) return; // Skip if month mapping not found
          
          if (!monthDetails[spanishMonth]) {
            monthDetails[spanishMonth] = { year1: 0, year2: 0, types: [] };
          }
          
          monthDetails[spanishMonth].year1 += year1Count;
          monthDetails[spanishMonth].year2 += year2Count;
          monthDetails[spanishMonth].types.push({
            type: incidentType,
            year1: year1Count,
            year2: year2Count
          });
        });
        
        // Map the details to our chart data structure
        monthlyData.forEach((monthData) => {
          const details = monthDetails[monthData.month];
          
          if (details) {
            monthData[year1.toString()] = details.year1;
            monthData[year2.toString()] = details.year2;
            monthData.details = details.types;
          }
        });
      }
      
      setChartData(monthlyData);
    } catch (error: unknown) {
      // Don't show error if request was aborted
      if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
        console.error('Error loading pivot data:', {
          error,
          url: `/incidents_pivot_by_type/?${params.toString()}`,
          params: Object.fromEntries(params.entries()),
          errorData: error && typeof error === 'object' && 'data' in error ? error.data : undefined,
          errorStatus: error && typeof error === 'object' && 'status' in error ? error.status : undefined,
          errorMessage: error && typeof error === 'object' && 'message' in error ? error.message : 'Unknown error'
        });
        // Fallback: create empty data structure
        const emptyData = monthNames.map((month, index) => ({
          month: month,
          monthIndex: index + 1,
          details: [],
          [year1.toString()]: 0,
          [year2.toString()]: 0
        }));
        setChartData(emptyData);
      }
    } finally {
      setIsLoading(false);
    }
    
    return controller;
  }, [year1, year2, officeId]);

  // Load data when years change with optimized debouncing
  React.useEffect(() => {
    let controller: AbortController | null = null;
    
    const timeoutId = setTimeout(async () => {
      controller = await loadData();
    }, 500); // Increased debounce to 500ms

    return () => {
      clearTimeout(timeoutId);
      if (controller) {
        controller.abort();
      }
    };
  }, [year1, year2, officeId, loadData]);

  // Memoize chart data to prevent unnecessary re-renders
  const memoizedChartData = React.useMemo(() => chartData, [chartData]);

  // Handle bar click to navigate to incidents list
  const handleBarClick = React.useCallback((data: { payload?: MonthlyData; dataKey?: string; }) => {
    if (!data || !data.payload) return;
    
    const monthData = data.payload as MonthlyData;
    const clickedYear = data.dataKey;
    
    // Build URL with filters
    const params = new URLSearchParams();
    params.set('year', clickedYear || '');
    params.set('month', monthData.monthIndex.toString());
    
    if (officeId) {
      params.set('Office', officeId);
    }
    
    router.push(`/dashboard/incidentes?${params.toString()}`);
  }, [router, officeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparativo de Períodos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
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
          <BarChart3 className="h-5 w-5 text-primary" />
          Comparativo de Períodos
        </CardTitle>
        <CardDescription>
          Comparación mensual de incidentes entre dos años
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Year Selection Controls */}
        <div className="flex items-center gap-4 flex-wrap px-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Año 1:</label>
            <Select value={year1.toString()} onValueChange={(value) => setYear1(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Año 2:</label>
            <Select value={year2.toString()} onValueChange={(value) => setYear2(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={memoizedChartData}
              margin={{
                top: 20,
                right: 5,
                left: -10,
                bottom: 40,
              }}
              barCategoryGap="5%"
              maxBarSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 10 }}
                width={35}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const monthData = payload[0]?.payload as MonthlyData;
                    return (
                      <div className="rounded-lg border bg-background p-4 shadow-lg max-w-xs">
                        <p className="text-sm font-semibold mb-3 text-center">{label}</p>
                        
                        {/* Year totals */}
                        <div className="space-y-2 mb-3">
                          {payload.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium">
                                  {item.dataKey}:
                                </span>
                              </div>
                              <span className="text-sm font-bold">
                                {item.value} incidentes
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Incident type breakdown */}
                        {monthData?.details && monthData.details.length > 0 && (
                          <>
                            <hr className="my-2" />
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Desglose por tipo:</p>
                            <div className="space-y-1">
                              {monthData.details.map((detail, index) => (
                                <div key={index} className="text-xs">
                                  <div className="font-medium">{detail.type}</div>
                                  <div className="flex justify-between text-muted-foreground ml-2">
                                    <span>{year1}: {detail.year1}</span>
                                    <span>{year2}: {detail.year2}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 text-center">
                              Click para ver incidentes
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '5px', paddingBottom: '0px' }}
                iconType="rect"
              />
              <Bar 
                dataKey={year1.toString()} 
                fill="hsl(var(--primary))" 
                name={`Año ${year1}`}
                radius={[2, 2, 0, 0]}
                onClick={handleBarClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              <Bar 
                dataKey={year2.toString()} 
                fill="hsl(var(--secondary-foreground))" 
                name={`Año ${year2}`}
                radius={[2, 2, 0, 0]}
                onClick={handleBarClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 -mt-6 px-6">
          <div className="p-4 rounded-lg border bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold">Año {year1}</h3>
            </div>
            <div className="text-2xl font-bold text-primary">
              {chartData.reduce((sum, item) => sum + (item[year1.toString()] as number), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total incidentes</div>
          </div>

          <div className="p-4 rounded-lg border bg-secondary/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-secondary-foreground" />
              <h3 className="text-sm font-semibold">Año {year2}</h3>
            </div>
            <div className="text-2xl font-bold text-secondary-foreground">
              {chartData.reduce((sum, item) => sum + (item[year2.toString()] as number), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total incidentes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}