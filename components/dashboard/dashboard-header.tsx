"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  heading: string;
  text: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <p className="text-sm text-muted-foreground">
          {text}
        </p>
      </div>
      {children && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {children}
        </div>
      )}
    </div>
  );
}
