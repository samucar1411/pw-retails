import { useMemo } from 'react';
import { Incident } from '@/types/incident';
import { Office } from '@/types/office';
import { Company } from '@/types/company';

interface UseIncidentsMapProps {
  incidents: Incident[];
  offices: Office[];
  companies?: Company[];
}

export function useIncidentsMap({ incidents, offices, companies = [] }: UseIncidentsMapProps) {
  
  const mapLocations = useMemo(() => {
    return incidents
      .filter(incident => {
        // Filter incidents that have valid geo coordinates
        const office = typeof incident.Office === 'number' 
          ? offices.find(o => o.id === incident.Office)
          : incident.Office;
        
        if (!office?.Geo) return false;
        
        try {
          const geo = JSON.parse(office.Geo);
          return geo && (geo.lat || geo.latitude || Array.isArray(geo));
        } catch {
          return false;
        }
      })
      .map(incident => {
        const office = typeof incident.Office === 'number' 
          ? offices.find(o => o.id === incident.Office)
          : incident.Office;
        
        if (!office) return null;
        
        // Parse geo coordinates
        let lat: number, lng: number;
        try {
          const geo = JSON.parse(office.Geo!);
          
          if (geo.lat && geo.lng) {
            lat = geo.lat;
            lng = geo.lng;
          } else if (geo.latitude && geo.longitude) {
            lat = geo.latitude;
            lng = geo.longitude;
          } else if (Array.isArray(geo) && geo.length >= 2) {
            lng = geo[0]; // GeoJSON format [lng, lat]
            lat = geo[1];
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error parsing geo coordinates for office:', office.id, error);
          return null;
        }

        // Find company logo
        const company = companies.find(c => c.id === office.Company?.toString());
        const logoUrl = company?.image_url;

        // Calculate incident severity based on total loss
        const totalLoss = parseFloat(incident.TotalLoss || '0');
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (totalLoss > 10000000) { // > 10M Guaraníes
          severity = 'high';
        } else if (totalLoss > 1000000) { // > 1M Guaraníes
          severity = 'medium';
        }

        // Get incident status based on data
        const getIncidentStatus = (incident: Incident): string => {
          // Logic to determine status based on incident data
          if (incident.Suspects && incident.Suspects.length > 0) {
            return 'Con sospechosos';
          }
          return 'Reportado';
        };

        // Get incident type name
        const getIncidentTypeName = (typeId: number): string => {
          const types: Record<number, string> = {
            1: 'Delito económico',
            2: 'Asalto a mano armada',
            3: 'Vandalismo',
            4: 'Fraude',
            5: 'Robo',
            6: 'Otro'
          };
          return types[typeId] || `Tipo ${typeId}`;
        };

        return {
          id: incident.id,
          lat,
          lng,
          title: office.Name,
          description: `Incidente ${getIncidentTypeName(incident.IncidentType)} reportado`,
          address: office.Address,
          logoUrl,
          officeId: office.id,
          incidentData: {
            id: incident.id,
            date: incident.Date,
            time: incident.Time,
            incidentType: getIncidentTypeName(incident.IncidentType),
            totalLoss: incident.TotalLoss,
            suspectCount: incident.Suspects?.length || 0,
            status: getIncidentStatus(incident),
            severity
          }
        };
      })
      .filter((location): location is NonNullable<typeof location> => location !== null);
  }, [incidents, offices, companies]);

  const stats = useMemo(() => {
    const totalIncidents = mapLocations.length;
    const totalLoss = mapLocations.reduce((sum, location) => {
      return sum + parseFloat(location.incidentData?.totalLoss || '0');
    }, 0);
    
    const severityCount = mapLocations.reduce((acc, location) => {
      const severity = location.incidentData?.severity || 'low';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueOffices = new Set(mapLocations.map(l => l.officeId)).size;

    return {
      totalIncidents,
      totalLoss,
      severityCount,
      uniqueOffices,
      hasValidLocations: totalIncidents > 0
    };
  }, [mapLocations]);

  return {
    mapLocations,
    stats,
    hasValidData: mapLocations.length > 0
  };
}