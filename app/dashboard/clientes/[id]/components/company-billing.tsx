"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyBillingProps {
  companyId: string;
}

interface Invoice extends Record<string, string | number> {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  invoiceNumber: string;
  dueDate: string;
}

export function CompanyBilling({ companyId }: CompanyBillingProps) {
  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      date: "2024-03-01",
      amount: 2500000,
      status: "paid",
      invoiceNumber: "INV-001",
      dueDate: "2024-03-15",
    },
    {
      id: "2",
      date: "2024-03-15",
      amount: 2500000,
      status: "pending",
      invoiceNumber: "INV-002",
      dueDate: "2024-03-30",
    },
  ]);

  useEffect(() => {
    // TODO: Fetch invoices using companyId
    console.log("Fetching invoices for company:", companyId);
  }, [companyId]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Nº Factura",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) =>
        new Date(row.getValue("date")).toLocaleDateString("es-PY"),
    },
    {
      accessorKey: "dueDate",
      header: "Vencimiento",
      cell: ({ row }) =>
        new Date(row.getValue("dueDate")).toLocaleDateString("es-PY"),
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) =>
        new Intl.NumberFormat("es-PY", {
          style: "currency",
          currency: "PYG",
          maximumFractionDigits: 0,
        }).format(row.getValue("amount")),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as Invoice["status"];
        const statusStyles = {
          paid: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          overdue: "bg-red-100 text-red-800",
        };
        const statusText = {
          paid: "Pagado",
          pending: "Pendiente",
          overdue: "Vencido",
        };
        return (
          <Badge className={statusStyles[status]}>{statusText[status]}</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: () => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toast.success("Factura descargada");
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <DataTable columns={columns} data={invoices} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Información de facturación no disponible
          </p>
        )}
      </CardContent>
    </Card>
  );
}
