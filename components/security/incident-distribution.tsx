"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface IncidentDistributionProps {
  period?: string
  data?: Array<{
    name: string
    value: number
    color: string
  }>
}

export function IncidentDistribution({ 
  period = "Enero - Abril 2025",
  data = [
    { name: "Hurto", value: 45, color: "#ef4444" },
    { name: "Robo", value: 25, color: "#f97316" },
    { name: "Vandalismo", value: 15, color: "#eab308" },
    { name: "Otros", value: 15, color: "#3b82f6" },
  ] 
}: IncidentDistributionProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Distribución de incidentes</CardTitle>
        <p className="text-sm text-muted-foreground">{period}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} incidentes`, "Cantidad"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}