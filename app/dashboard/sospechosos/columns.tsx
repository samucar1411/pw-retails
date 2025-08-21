import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Suspect } from '@/types/suspect';
import Image from 'next/image';
import { IdCell } from '@/components/ui/id-cell';

export const columns: ColumnDef<Suspect>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => {
      const id = row.getValue('id') as string;
      return <IdCell id={id} basePath="sospechosos" />;
    },
  },
  {
    accessorKey: 'Alias',
    header: 'Nombre',
    cell: ({ row }) => {
      const suspect = row.original;
      const photoUrl = suspect.PhotoUrl;
      const alias = row.getValue('Alias') as string;
      
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-full overflow-hidden">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={alias || 'Suspect'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No foto</span>
              </div>
            )}
          </div>
          <span className="font-medium">{alias}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'Status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('Status') as number;
      
      let statusText: string;
      let variant: 'destructive' | 'secondary' | 'default';
      
      switch (status) {
        case 1:
          statusText = 'Detenido';
          variant = 'destructive';
          break;
        case 2:
          statusText = 'Libre';
          variant = 'secondary';
          break;
        case 3:
          statusText = 'Preso';
          variant = 'default';
          break;
        default:
          statusText = 'Desconocido';
          variant = 'secondary';
      }
      
      return (
        <Badge variant={variant}>
          {statusText}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'Tags',
    header: 'Características',
    cell: ({ row }) => {
      const tags = row.getValue('Tags');
      
      // Verificar que tags sea un array válido
      if (!Array.isArray(tags) || tags.length === 0) {
        return <span className="text-muted-foreground text-sm">Sin características</span>;
      }
      
      return (
        <div className="space-y-1 max-w-xs">
          {tags.slice(0, 2).map((tag, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">
                •
              </span>
              <span className="text-foreground font-medium truncate">
                {String(tag)}
              </span>
            </div>
          ))}
          {tags.length > 2 && (
            <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
              +{tags.length - 2} más
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const suspect = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/dashboard/sospechosos/${suspect.id}`}>
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/dashboard/sospechosos/${suspect.id}/edit`}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
