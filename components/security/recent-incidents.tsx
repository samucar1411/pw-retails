"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Incident {
  id: string
  date: string
  branch: string
  type: string | string[]
  status: "Abierto" | "Cerrado" | "En proceso"
}

interface RecentIncidentsProps {
  incidents: Incident[]
  period?: string
  onViewAll?: () => void
  onViewDetail?: (id: string) => void
}

export function RecentIncidents({ 
  incidents, 
  period = "Enero - Abril 2025",
  onViewAll,
  onViewDetail
}: RecentIncidentsProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Incidentes recientes</CardTitle>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Delito</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.id}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {incident.branch}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {Array.isArray(incident.type) ? (
                      incident.type.map((type, index) => (
                        <Badge key={index} variant="destructive" className="rounded-sm">{type}</Badge>
                      ))
                    ) : (
                      <Badge variant="destructive" className="rounded-sm">{incident.type}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="default" 
                    className={`
                      ${incident.status === "Abierto" ? "bg-emerald-500" : ""}
                      ${incident.status === "Cerrado" ? "bg-gray-500" : ""}
                      ${incident.status === "En proceso" ? "bg-amber-500" : ""}
                    `}
                  >
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={() => onViewDetail && onViewDetail(incident.id)}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}