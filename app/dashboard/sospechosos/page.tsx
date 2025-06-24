'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { api } from '@/services/api';
import { getSuspectStatuses } from '@/services/suspect-service';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuspects } from '@/context/suspect-context';
import { SuspectStatus } from '@/types/suspect';
import { Incident } from '@/types/incident';
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
  statusId: number;
  statusName: string;
  lastSeen: string;
  incidents: number;
  photoUrl?: string;
}

export default function SuspectsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [suspectStatuses, setSuspectStatuses] = useState<SuspectStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const {
    suspects: apiSuspects,
    loading: isLoading,
    error: apiError,
    fetchSuspects,
    pagination
  } = useSuspects();

  // Load suspect statuses
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        setLoadingStatuses(true);
        const statuses = await getSuspectStatuses();
        setSuspectStatuses(statuses);
      } catch (error) {
        console.error('Error loading suspect statuses:', error);
        // Fallback to basic statuses
        setSuspectStatuses([
          { id: 1, Name: 'Libre' },
          { id: 2, Name: 'Detenido' }
        ]);
      } finally {
        setLoadingStatuses(false);
      }
    };

    loadStatuses();
  }, []);

  // State for incidents data
  const [incidentsData, setIncidentsData] = useState<Record<string, { lastSeen: string; count: number }>>({});
  const [loadingIncidents, setLoadingIncidents] = useState<Record<string, boolean>>({});

  // Optimized fetch incidents for all suspects in batch
  useEffect(() => {
    const fetchIncidentsForAllSuspects = async () => {
      if (apiSuspects.length === 0) return;
      
      // Get all aliases from suspects
      const suspectsWithAlias = apiSuspects.filter(suspect => suspect.Alias);
      if (suspectsWithAlias.length === 0) return;

      // Set loading for all suspects
      const newLoadingIncidents: Record<string, boolean> = {};
      suspectsWithAlias.forEach(suspect => {
        newLoadingIncidents[suspect.id] = true;
      });
      setLoadingIncidents(prev => ({ ...prev, ...newLoadingIncidents }));

      try {
        // Create batch request with all aliases
        const aliases = suspectsWithAlias.map(suspect => suspect.Alias).join(',');
        const response = await api.get(`/api/incidents/?suspect_alias__in=${encodeURIComponent(aliases)}&ordering=-Date`);
        const incidents = response.data.results || [];
        
                          // Group incidents by suspect alias
         const incidentsBySuspect: Record<string, Incident[]> = {};
         incidents.forEach((incident: Incident) => {
           if (incident.Suspects && Array.isArray(incident.Suspects)) {
             incident.Suspects.forEach((suspectAlias: string) => {
               if (!incidentsBySuspect[suspectAlias]) {
                 incidentsBySuspect[suspectAlias] = [];
               }
               incidentsBySuspect[suspectAlias].push(incident);
             });
           }
         });

         // Process results for each suspect
         const newIncidentsData: Record<string, { lastSeen: string; count: number }> = {};
         const newLoadingComplete: Record<string, boolean> = {};

         suspectsWithAlias.forEach(suspect => {
           const suspectIncidents = incidentsBySuspect[suspect.Alias] || [];
           
           // Sort incidents by date to find the most recent one
           const sortedIncidents = [...suspectIncidents].sort((a, b) => 
             new Date(b.Date).getTime() - new Date(a.Date).getTime()
           );
           
           // Get the most recent incident date if available
           const lastIncident = sortedIncidents[0];
           const lastSeen = lastIncident?.Date 
             ? new Date(lastIncident.Date).toLocaleDateString()
             : 'N/A';
            
          newIncidentsData[suspect.id] = {
            lastSeen,
            count: suspectIncidents.length
          };
          
          newLoadingComplete[suspect.id] = false;
        });
        
        setIncidentsData(prev => ({ ...prev, ...newIncidentsData }));
        setLoadingIncidents(prev => ({ ...prev, ...newLoadingComplete }));
        
      } catch (error) {
        console.error('Error fetching incidents for suspects:', error);
        
        // Set error state for all suspects
        const errorData: Record<string, { lastSeen: string; count: number }> = {};
        const errorLoading: Record<string, boolean> = {};
        
        suspectsWithAlias.forEach(suspect => {
          errorData[suspect.id] = {
            lastSeen: 'Error',
            count: 0
          };
          errorLoading[suspect.id] = false;
        });
        
        setIncidentsData(prev => ({ ...prev, ...errorData }));
        setLoadingIncidents(prev => ({ ...prev, ...errorLoading }));
      }
    };
    
    // Debounce the function to avoid multiple calls when suspects change rapidly
    const timeoutId = setTimeout(() => {
      fetchIncidentsForAllSuspects();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [apiSuspects]);

  // Helper function to get status name by ID
  const getStatusName = (statusId: number): string => {
    const status = suspectStatuses.find(s => s.id === statusId);
    return status?.Name || `Estado ${statusId}`;
  };

  // Helper function to get status variant for Badge
  const getStatusVariant = (statusId: number): "default" | "secondary" | "destructive" | "outline" => {
    // You can customize this logic based on your status IDs
    // For example: 1 = Libre (default), 2 = Detenido (destructive), etc.
    switch (statusId) {
      case 1:
        return 'default'; // Libre
      case 2:
        return 'destructive'; // Detenido
      default:
        return 'secondary';
    }
  };

  // Memoize the transformation to prevent unnecessary recalculations
  const suspects: SuspectUI[] = useMemo(() => {
    return apiSuspects.map(suspect => {
      const incidentsInfo = incidentsData[suspect.id] || { lastSeen: 'Cargando...', count: 0 };
      const isLoading = loadingIncidents[suspect.id] === true;
      
      return {
        id: suspect.id,
        name: suspect.Alias || 'Sin alias',
        alias: suspect.Alias || 'Sin alias',
        statusId: suspect.Status || 1,
        statusName: getStatusName(suspect.Status || 1),
        lastSeen: isLoading ? 'Cargando...' : incidentsInfo.lastSeen,
        incidents: incidentsInfo.count,
        photoUrl: suspect.PhotoUrl
      };
    });
  }, [apiSuspects, incidentsData, loadingIncidents, suspectStatuses, getStatusName]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('Page changed to:', newPage);
    setPage(newPage);
    fetchSuspects({
      page: newPage,
      pageSize,
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
        <Button onClick={() => router.push('/dashboard/sospechosos/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Sospechoso
        </Button>
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
                          <Link 
                            href={`/dashboard/sospechosos/${suspect.id}`}
                            className="font-medium hover:underline hover:text-primary"
                          >
                            {suspect.id.slice(-8)}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {suspect.alias}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {loadingStatuses ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          <span className="text-sm text-muted-foreground">Cargando...</span>
                        </div>
                      ) : (
                        <Badge variant={getStatusVariant(suspect.statusId)}>
                          {suspect.statusName}
                        </Badge>
                      )}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay sospechosos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => {
                const pageNum = i + 1;
                
                // Always show first and last page, current page, and 1 page around current
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis between gaps
                if (pageNum === 2 && page > 3) {
                  return <PaginationItem key="start-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                if (pageNum === pagination.totalPages - 1 && page < pagination.totalPages - 2) {
                  return <PaginationItem key="end-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < pagination.totalPages) handlePageChange(page + 1);
                  }}
                  className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Status and error indicators */}
      <div className="text-sm flex items-center justify-end gap-2 mt-2 min-h-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Cargando...</span>
          </div>
        ) : apiError ? (
          <div className="text-destructive">Error al cargar los sospechosos</div>
        ) : null}
      </div>
    </div>
  );
}
