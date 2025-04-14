"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SalesData {
  name: string;
  clientes: number;
  ventas: number;
}

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="clientes" 
          stroke="hsl(var(--primary))" 
          name="Clientes registrados"
        />
        <Line 
          type="monotone" 
          dataKey="ventas" 
          stroke="hsl(var(--chart-2))" 
          name="Ventas Totales"
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 