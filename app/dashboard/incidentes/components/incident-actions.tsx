"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Incident } from "@/types/incident";
import { deleteIncident } from "@/services/incident-service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { toast } from "@/components/ui/use-toast";

interface IncidentActionsProps {
  incident: Incident;
}

export function IncidentActions({ incident }: IncidentActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    router.push(`/dashboard/incidentes/${incident.id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/incidentes/${incident.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIncident(incident.id);
      toast({
        title: "Incidente eliminado",
        description: "El incidente ha sido eliminado correctamente.",
      });
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el incidente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="¿Eliminar incidente?"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el incidente y toda su información asociada."
        itemName={`Incidente ${incident.id}`}
        isLoading={isDeleting}
      />
    </>
  );
}