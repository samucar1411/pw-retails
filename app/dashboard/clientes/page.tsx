"use client";

import { useState, useEffect } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCompany } from "@/context/company-context";

import { columns, CompanyActions } from "./columns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientesPage() {
  const router = useRouter();
  const { state, loadCompanies } = useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded && state.companies.length === 0) {
      loadCompanies();
      setHasLoaded(true);
    }
  }, [loadCompanies, hasLoaded, state.companies.length]);

  const filteredCompanies = state.companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.identification_number.includes(searchQuery) ||
      company.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (state.error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Clientes</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Input
                placeholder="Buscar clientes..."
                className="w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex flex-row gap-4">
                <Button
                  onClick={() => router.push("/dashboard/clientes/crear")}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo cliente
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={filteredCompanies} />
              <CompanyActions />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
