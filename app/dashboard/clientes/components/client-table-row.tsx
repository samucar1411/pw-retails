"use client";

import { Company } from "@/types/company";

import { TableRow, TableCell } from "@/components/ui/table";

interface Column {
  cell: (company: Company) => React.ReactNode;
}

interface ClientTableRowProps {
  company: Company;
  columns: Column[];
}

export function ClientTableRow({ company, columns }: ClientTableRowProps) {
  return (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell key={index}>{column.cell(company)}</TableCell>
      ))}
    </TableRow>
  );
}
