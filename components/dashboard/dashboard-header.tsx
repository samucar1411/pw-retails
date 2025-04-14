"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Visión General</h1>
        <p className="text-sm text-muted-foreground">
          Monitorear actividad principal
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-full sm:w-[300px]"
        />
        <Button variant="default" className="w-full sm:w-auto">
          + Registrar incidente
        </Button>
      </div>
    </div>
  );
}
