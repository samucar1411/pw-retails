"use client";

import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyEmployeesProps {
  companyId: string;
}

export function CompanyEmployees({ companyId }: CompanyEmployeesProps) {
  useEffect(() => {
    // TODO: Fetch employees data using companyId
    console.log("Fetching employees for company:", companyId);
  }, [companyId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empleados</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Información de empleados no disponible
        </p>
      </CardContent>
    </Card>
  );
}
