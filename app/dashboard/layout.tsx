"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "visor-ui"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
// Event provider removed
import { CompanyProvider } from '@/context/company-context'
import { OfficeProvider } from "@/context/office-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OfficeProvider>
        <CompanyProvider>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen w-full">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CompanyProvider>
    </OfficeProvider>
  )
} 