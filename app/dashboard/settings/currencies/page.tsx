"use client";

import { useEffect, useState } from "react";
import { currencyService } from "@/services/currency-service";
import { Currency } from "@/types/currency";
import { DataTable } from "../components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CurrencyDialog } from "./currency-dialog";
import { toast } from "sonner";

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>();

  const loadCurrencies = async () => {
    try {
      const data = await currencyService.getCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error("Error loading currencies:", error);
      toast.error("Error al cargar monedas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleCreate = async (data: Omit<Currency, "id" | "syncVersion">) => {
    try {
      await currencyService.createCurrency(data);
      toast.success("Moneda creada exitosamente");
      loadCurrencies();
    } catch (error) {
      console.error("Error creating currency:", error);
      toast.error("Error al crear moneda");
    }
  };

  const handleUpdate = async (data: Omit<Currency, "id" | "syncVersion">) => {
    if (!selectedCurrency) return;
    try {
      await currencyService.updateCurrency(selectedCurrency.id, data);
      toast.success("Moneda actualizada exitosamente");
      loadCurrencies();
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error("Error al actualizar moneda");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta moneda?")) return;
    try {
      await currencyService.deleteCurrency(id);
      toast.success("Moneda eliminada exitosamente");
      loadCurrencies();
    } catch (error) {
      console.error("Error deleting currency:", error);
      toast.error("Error al eliminar moneda");
    }
  };

  const columns: ColumnDef<Currency>[] = [
    {
      accessorKey: "Code",
      header: "Código",
    },
    {
      accessorKey: "Alias",
      header: "Alias",
    },
    {
      accessorKey: "RoundOff",
      header: "Redondeo",
      cell: ({ row }) => row.original.RoundOff || "-",
    },
    {
      accessorKey: "ConvertionBase",
      header: "Base de conversión",
      cell: ({ row }) => row.original.ConvertionBase || "-",
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
              setSelectedCurrency(row.original);
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
        <h2 className="text-xl font-semibold tracking-tight">Monedas</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona las monedas disponibles en el sistema
        </p>
      </div>

      <DataTable
        columns={columns}
        data={currencies}
        searchKey="Code"
        onAdd={() => {
          setSelectedCurrency(undefined);
          setDialogOpen(true);
        }}
      />

      <CurrencyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currency={selectedCurrency}
        onSubmit={selectedCurrency ? handleUpdate : handleCreate}
      />
    </div>
  );
}
