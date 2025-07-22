"use client";

import { useState } from "react";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnSort,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  sorting?: ColumnSort[];
  onSortingChange?: (sorting: ColumnSort[]) => void;
  searchKey?: keyof TData & string;
  loading?: boolean;
  isError?: boolean;
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount = 1,
  pagination = { pageIndex: 0, pageSize: 10 },
  onPaginationChange,
  sorting = [],
  onSortingChange,
  searchKey,
  loading = false,
  isError = false,
  onAdd,
  onSearch,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<TData, TValue>) {
  const [search, setSearch] = useState("");
  const [sortState, setSortState] = useState<SortingState>(sorting);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting: sortState,
    },
    onPaginationChange: (updater) => {
      if (onPaginationChange) {
        const newPagination = 
          typeof updater === 'function' ? updater(pagination) : updater;
        onPaginationChange({
          pageIndex: newPagination.pageIndex ?? 0,
          pageSize: newPagination.pageSize ?? 10,
        });
      }
    },
    onSortingChange: (updater) => {
      const newSorting = 
        typeof updater === 'function' ? updater(sortState) : updater;
      setSortState(newSorting);
      if (onSortingChange) {
        onSortingChange(newSorting);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: onPaginationChange ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {searchKey && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="h-8 w-[150px] lg:w-[250px]"
              />
            </div>
          )}
        </div>
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Nuevo
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? 'Cargando...' : isError ? 'Error al cargar los datos' : 'No se encontraron resultados'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm"
              value={pagination.pageSize}
              onChange={(e) => {
                onPaginationChange?.({
                  ...pagination,
                  pageSize: Number(e.target.value),
                  pageIndex: 0 // Reset to first page when changing page size
                });
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {pagination.pageIndex + 1} de {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                onPaginationChange?.({
                  ...pagination,
                  pageIndex: 0
                });
              }}
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Ir a la primera página</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                onPaginationChange?.({
                  ...pagination,
                  pageIndex: pagination.pageIndex - 1
                });
              }}
              disabled={pagination.pageIndex === 0}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                onPaginationChange?.({
                  ...pagination,
                  pageIndex: pagination.pageIndex + 1
                });
              }}
              disabled={pagination.pageIndex === pageCount - 1}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                onPaginationChange?.({
                  ...pagination,
                  pageIndex: pageCount - 1
                });
              }}
              disabled={pagination.pageIndex === pageCount - 1}
            >
              <span className="sr-only">Ir a la última página</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}