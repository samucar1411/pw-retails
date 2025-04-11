"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, MapPin } from "lucide-react";

import { Office } from "@/types/office";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import("@/components/ui/map"), { ssr: false });

interface CompanyOfficesProps {
  companyId: string;
}

export function CompanyOffices({ companyId }: CompanyOfficesProps) {
  const [offices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        console.log("Fetching offices for company:", companyId);
      } catch (error) {
        console.error("Error fetching offices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [companyId]);

  const columns: ColumnDef<Office>[] = [
    {
      accessorKey: "Name",
      header: "Nombre",
    },
    {
      accessorKey: "Address",
      header: "Dirección",
    },
    {
      accessorKey: "City",
      header: "Ciudad",
    },
    {
      accessorKey: "Phone",
      header: "Teléfono",
    },
    {
      accessorKey: "Closed",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.getValue("Closed") ? "destructive" : "default"}>
          {row.getValue("Closed") ? "Cerrada" : "Activa"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log("Edit office:", row.original.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log("Delete office:", row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log("View map:", row.original.Geo)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sucursales
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offices.length}</div>
          </CardContent>
        </Card>
        {/* Add more summary cards */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de Sucursales</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Map
            locations={offices.map((office) => ({
              lat: parseFloat(office.Geo.split(",")[0]),
              lng: parseFloat(office.Geo.split(",")[1]),
              title: office.Name,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Sucursales</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={offices} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
