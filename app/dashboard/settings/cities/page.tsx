"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { CityDialog } from "./city-dialog";

import { cityService } from "@/services/city-service";

import { City } from "@/types/city";
import type { CityCreateInput } from "@/types/city";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

export default function CitiesPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>();

  const fetchCities = async () => {
    try {
      setIsLoading(true);
      const data = await cityService.getCities();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Error al cargar las ciudades");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCreate = async (data: CityCreateInput) => {
    try {
      await cityService.createCity(data);
      toast.success("Ciudad creada exitosamente");
      fetchCities();
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating city:", error);
      toast.error("Error al crear ciudad");
    }
  };

  const handleUpdate = async (data: CityCreateInput) => {
    if (!selectedCity) return;
    try {
      await cityService.updateCity(selectedCity.id, data);
      toast.success("Ciudad actualizada exitosamente");
      fetchCities();
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating city:", error);
      toast.error("Error al actualizar ciudad");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta ciudad?")) return;
    try {
      await cityService.deleteCity(id);
      toast.success("Ciudad eliminada exitosamente");
      fetchCities();
      router.refresh();
    } catch (error) {
      console.error("Error deleting city:", error);
      toast.error("Error al eliminar ciudad");
    }
  };

  const columns: ColumnDef<City>[] = [
    {
      accessorKey: "Code",
      header: "Código",
    },
    {
      accessorKey: "Name",
      header: "Nombre",
    },
    {
      accessorKey: "Country",
      header: "País",
    },
    {
      accessorKey: "Closed",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.getValue("Closed") ? "destructive" : "success"}>
          {row.getValue("Closed") ? "Inactivo" : "Activo"}
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
            onClick={() => {
              setSelectedCity(row.original);
              setDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ciudades</h2>
        <Button onClick={() => setDialogOpen(true)}>
          {" "}
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar{" "}
        </Button>
      </div>
      <DataTable columns={columns} data={cities} loading={isLoading} />
      <CityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        city={selectedCity}
        onSubmit={selectedCity ? handleUpdate : handleCreate}
      />
    </div>
  );
}
