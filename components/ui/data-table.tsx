// "use client";

// import { useState } from "react";
// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
//   searchKey?: keyof TData & string;
//   loading?: boolean;
//   onAdd?: () => void;
// }

// export function DataTable<TData, TValue>({
//   columns,
//   data,
//   searchKey,
//   loading,
//   onAdd,
// }: DataTableProps<TData, TValue>) {
//   const [search, setSearch] = useState("");

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   const filteredData = searchKey
//     ? data.filter((item) =>
//         String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
//       )
//     : data;

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         {searchKey && (
//           <Input
//             placeholder="Buscar..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-sm"
//           />
//         )}
//         {onAdd && (
//           <Button onClick={onAdd}>
//             <Plus className="mr-2 h-4 w-4" />
//             Agregar
//           </Button>
//         )}
//       </div>

//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   Cargando...
//                 </TableCell>
//               </TableRow>
//             ) : filteredData.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No hay datos disponibles
//                 </TableCell>
//               </TableRow>
//             ) : (
//               table.getRowModel().rows?.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }







"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Input, Table, TableRow, TableCell, TableHead, TableBody } from "visor-ui";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: keyof TData & string;
  loading?: boolean;
  onAdd?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  loading,
  onAdd,
}: DataTableProps<TData, TValue>) {
  const [search, setSearch] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {searchKey && (
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        )}
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <thead>
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
          </thead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows?.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}