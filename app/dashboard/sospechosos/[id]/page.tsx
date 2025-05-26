'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, use } from 'react';
import { getOffice } from '@/services/office-service';
import { getIncidentTypeWithCache } from '@/services/incident-type-service';
import { getCompanyById } from '@/services/company-service';
import { Office } from '@/types/office';
import { Company } from '@/types/company';
import { IncidentType as IncidentTypeDetails } from '@/types/incident';
import { default as UIMap } from '@/components/ui/map';
import { getSuspect } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';
import { api } from '@/services/api'; // Import the centralized API configuration
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface SuspectDetailPageProps {
  params: {
    id: string;
  };
}

export default function SuspectDetailPage(props: SuspectDetailPageProps) {
  const { id } = props.params;
  const suspectId = id;

  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state variables
  const [officeDetails, setOfficeDetails] = useState<Map<number, Office>>(new Map());
  const [mapLocations, setMapLocations] = useState<Array<{ 
    id: string | number; 
    lat: number; 
    lng: number; 
    title: string; 
    address?: string;
    logoUrl?: string;
    officeId?: number;
  }>>([]);
  const [incidentTypeNames, setIncidentTypeNames] = useState<Map<number, string>>(new Map());
  const [relatedSuspects, setRelatedSuspects] = useState<Suspect[]>([]); // Placeholder for now
  const [additionalDataLoading, setAdditionalDataLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState<Map<number, Company>>(new Map());
  const { resolvedTheme } = useTheme();

  // Define the Incident type
  type Incident = {
    id: string;
    Date: string;
    Description: string;
    TotalLoss: string;
    Time?: string;
    CashLoss?: string;
    MerchandiseLoss?: string;
    OtherLosses?: string;
    Notes?: string;
    Office?: number;
    IncidentType?: number;
    Suspects?: string[]; // Added based on types/incident.ts
  };

  useEffect(() => {
    async function loadSuspectAndIncidents() {
      setLoading(true);
      setIncidentsLoading(true);
      setAdditionalDataLoading(true);
      try {
        const data = await getSuspect(suspectId);
        if (!data) {
          setError('No se pudo encontrar el sospechoso');
          setLoading(false);
          setIncidentsLoading(false);
          setAdditionalDataLoading(false);
          return;
        }
        setSuspect(data);
        setLoading(false);

        // Load incidents
        if (data.Alias) {
          let fetchedIncidents: Incident[] = [];
          
          try {
            // Use the centralized API configuration instead of direct fetch
            const { data: incidentData } = await api.get('/api/incidents/', {
              params: { suspect_alias: data.Alias }
            });
            fetchedIncidents = incidentData.results || [];
            setIncidents(fetchedIncidents);
            setIncidentsLoading(false);
          } catch (incidentError) {
            console.error('Error fetching incidents:', incidentError);
            setIncidentsLoading(false);
            throw new Error('Failed to fetch incidents');
          }

          // After incidents are loaded, fetch additional details
          if (fetchedIncidents.length > 0) {
            // Fetch Incident Type Details
            const incidentTypeIds = [...new Set(fetchedIncidents.map(inc => inc.IncidentType).filter(id => id !== undefined))] as number[];
            const typePromises = incidentTypeIds.map(id => getIncidentTypeWithCache(id));
            const fetchedTypes = (await Promise.all(typePromises)).filter(Boolean) as IncidentTypeDetails[];
            
            const newIncidentTypeNames = new Map<number, string>();
            fetchedTypes.forEach(type => {
              if (type && type.id) newIncidentTypeNames.set(type.id, type.Name || `Tipo ${type.id}`);
            });
            setIncidentTypeNames(newIncidentTypeNames);
            
            // Fetch Office Details for Map
            const officeIds = [...new Set(fetchedIncidents.map(inc => inc.Office).filter(id => id !== undefined))] as number[];
            const officePromises = officeIds.map(id => getOffice(id));
            const fetchedOffices = (await Promise.all(officePromises)).filter(Boolean) as Office[];
            
            const newOfficeDetails = new Map<number, Office>();
            const newMapLocations: Array<{ 
              id: string | number; 
              lat: number; 
              lng: number; 
              title: string; 
              address?: string;
              logoUrl?: string;
              officeId?: number;
            }> = [];

            // Fetch company details for logos
            const companyIds = [...new Set(fetchedOffices.map(office => office.Company))];
            const companyPromises = companyIds.map(id => getCompanyById(id.toString()));
            const fetchedCompanies = (await Promise.all(companyPromises)).filter(Boolean) as Company[];
            
            const newCompanyDetails = new Map<number, Company>();
            fetchedCompanies.forEach(company => {
              if (company && company.id) {
                newCompanyDetails.set(parseInt(company.id), company);
              }
            });
            setCompanyDetails(newCompanyDetails);
            
            fetchedOffices.forEach(office => {
              if (office && office.id) newOfficeDetails.set(office.id, office);
              if (office && office.Geo) {
                const [latStr, lngStr] = office.Geo.split(',');
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                if (!isNaN(lat) && !isNaN(lng)) {
                  // Get company logo if available
                  const company = newCompanyDetails.get(office.Company);
                  const logoUrl = company?.image_url || '';
                  
                  newMapLocations.push({
                    id: office.id,
                    lat,
                    lng,
                    title: office.Name || office.Address || `Oficina ${office.id}`,
                    address: office.Address,
                    logoUrl,
                    officeId: office.id
                  });
                }
              }
            });
            setOfficeDetails(newOfficeDetails);
            setMapLocations(newMapLocations);
            
            // Fetch related suspects (placeholder for now)
            // This would be implemented based on your API structure
            // For now, we'll just set an empty array
            setRelatedSuspects([]);
            
            setAdditionalDataLoading(false);
          } else {
            setAdditionalDataLoading(false);
          }
        } else {
          setIncidentsLoading(false);
          setAdditionalDataLoading(false);
        }
      } catch (error) {
        console.error('Error loading suspect details:', error);
        setError('Error al cargar los detalles del sospechoso');
        setLoading(false);
        setIncidentsLoading(false);
        setAdditionalDataLoading(false);
      }
    }
    
    loadSuspectAndIncidents();
  }, [suspectId]);
  
  // Helper to group incidents by type for display
  function getGroupedIncidents() {
    const grouped: Record<string, number> = {};
    incidents.forEach(incident => {
      if (incident.IncidentType && incidentTypeNames.has(incident.IncidentType)) {
        const typeName = incidentTypeNames.get(incident.IncidentType) || 'Desconocido';
        grouped[typeName] = (grouped[typeName] || 0) + 1;
      }
    });
    return grouped;
  }

  const groupedIncidents = getGroupedIncidents();

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 flex items-center justify-center h-64">
        <p>Cargando detalles del sospechoso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!suspect) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>No se encontró información del sospechoso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/sospechosos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">
            {suspect.Name || suspect.Alias || 'Sospechoso sin nombre'}
          </h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/sospechosos/${suspectId}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {/* Row 1, Column 1: Suspect Information */}
        <Card className="border border-muted h-full">
          <CardHeader className="bg-muted/30 border-b border-muted pb-3">
            <CardTitle className="flex items-center text-base">
              <div className="p-1 bg-primary text-primary-foreground text-xs mr-2">FICHA</div>
              Información del Sospechoso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col items-center mb-4">
              {suspect.PhotoUrl ? (
                <div className="relative w-full max-w-[200px] h-[250px] border-2 border-muted overflow-hidden bg-muted/20">
                  <div className="relative w-full h-full">
                    <Image 
                      src={suspect.PhotoUrl} 
                      alt={suspect.Alias || 'Foto del sospechoso'} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="200px"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                    ID: {suspectId.substring(0, 8)}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[200px] h-[250px] border-2 border-muted flex items-center justify-center bg-muted/20">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              <div className="mt-4 w-full">
                <div className="flex flex-col gap-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">ID</p>
                    <div className="font-mono text-xs bg-muted p-1 rounded mt-1 truncate">{suspect.id}</div>
                  </div>
                  
                  <div className="border-b pb-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Alias</p>
                    <p className="font-bold text-base truncate">{suspect.Alias || 'Sin alias'}</p>
                  </div>
                  
                  <div className="border-b pb-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Estado</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={suspect.Status === 1 ? 'default' : 'secondary'} className="mr-2">
                        {suspect.Status === 1 ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {suspect.StatusDetails?.Name && (
                        <span className="text-sm">{suspect.StatusDetails.Name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-b pb-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Descripción Física</p>
                    <p className="text-sm mt-1">{suspect.PhysicalDescription || 'Sin descripción'}</p>
                  </div>
                  
                  {/* Incident Types - Moved from separate card */}
                  {!additionalDataLoading && Object.keys(groupedIncidents).length > 0 && (
                    <div className=" pb-2">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Tipos de Incidentes</p>
                      <div className="space-y-1 mt-1">
                        {Object.entries(groupedIncidents).map(([typeName, count]) => (
                          <div key={typeName} className="flex justify-between items-center text-sm">
                            <span className="truncate mr-2">{typeName}</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 whitespace-nowrap">
                              {count} {count === 1 ? 'incidente' : 'incidentes'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 1, Column 2: Offices Map */}
        {mapLocations.length > 0 && (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Oficinas Involucradas</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="w-full h-full min-h-[350px]">
                <UIMap 
                locations={mapLocations.map(location => ({
                  ...location,
                  popupContent: (
                    `<div class="p-2">
                      ${location.logoUrl ? `<img src="${location.logoUrl}" alt="Logo" class="h-8 mb-2" />` : ''}
                      <h3 class="font-bold">${location.title}</h3>
                      ${location.address ? `<p class="text-sm">${location.address}</p>` : ''}
                      ${location.officeId ? `<a href="/dashboard/offices/${location.officeId}" class="text-${resolvedTheme === 'dark' ? 'blue-400' : 'blue-600'} text-xs hover:underline">Ver detalles</a>` : ''}
                    </div>`
                  )
                }))} 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Row 2, Column 1: Incidents */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Incidentes Relacionados</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {incidentsLoading ? (
              <p>Cargando incidentes...</p>
            ) : incidents.length > 0 ? (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {incidents.map((incident) => (
                  <Link 
                    href={`/dashboard/incidents/${incident.id}`} 
                    key={incident.id} 
                    className="block border border-muted p-3 rounded-md hover:bg-muted/5 transition-colors no-underline"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          {incident.IncidentType && incidentTypeNames.get(incident.IncidentType) ? (
                            <Badge variant="outline" className="font-normal">
                              {incidentTypeNames.get(incident.IncidentType)}
                            </Badge>
                          ) : null}
                          <span className="text-sm whitespace-nowrap">
                            {incident.Date && format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}
                            {incident.Time && ` ${incident.Time.substring(0, 5)}`}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {incident.Description || 'Sin descripción'}
                        </div>
                        {incident.Office && officeDetails.get(incident.Office) && (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="truncate">{officeDetails.get(incident.Office)?.Name || `Oficina ${incident.Office}`}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-destructive whitespace-nowrap">
                          ${parseFloat(incident.TotalLoss || '0').toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No se encontraron incidentes relacionados</p>
            )}
          </CardContent>
        </Card>
        
        {/* Row 2, Column 2: Related Suspects */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Otros Sospechosos Involucrados</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {additionalDataLoading ? (
              <p className="text-muted-foreground">Buscando otros sospechosos...</p>
            ) : relatedSuspects.length > 0 ? (
              <ul className="space-y-3">
                {relatedSuspects.map(rs => (
                  <li key={rs.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {rs.PhotoUrl ? (
                        <Image 
                          src={rs.PhotoUrl} 
                          alt={rs.Name || 'Sospechoso'}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/dashboard/sospechosos/${rs.id}`} className="font-medium hover:underline text-primary">
                        {rs.Name || 'Sospechoso sin nombre'}
                      </Link>
                      {rs.Alias && <p className="text-xs text-muted-foreground">{rs.Alias}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No se encontraron otros sospechosos en estos incidentes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
