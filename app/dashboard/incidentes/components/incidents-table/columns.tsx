import { ColumnDef } from "@tanstack/react-table";
import { Incident } from "@/types/incident";
import { IdCell } from "@/components/ui/id-cell";
import { SuspectInfo } from "../suspect-info";
import { IncidentTypeInfo } from "../incident-type-info";
import { OfficeInfo } from "../office-info";
import { LossesInfo } from "../losses-info";

export const columns: ColumnDef<Incident>[] = [
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => <IdCell id={row.original.id} basePath="incidentes" />
  },
  {
    accessorKey: "Date",
    header: "Fecha y hora",
    cell: ({ row }) => {
      const date = row.original.Date;
      return (
        <div className="font-medium">
          {date ? new Date(date).toLocaleDateString('es-PY', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit' 
          }) : 'Sin fecha'}
        </div>
      );
    }
  },
  {
    accessorKey: "IncidentType",
    header: "Tipo",
    cell: ({ row }) => <IncidentTypeInfo typeId={row.original.IncidentType} />
  },
  {
    accessorKey: "Office",
    header: "Sucursal",
    cell: ({ row }) => {
      const officeId = row.original.Office;
      return officeId ? <OfficeInfo officeId={officeId} /> : '-';
    }
  },
  {
    accessorKey: "Description",
    header: "Detalles",
    cell: ({ row }) => {
      const incident = row.original;
      return (
        <div className="space-y-1.5">
          <div className="text-sm line-clamp-2">
            {incident.Description || "Sin descripción"}
          </div>
          {incident.Suspects?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {incident.Suspects.map((suspectId) => (
                <div key={suspectId} className="bg-muted/50 rounded-full px-2 py-0.5 text-xs">
                  <SuspectInfo suspectId={suspectId} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "TotalLoss",
    header: "Pérdida",
    cell: ({ row }) => <LossesInfo incident={row.original} />
  }
]; 