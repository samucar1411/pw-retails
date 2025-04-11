import { useState, useEffect } from "react";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { companyService } from "@/services/company-service";

import { Company } from "@/types/company";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const columns: ColumnDef<Company>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={company.image_url} alt={company.name} />
            <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/dashboard/clientes/${company.id}`}
              className="hover:underline"
            >
              <div className="font-medium">{company.name}</div>
            </Link>
            <div className="text-sm text-muted-foreground">
              ID: {company.id}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "ruc",
    accessorKey: "identification_number",
    header: "RUC",
  },
  {
    id: "business_name",
    accessorKey: "business_name",
    header: "Razón Social",
  },
  {
    id: "branches",
    accessorKey: "emp_qty",
    header: "Sucursales",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.emp_qty}</Badge>
    ),
  },
  {
    id: "amount",
    accessorKey: "emp_qty",
    header: "Monto",
    cell: ({ row }) =>
      new Intl.NumberFormat("es-PY", {
        style: "currency",
        currency: "PYG",
        maximumFractionDigits: 0,
      }).format(row.original.emp_qty * 250000),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const ActionCell = () => {
        const router = useRouter();
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/clientes/edit//${row.original.id}`)
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  const event = new CustomEvent("deleteCompany", {
                    detail: row.original,
                  });
                  window.dispatchEvent(event);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };
      return <ActionCell />;
    },
  },
];

interface DeleteCompanyModalProps {
  company: Company | null;
  onClose: () => void;
  onConfirm: (companyId: string) => void;
}

function DeleteCompanyModal({
  company,
  onClose,
  onConfirm,
}: DeleteCompanyModalProps) {
  if (!company) return null;

  return (
    <AlertDialog open={!!company} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            empresa {company.name} y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(company.id)}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CompanyActions() {
  const router = useRouter();
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleDelete = async (companyId: string) => {
    try {
      console.log("Deleting company with ID:", companyId);
      console.log("Using companyService instance:", companyService);
      console.log(
        "CompanyService methods:",
        Object.getOwnPropertyNames(Object.getPrototypeOf(companyService))
      );

      await companyService.deleteCompany(companyId);
      toast.success("Empresa eliminada exitosamente");
      router.refresh();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Error al eliminar la empresa");
    }
  };

  useEffect(() => {
    const onDeleteCompany = (e: CustomEvent<Company>) => {
      setCompanyToDelete(e.detail);
    };

    window.addEventListener("deleteCompany", onDeleteCompany as EventListener);
    return () => {
      window.removeEventListener(
        "deleteCompany",
        onDeleteCompany as EventListener
      );
    };
  }, []);

  return (
    <DeleteCompanyModal
      company={companyToDelete}
      onClose={() => setCompanyToDelete(null)}
      onConfirm={(companyId) => {
        handleDelete(companyId);
        setCompanyToDelete(null);
      }}
    />
  );
}
