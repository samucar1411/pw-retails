import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Building, UserMinus } from "lucide-react"
import Link from "next/link"

interface StatsCardsProps {
  facturacion: number
  clientesActivos: number
  sucursalesActivas: number
  clientesInactivos: number
}

export function StatsCards({ 
  facturacion, 
  clientesActivos, 
  sucursalesActivas, 
  clientesInactivos 
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturación Total</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('es-PY', {
              style: 'currency',
              currency: 'PYG',
              maximumFractionDigits: 0
            }).format(facturacion)}
          </div>
          <Link href="/dashboard/facturacion" className="text-xs text-primary hover:underline">
            Ver facturación
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientesActivos}</div>
          <Link href="/dashboard/clientes" className="text-xs text-primary hover:underline">
            Ver clientes
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sucursales activas</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sucursalesActivas}</div>
          <Link href="/dashboard/sucursales" className="text-xs text-primary hover:underline">
            Ver sucursales
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes inactivos</CardTitle>
          <UserMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientesInactivos}</div>
          <Link href="/dashboard/clientes?status=inactive" className="text-xs text-primary hover:underline">
            Ver clientes
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 