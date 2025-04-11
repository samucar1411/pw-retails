import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RecentClient {
  id: string;
  name: string;
  date: string;
  sucursales: number;
  logo?: string;
  image_url?: string;
}

interface RecentClientsProps {
  clients: RecentClient[];
  loading?: boolean;
}

export function RecentClients({ clients, loading = false }: RecentClientsProps) {
  // Si está cargando, mostrar un estado de carga
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Clientes recientes</CardTitle>
          <Link
            href="/dashboard/clientes"
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Clientes recientes</CardTitle>
        <Link
          href="/dashboard/clientes"
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className="space-y-8">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center">
            <div className="space-y-1 flex-grow">
              <p className="text-sm font-medium leading-none">{client.name}</p>
              <p className="text-sm text-muted-foreground">
                Registrado el {new Date(client.date).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-auto font-medium flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{client.sucursales} sucursales</span>
            </div>
          </div>
        ))}
        
        {clients.length === 0 && !loading && (
          <div className="text-center py-4 text-muted-foreground">
            No hay clientes recientes para mostrar
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Link 
            href="/dashboard/clientes" 
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos los clientes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
