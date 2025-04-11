"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { EventProvider } from '@/context/event-context'
import { CompanyProvider } from '@/context/company-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EventProvider>
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
    </EventProvider>
  )
} 