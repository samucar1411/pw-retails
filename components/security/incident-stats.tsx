"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: number | string
  linkText?: string
  linkHref?: string
  icon?: React.ReactNode
}

export function StatCard({ title, value, linkText, linkHref, icon }: StatCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {linkText && (
          <a 
            href={linkHref || '#'} 
            className="text-xs text-emerald-500 hover:underline cursor-pointer"
          >
            {linkText}
          </a>
        )}
      </CardContent>
    </Card>
  )
}

interface IncidentStatsProps {
  total: number
  identified: number
  unidentified: number
  affectedBranches: number
}

export function IncidentStats({
  total,
  identified,
  unidentified,
  affectedBranches
}: IncidentStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de incidentes"
        value={total}
        linkText="Ver incidentes"
      />
      
      <StatCard
        title="Sospechosos identificados"
        value={identified}
        linkText="Ver sospechosos"
      />
      
      <StatCard
        title="Sospechosos no identificados"
        value={unidentified}
        linkText="Ver sospechosos"
      />
      
      <StatCard
        title="Sucursales afectadas"
        value={affectedBranches}
        linkText="Ver sucursales afectadas"
      />
    </div>
  )
}