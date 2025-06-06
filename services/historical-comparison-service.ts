import { getIncidents } from './incident-service';
import { Incident } from '@/types/incident';

export interface HistoricalComparison {
  currentPeriod: {
    incidents: number;
    totalLoss: number;
    cashLoss: number;
    merchandiseLoss: number;
    period: string;
    fromDate: string;
    toDate: string;
  };
  previousPeriod: {
    incidents: number;
    totalLoss: number;
    cashLoss: number;
    merchandiseLoss: number;
    period: string;
    fromDate: string;
    toDate: string;
  };
  variation: {
    incidents: number;
    totalLoss: number;
    cashLoss: number;
    merchandiseLoss: number;
    incidentsPercentage: number;
    totalLossPercentage: number;
  };
}

function parseNumeric(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  
  const numericString = value.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

function calculatePeriodStats(incidents: Incident[]) {
  const stats = {
    incidents: incidents.length,
    totalLoss: 0,
    cashLoss: 0,
    merchandiseLoss: 0,
  };

  incidents.forEach(incident => {
    const cashLoss = parseNumeric(incident.CashLoss);
    const merchandiseLoss = parseNumeric(incident.MerchandiseLoss);
    const otherLosses = parseNumeric(incident.OtherLosses);
    
    stats.cashLoss += cashLoss;
    stats.merchandiseLoss += merchandiseLoss;
    stats.totalLoss += cashLoss + merchandiseLoss + otherLosses;
  });

  return stats;
}

function calculatePreviousPeriod(fromDate: string, toDate: string): { prevFrom: string; prevTo: string } | null {
  if (!fromDate || !toDate) return null;

  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  
  // Calculate period duration
  const periodDuration = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate previous period dates
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - periodDuration + 1);
  
  return {
    prevFrom: prevFrom.toISOString().slice(0, 10),
    prevTo: prevTo.toISOString().slice(0, 10)
  };
}

function calculateYearOverYearPeriod(fromDate: string, toDate: string): { prevFrom: string; prevTo: string } | null {
  if (!fromDate || !toDate) {
    // If no dates provided, compare current year vs previous year
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    return {
      prevFrom: `${previousYear}-01-01`,
      prevTo: `${previousYear}-12-31`
    };
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  
  // Calculate same period from previous year
  const prevFrom = new Date(from);
  prevFrom.setFullYear(prevFrom.getFullYear() - 1);
  
  const prevTo = new Date(to);
  prevTo.setFullYear(prevTo.getFullYear() - 1);
  
  return {
    prevFrom: prevFrom.toISOString().slice(0, 10),
    prevTo: prevTo.toISOString().slice(0, 10)
  };
}

async function fetchPeriodDataEfficiently(
  fromDate: string,
  toDate: string,
  officeId?: string
): Promise<ReturnType<typeof calculatePeriodStats>> {
  let allIncidents: Incident[] = [];
  let page = 1;
  const maxPages = 5; // Limit to 5 pages maximum (50 incidents)
  
  try {
    while (page <= maxPages) {
      const response = await getIncidents({
        fromDate,
        toDate,
        Office: officeId,
        page,
        page_size: 10 // Fixed page size from API
      });
      
      if (response.results && response.results.length > 0) {
        allIncidents = [...allIncidents, ...response.results];
      }
      
      // Stop if no more data or we got less than 10 (indicating last page)
      if (!response.next || response.results.length < 10) {
        break;
      }
      
      page++;
    }
    
    return calculatePeriodStats(allIncidents);
  } catch (error) {
    console.error('Error fetching period data efficiently:', error);
    // Return empty stats on error
    return {
      incidents: 0,
      totalLoss: 0,
      cashLoss: 0,
      merchandiseLoss: 0,
    };
  }
}

function formatPeriodLabel(fromDate: string, toDate: string): string {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  const formatter = new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  if (from.getTime() === to.getTime()) {
    return formatter.format(from);
  }
  
  // Same month and year
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()}-${to.getDate()} ${formatter.format(from).split(' ').slice(1).join(' ')}`;
  }
  
  // Same year
  if (from.getFullYear() === to.getFullYear()) {
    const fromMonth = from.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    const toMonth = to.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    return `${fromMonth} - ${toMonth} ${from.getFullYear()}`;
  }
  
  // Different years
  return `${formatter.format(from)} - ${formatter.format(to)}`;
}

export async function getHistoricalComparison(
  fromDate: string,
  toDate: string,
  officeId?: string,
  comparisonType: 'previous' | 'yearOverYear' = 'yearOverYear',
  currentPeriodData?: Incident[] // Accept current period data to avoid duplicate calls
): Promise<HistoricalComparison | null> {
  try {
    // Calculate previous period dates
    const previousPeriod = comparisonType === 'yearOverYear' 
      ? calculateYearOverYearPeriod(fromDate, toDate)
      : calculatePreviousPeriod(fromDate, toDate);
    
    if (!previousPeriod) {
      return null;
    }

    // Calculate current period stats
    const currentStats = currentPeriodData && currentPeriodData.length > 0
      ? calculatePeriodStats(currentPeriodData)
      : await fetchPeriodDataEfficiently(fromDate, toDate, officeId);

    // Fetch previous period data efficiently (multiple small calls if needed)
    const previousStats = await fetchPeriodDataEfficiently(
      previousPeriod.prevFrom,
      previousPeriod.prevTo,
      officeId
    );

    // Calculate variations
    const incidentsVariation = currentStats.incidents - previousStats.incidents;
    const totalLossVariation = currentStats.totalLoss - previousStats.totalLoss;
    const cashLossVariation = currentStats.cashLoss - previousStats.cashLoss;
    const merchandiseLossVariation = currentStats.merchandiseLoss - previousStats.merchandiseLoss;

    const incidentsPercentage = previousStats.incidents > 0 
      ? ((incidentsVariation / previousStats.incidents) * 100)
      : (currentStats.incidents > 0 ? 100 : 0);

    const totalLossPercentage = previousStats.totalLoss > 0 
      ? ((totalLossVariation / previousStats.totalLoss) * 100)
      : (currentStats.totalLoss > 0 ? 100 : 0);

    return {
      currentPeriod: {
        ...currentStats,
        period: formatPeriodLabel(fromDate, toDate),
        fromDate,
        toDate
      },
      previousPeriod: {
        ...previousStats,
        period: formatPeriodLabel(previousPeriod.prevFrom, previousPeriod.prevTo),
        fromDate: previousPeriod.prevFrom,
        toDate: previousPeriod.prevTo
      },
      variation: {
        incidents: incidentsVariation,
        totalLoss: totalLossVariation,
        cashLoss: cashLossVariation,
        merchandiseLoss: merchandiseLossVariation,
        incidentsPercentage,
        totalLossPercentage
      }
    };
  } catch (error) {
    console.error('Error fetching historical comparison:', error);
    return null;
  }
} 