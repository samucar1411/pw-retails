"use client";

import { useEffect, useState } from "react";
import {
  getNationalities,
  createNationality,
  updateNationality,
  deleteNationality,
} from "@/services/nationality-service";
import { Nationality } from "@/types/nationality";
import { DataTable } from "../components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NationalityDialog } from "./nationality-dialog";
import { toast } from "sonner";

export default function NationalitiesPage() {
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState<Nationality>();

  const loadNationalities = async () => {
    try {
      setLoading(true);
      const data = await getNationalities();
      setNationalities(data);
    } catch (error) {
      console.error("Error loading nationalities:", error);
      toast.error("Error al cargar las nacionalidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNationalities();
  }, []);

  const handleCreate = async (
    data: Omit<Nationality, "id" | "syncVersion">
  ) => {
    try {
      const result = await createNationality(data);
      if (result) {
        toast.success("Nacionalidad creada exitosamente");
        loadNationalities();
      }
    } catch (error) {
      console.error("Error creating nationality:", error);
      toast.error("Error al crear la nacionalidad");
    }
  };

  const handleUpdate = async (
    data: Omit<Nationality, "id" | "syncVersion">
  ) => {
    try {
      if (!selectedNationality) return;
      const result = await updateNationality(selectedNationality.id, data);
      if (result) {
        toast.success("Nacionalidad actualizada exitosamente");
        loadNationalities();
      }
    } catch (error) {
      console.error("Error updating nationality:", error);
      toast.error("Error al actualizar la nacionalidad");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta nacionalidad?")) return;
    try {
      const result = await deleteNationality(id);
      if (result) {
        toast.success("Nacionalidad eliminada exitosamente");
        loadNationalities();
      }
    } catch (error) {
      console.error("Error deleting nationality:", error);
      toast.error("Error al eliminar la nacionalidad");
    }
  };

  const columns: ColumnDef<Nationality>[] = [
    {
      accessorKey: "Code",
      header: "Código",
    },
    {
      accessorKey: "Name",
      header: "Nombre",
    },
    {
      accessorKey: "Closed",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.Closed ? "destructive" : "success"}>
          {row.original.Closed ? "Inactivo" : "Activo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedNationality(row.original);
              setDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Nacionalidades</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona las nacionalidades disponibles en el sistema
        </p>
      </div>

      <DataTable
        columns={columns}
        data={nationalities}
        searchKey="Code"
        onAdd={() => {
          setSelectedNationality(undefined);
          setDialogOpen(true);
        }}
      />

      <NationalityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nationality={selectedNationality}
        onSubmit={selectedNationality ? handleUpdate : handleCreate}
      />
    </div>
  );
}
