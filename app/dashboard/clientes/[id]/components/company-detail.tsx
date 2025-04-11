"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Building2, Edit, FileText, Globe, Users } from "lucide-react";

import { CompanyOffices } from "./company-offices";
import { CompanyBilling } from "./company-billing";
import { CompanyOverview } from "./company-overview";
import { CompanySettings } from "./company-settings";
import { CompanySecurity } from "./company-security";
import { CompanyEmployees } from "./company-employees";

import { Company } from "@/types/company";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockStats = {
  activeOffices: 12,
};

interface CompanyDetailProps {
  company: Company & {
    status?: "active" | "inactive";
  };
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  console.log("[Company Detail] Rendering company:", company);
  const router = useRouter();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detalles de la empresa
            </h1>
            <p className="text-muted-foreground">
              Gestiona la información y configuración de la empresa
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-background rounded-xl p-4 lg:p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {company.image_url ? (
            <div className="relative">
              <Image
                src={company.image_url}
                alt={company.name}
                width={56}
                height={56}
                className="h-14 w-14 object-contain rounded-lg border bg-white p-2"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center border">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-semibold truncate">
                  {company.name}
                </h2>
                <Badge
                  variant={
                    company.status === "active" ? "success" : "secondary"
                  }
                  className="capitalize w-fit"
                >
                  {company.status || "Activo"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {company.business_name}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 min-w-fit">
                <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">
                  RUC: {company.identification_number}
                </span>
              </span>
              <span className="flex items-center gap-1.5 min-w-fit">
                <Globe className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{company.country}</span>
              </span>
              <span className="flex items-center gap-1.5 min-w-fit">
                <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{company.emp_qty} empleados</span>
              </span>
              <span className="flex items-center gap-1.5 min-w-fit">
                <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">
                  {mockStats.activeOffices} sucursales
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/clientes/editar/${company.id}`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent p-0 mb-2">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">
            General
          </TabsTrigger>
          <TabsTrigger value="offices" className="flex-1 sm:flex-none">
            Sucursales
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex-1 sm:flex-none">
            Empleados
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 sm:flex-none">
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 sm:flex-none">
            Facturación
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CompanyOverview company={company} />
        </TabsContent>

        <TabsContent value="offices" className="space-y-4">
          <CompanyOffices companyId={company.id} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <CompanyEmployees companyId={company.id} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <CompanySecurity companyId={company.id} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <CompanyBilling companyId={company.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CompanySettings company={company} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
