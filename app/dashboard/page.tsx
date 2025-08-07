"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { withErrorBoundary } from "@/components/error-boundary";

// Import all the new filtering components
import { FiltersBar } from "@/components/dashboard/filters-bar";
import { KpiTotalIncidents } from "@/components/dashboard/kpi-total-incidents";
import { KpiSuspectsIdentified } from "@/components/dashboard/kpi-suspects-identified";
import { KpiSuspectsNotIdentified } from "@/components/dashboard/kpi-suspects-not-identified";
import { KpiBranches24h } from "@/components/dashboard/kpi-branches-24h";
import { RecentIncidentsTable } from "@/components/dashboard/recent-incidents-table";
import { IncidentMap } from "@/components/dashboard/incident-map";
import { IncidentDistributionChart } from "@/components/dashboard/incident-distribution-chart";
import { EconomicBarChart } from "@/components/dashboard/economic-bar-chart";
import { OfficeRanking } from "@/components/dashboard/office-ranking";
import { HistoricalComparison } from "@/components/dashboard/historical-comparison";
import { TopRepeatSuspects } from "@/components/dashboard/top-repeat-suspects";

function DashboardPage() {
  // Initialize with empty filters by default (no date restrictions)
  const getDefaultDates = React.useCallback(() => {
    return {
      fromDate: "",
      toDate: "",
      officeId: "",
    };
  }, []);

  const [filters, setFilters] = React.useState(() => getDefaultDates());

  // Handle filter changes from FiltersBar
  const handleFiltersChange = React.useCallback(
    (newFrom: string, newTo: string, newOfficeId: string) => {
      setFilters({
        fromDate: newFrom,
        toDate: newTo,
        officeId: newOfficeId,
      });
    },
    []
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link
            href="/dashboard/incidentes/nuevo"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Incidente
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="mb-6">
        <FiltersBar
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiTotalIncidents
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />

        <KpiSuspectsIdentified
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />

        <KpiSuspectsNotIdentified
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />

        <KpiBranches24h officeId={filters.officeId} />
      </div>

      {/* Recent Incidents Table */}
      <div className="mb-6">
        <RecentIncidentsTable
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <IncidentMap
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />
        <IncidentDistributionChart
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />
      </div>
      {/* Economic Analysis and Top Suspects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EconomicBarChart
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />

        <TopRepeatSuspects />
      </div>

      {/* Historical Comparison and Office Ranking Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <HistoricalComparison officeId={filters.officeId} />

        <OfficeRanking
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          officeId={filters.officeId}
        />
      </div>
    </div>
  );
}

// Export the component wrapped with error boundary
export default withErrorBoundary(DashboardPage);
