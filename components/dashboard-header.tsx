"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { SidebarTrigger } from "visor-ui";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center">
          <SidebarTrigger className="h-8 w-8" />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationsDropdown />
        </div>
      </div>
    </header>
  );
}
