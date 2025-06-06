"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "visor-ui";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardFooter } from "@/components/dashboard-footer";
// Event provider removed
import { CompanyProvider } from "@/context/company-context";
import { OfficeProvider } from "@/context/office-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {  
        staleTime: 3 * 60 * 1000,      // 3 minutes - balanced for freshness
        gcTime: 15 * 60 * 1000,        // 15 minutes garbage collection
        retry: 1,                       // Only 1 retry to avoid excessive requests
        retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000), // Progressive delay
        refetchOnWindowFocus: false,    // Prevent refetch on window focus
        refetchOnReconnect: false,      // Prevent refetch on reconnect
        refetchOnMount: false,          // Don't refetch if data is still fresh
        // Conservative network settings
        networkMode: 'offlineFirst',    // Use cache when possible
      },
      mutations: {
        retry: 1,                       // Single retry for mutations
        retryDelay: 3000,              // 3 second delay for mutation retries
      }
    }
  });
  return (
    <QueryClientProvider client={queryClient}>
      <OfficeProvider>
        <CompanyProvider>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen w-full">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto">{children}</main>
              <DashboardFooter />
            </SidebarInset>
          </SidebarProvider>
        </CompanyProvider>
      </OfficeProvider>
    </QueryClientProvider>
  );
}
