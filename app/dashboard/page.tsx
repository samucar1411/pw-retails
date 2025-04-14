'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentClients } from "@/components/dashboard/recent-clients"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SalesChartFilter } from "@/components/dashboard/sales-chart-filter"
import { dashboardService } from "@/services/dashboard-service"
import { useState, useEffect } from "react"

interface SalesData {
  name: string;
  clientes: number;
  ventas: number;
}

interface RecentClient {
  id: string;
  name: string;
  date: string;
  sucursales: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    facturacion: 0,
    clientesActivos: 0,
    sucursalesActivas: 0,
    clientesInactivos: 0
  });
  const [salesPeriod, setSalesPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, salesData, clientsData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getSalesData(salesPeriod),
          dashboardService.getRecentClients()
        ]);

        setStats(statsData);
        setSalesData(salesData);
        setRecentClients(clientsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [salesPeriod]);

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <DashboardHeader />
          <div className="w-full">
            <StatsCards {...stats} />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr,300px]">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle>Resumen de ventas</CardTitle>
                <SalesChartFilter period={salesPeriod} onPeriodChange={setSalesPeriod} />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <SalesChart data={salesData} />
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <RecentClients clients={recentClients} />
            </Card>
          </div>
        </>
      )}
    </div>
  )
} 