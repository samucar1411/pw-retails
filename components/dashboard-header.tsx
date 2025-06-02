"use client";

import * as React from "react";

import Link from "next/link";
import { Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarTrigger,
} from "visor-ui";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2">
            <User className="h-4 w-4" />
          </span>
        </Button>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
