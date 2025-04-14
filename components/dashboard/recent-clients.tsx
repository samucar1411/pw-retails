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
}

export function RecentClients({ clients }: RecentClientsProps) {
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
        {clients.map((client) => (
          <div key={client.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {client.logo ? (
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <Building className="h-6 w-6" />
                )}
              </Avatar>
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-muted-foreground">
                  {client.date}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {client.sucursales} sucursales
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
