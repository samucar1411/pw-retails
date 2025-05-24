'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';
import { api } from '@/services/api';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSuspects } from '@/context/suspect-context';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SuspectUI {
  id: string;
  name: string;
  alias: string;
  status: 'active' | 'inactive';
  lastSeen: string;
  incidents: number;
  photoUrl?: string;
}

export default function SuspectsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  const {
    suspects: apiSuspects,
    loading: isLoading,
    error: apiError,
    fetchSuspects,
    pagination
  } = useSuspects();

  // Calculate total pages based on pagination data
  const totalPages = Math.ceil(pagination.totalCount / pageSize);

  // State for incidents data
  const [incidentsData, setIncidentsData] = useState<Record<string, { lastSeen: string; count: number }>>({});
  const [loadingIncidents, setLoadingIncidents] = useState<Record<string, boolean>>({});

  // Fetch incidents for each suspect
  useEffect(() => {
    const fetchIncidentsForSuspects = async () => {
      const newIncidentsData: Record<string, { lastSeen: string; count: number }> = {};
      const newLoadingIncidents: Record<string, boolean> = {};

      for (const suspect of apiSuspects) {
        if (!suspect.Alias) continue;
        
        newLoadingIncidents[suspect.id] = true;
        
        try {
          const response = await api.get(`/api/incidents/?suspect_alias=${encodeURIComponent(suspect.Alias)}`);
          const incidents = response.data.results || [];
          
          // Sort incidents by date to find the most recent one
          const sortedIncidents = [...incidents].sort((a, b) => 
            new Date(b.Date).getTime() - new Date(a.Date).getTime()
          );
          
          // Get the most recent incident date if available
          const lastIncident = sortedIncidents[0];
          const lastSeen = lastIncident?.Date 
            ? new Date(lastIncident.Date).toLocaleDateString()
            : 'N/A';
            
          newIncidentsData[suspect.id] = {
            lastSeen,
            count: incidents.length
          };
        } catch (error) {
          console.error(`Error fetching incidents for suspect ${suspect.id}:`, error);
          newIncidentsData[suspect.id] = {
            lastSeen: 'Error',
            count: 0
          };
        } finally {
          newLoadingIncidents[suspect.id] = false;
        }
      }
      
      setIncidentsData(prev => ({ ...prev, ...newIncidentsData }));
      setLoadingIncidents(prev => ({ ...prev, ...newLoadingIncidents }));
    };
    
    if (apiSuspects.length > 0) {
      fetchIncidentsForSuspects();
    }
  }, [apiSuspects]);

  // Memoize the transformation to prevent unnecessary recalculations
  const suspects: SuspectUI[] = useMemo(() => {
    return apiSuspects.map(suspect => {
      const incidentsInfo = incidentsData[suspect.id] || { lastSeen: 'Cargando...', count: 0 };
      const isLoading = loadingIncidents[suspect.id] === true;
      
      return {
        id: suspect.id,
        name: suspect.Alias || 'Sin alias',
        alias: suspect.Alias || 'Sin alias',
        status: suspect.Status === 1 ? 'active' : 'inactive',
        lastSeen: isLoading ? 'Cargando...' : incidentsInfo.lastSeen,
        incidents: incidentsInfo.count,
        photoUrl: suspect.PhotoUrl
      };
    });
  }, [apiSuspects, incidentsData, loadingIncidents]);

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
    fetchSuspects({
      page: 1,
      pageSize,
      search: value
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Page changed to:', newPage);
    setPage(newPage);
    fetchSuspects({
      page: newPage,
      pageSize,
      search: searchQuery
    });
  };

  // Loading skeleton
  if (isLoading && suspects.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sospechosos</h1>
        <Button onClick={() => router.push('/dashboard/suspects/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Sospechoso
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar sospechosos..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {apiError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {apiError}
        </div>
      ) : (
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
              {suspects.length > 0 ? (
                suspects.map((suspect) => (
                  <TableRow key={suspect.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                              <>
                                <AvatarImage 
                                  src={suspect.photoUrl}
                                  alt={suspect.name}
                                  onError={(e) => {
                                    console.error('Error loading image:', e);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <AvatarFallback className="">
                                  <User className="h-4 w-4 text-primary" />
                                </AvatarFallback>
                              </>
                        </Avatar>
                        <div>
                          <div className="font-medium">{suspect.id}</div>
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
                        onClick={() => router.push(`/dashboard/suspects/${suspect.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery ? 'No se encontraron resultados' : 'No hay sospechosos registrados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{(pagination.pageIndex - 1) * pageSize + 1}</span> a{' '}
          <span className="font-medium">
            {Math.min(pagination.pageIndex * pageSize, pagination.totalCount)}
          </span>{' '}
          de <span className="font-medium">{pagination.totalCount}</span> resultados
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page === 1}
                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                className={page === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show page numbers around current page
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.pageIndex <= 3) {
                pageNum = i + 1;
              } else if (pagination.pageIndex >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.pageIndex - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pagination.pageIndex === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                aria-disabled={page === totalPages}
                onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                className={page === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
