import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Suspect } from '@/types/suspect';
import { useState } from 'react';
import Image from 'next/image';

// Helper function for sortable headers
const SortableHeader = ({ column, children }: { column: { toggleSorting: (desc: boolean) => void, getIsSorted: () => boolean | 'asc' | 'desc' | undefined }, children: React.ReactNode }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    className="p-0 hover:bg-transparent"
  >
    {children}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

export const columns: ColumnDef<Suspect>[] = [
  {
    accessorKey: 'Alias',
    header: ({ column }) => (
      <SortableHeader column={column}>
        Alias
      </SortableHeader>
    ),
  },
  {
    accessorKey: 'PhysicalDescription',
    header: ({ column }) => (
      <SortableHeader column={column}>
        Description
      </SortableHeader>
    ),
  },
  {
    accessorKey: 'PhotoUrl',
    header: 'Photo',
    cell: ({ row }) => {
      const photoUrl = row.getValue('PhotoUrl') as string;
      return (
        <div className="w-12 h-12 relative">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={row.getValue('Alias') || 'Suspect'}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
              <span className="text-xs text-gray-500">No photo</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'Status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('Status') as number;
      const statusText = status === 1 ? 'Active' : 'Inactive';
      const statusVariant = status === 1 ? 'default' : 'secondary';
      return (
        <Badge variant={statusVariant}>
          {statusText}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
      const suspect = row.original as Suspect;
      const [isOpen, setIsOpen] = useState(false);
      
      return (
        <div className="relative">
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {isOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <DropdownMenuItem>
                  <Link 
                    href={`/dashboard/sospechosos/${suspect.id}`} 
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link 
                    href={`/dashboard/sospechosos/${suspect.id}/edit`} 
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Edit
                  </Link>
                </DropdownMenuItem>
              </div>
            </div>
          )}
        </div>
      );
    },
  },
];
