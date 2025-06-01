"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "visor-ui";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
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
        staleTime: 5 * 60 * 1000,      // 5 minutes - increased from 1 minute
        gcTime: 10 * 60 * 1000,        // 10 minutes garbage collection
        retry: 1,                       // Reduced from default 3 to 1 retry
        retryDelay: 2000,               // 2 seconds between retries
        refetchOnWindowFocus: false,    // Prevent refetch on window focus
        refetchOnReconnect: false,      // Prevent refetch on reconnect
        // Reduce concurrent requests
        networkMode: 'offlineFirst',    // Use cache when possible
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
            </SidebarInset>
          </SidebarProvider>
        </CompanyProvider>
      </OfficeProvider>
    </QueryClientProvider>
  );
}
