'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type Suspect = {
  id: string;
  alias: string;
  status: string;
  description?: string;
  imageUrl?: string;
};

interface SuspectSelectorProps {
  onSelect: (suspect: Suspect) => void;
  onClose: () => void;
}

export function SuspectSelector({ onSelect, onClose }: SuspectSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [filteredSuspects, setFilteredSuspects] = useState<Suspect[]>([]);

  useEffect(() => {
    // Obtener sospechosos del localStorage
    const storedIncidents = localStorage.getItem('incidents');
    if (storedIncidents) {
      const incidents = JSON.parse(storedIncidents) as Array<{ suspects?: Suspect[] }>;
      const allSuspects = incidents.flatMap(incident => incident.suspects || []);
      // Eliminar duplicados basados en el ID
      const uniqueSuspects = Array.from(new Map(allSuspects.map(s => [s.id, s])).values());
      setSuspects(uniqueSuspects);
      setFilteredSuspects(uniqueSuspects);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = suspects.filter(suspect => 
        suspect.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suspect.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuspects(filtered);
    } else {
      setFilteredSuspects(suspects);
    }
  }, [searchTerm, suspects]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por alias o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredSuspects.length > 0 ? (
            filteredSuspects.map((suspect) => (
              <div
                key={suspect.id}
                className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={() => onSelect(suspect)}
              >
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {suspect.imageUrl ? (
                    <Image src={suspect.imageUrl} alt={suspect.alias} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{suspect.alias}</p>
                    <Badge variant={suspect.status === 'detenido' ? 'default' : 'outline'} className="text-xs">
                      {suspect.status === 'detenido' ? 'Detenido' : 'Libre'}
                    </Badge>
                  </div>
                  {suspect.description && (
                    <p className="text-sm text-muted-foreground">{suspect.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? 'No se encontraron sospechosos' : 'No hay sospechosos registrados'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 