"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "visor-ui";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardFooter } from "@/components/dashboard-footer";
// Event provider removed
import { CompanyProvider } from "@/context/company-context";
import { OfficeProvider } from "@/context/office-context";
import { DashboardProvider } from "@/context/dashboard-context";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {  
        staleTime: 5 * 60 * 1000,      // 5 minutes - balanced for freshness
        gcTime: 20 * 60 * 1000,        // 20 minutes garbage collection - increased
        retry: 1,                       // Only 1 retry to avoid excessive requests
        retryDelay: (attemptIndex) => Math.min(3000 * 2 ** attemptIndex, 15000), // More conservative delay
        refetchOnWindowFocus: false,    // Prevent refetch on window focus
        refetchOnReconnect: false,      // Prevent refetch on reconnect
        refetchOnMount: false,          // Don't refetch if data is still fresh
        refetchInterval: false,         // Disable automatic polling
        refetchIntervalInBackground: false, // Disable background polling
        // Conservative network settings
        networkMode: 'offlineFirst',    // Use cache when possible
      },
      mutations: {
        retry: 1,                       // Single retry for mutations
        retryDelay: 5000,              // 5 second delay for mutation retries
        networkMode: 'offlineFirst',    // Use cache when possible for mutations too
      }
    }
  });
  return (
    <QueryClientProvider client={queryClient}>
        <OfficeProvider>
          <CompanyProvider>
            <DashboardProvider>
              <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex flex-col min-h-screen w-full">
                  <DashboardHeader />
                  <main className="flex-1 overflow-y-auto">{children}</main>
                  <DashboardFooter />
                </SidebarInset>
              </SidebarProvider>
            </DashboardProvider>
          </CompanyProvider>
        </OfficeProvider>
    </QueryClientProvider>
  );
}
