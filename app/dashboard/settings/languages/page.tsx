"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../components/data-table";

import { LanguageDialog } from "./language-dialog";

import { langService } from "@/services/lang-service";

import { Lang } from "@/types/lang";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Lang>();

  const loadLanguages = async () => {
    try {
      const data = await langService.getLangs();
      setLanguages(data);
    } catch (error) {
      console.error("Error loading languages:", error);
      toast.error("Error al cargar idiomas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const handleCreate = async (data: Omit<Lang, "id">) => {
    try {
      await langService.createLang(data);
      toast.success("Idioma creado exitosamente");
      loadLanguages();
    } catch (error) {
      console.error("Error creating language:", error);
      toast.error("Error al crear idioma");
    }
  };

  const handleUpdate = async (data: Omit<Lang, "id">) => {
    if (!selectedLanguage) return;
    try {
      await langService.updateLang(selectedLanguage.id, data);
      toast.success("Idioma actualizado exitosamente");
      loadLanguages();
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error("Error al actualizar idioma");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este idioma?")) return;
    try {
      await langService.deleteLang(id);
      toast.success("Idioma eliminado exitosamente");
      loadLanguages();
    } catch (error) {
      console.error("Error deleting language:", error);
      toast.error("Error al eliminar idioma");
    }
  };

  const columns: ColumnDef<Lang>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "available",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.available ? "success" : "destructive"}>
          {row.original.available ? "Disponible" : "No disponible"}
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
              setSelectedLanguage(row.original);
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
        <h2 className="text-xl font-semibold tracking-tight">Idiomas</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona los idiomas disponibles en el sistema
        </p>
      </div>

      <DataTable
        columns={columns}
        data={languages}
        searchKey="name"
        onAdd={() => {
          setSelectedLanguage(undefined);
          setDialogOpen(true);
        }}
      />

      <LanguageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        language={selectedLanguage}
        onSubmit={selectedLanguage ? handleUpdate : handleCreate}
      />
    </div>
  );
}
