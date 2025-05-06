'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Search } from 'lucide-react';

// Mock data - replace with real data later
const mockSuspects = [
  {
    id: '1',
    name: 'Juan Pérez',
    alias: 'El Rápido',
    status: 'active',
    lastSeen: '2024-03-15',
    incidents: 3,
    imageUrl: '/avatars/suspect1.jpg',
  },
  {
    id: '2',
    name: 'María García',
    alias: 'La Sombra',
    status: 'inactive',
    lastSeen: '2024-02-28',
    incidents: 1,
    imageUrl: '/avatars/suspect2.jpg',
  },
];

export default function SuspectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuspects = mockSuspects.filter(suspect =>
    suspect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suspect.alias.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sospechosos</h1>
        <Button onClick={() => router.push('/dashboard/sospechosos/nuevo')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Sospechoso
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o alias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sospechoso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última vez visto</TableHead>
              <TableHead>Incidentes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuspects.map((suspect) => (
              <TableRow key={suspect.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={suspect.imageUrl} alt={suspect.name} />
                      <AvatarFallback>
                        {suspect.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{suspect.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {suspect.alias}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={suspect.status === 'active' ? 'default' : 'secondary'}>
                    {suspect.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>{suspect.lastSeen}</TableCell>
                <TableCell>{suspect.incidents}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/sospechosos/${suspect.id}`)}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 