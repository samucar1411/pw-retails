"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Company } from "@/types/company";
import { getCompanyById } from "@/services/company-service";
import { CompanyDetail } from "./components/company-detail";


export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      if (!params?.id) return;
      
      try {
        const data = await getCompanyById(params.id as string);
        if (!data) {
          router.push("/404");
          return;
        }
        setCompany(data);
      } catch (err) {
        setError("Error al cargar el cliente");
        console.error("[Client Detail Page] Error loading company:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <h1 className="text-2xl font-bold text-destructive mb-2">
          Error al cargar el cliente
        </h1>
        <p className="text-muted-foreground text-center mb-4">
          Lo sentimos, ha ocurrido un error al cargar los detalles del cliente.
          Por favor, intente nuevamente más tarde.
        </p>
        <button
          onClick={() => router.push("/dashboard/clientes")}
          className="text-primary hover:underline"
        >
          Volver al listado de clientes
        </button>
      </div>
    );
  }

  if (!company) return null;

  return <CompanyDetail company={company} />;
}
