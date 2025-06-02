"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "visor-ui"
import * as RechartsPrimitive from "recharts"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  )
}

type ChartContainerProps = {
  title: string
  description?: string
  config: ChartConfig
  children: React.ReactElement
}

const ChartContainer = ({
  title,
  description,
  config,
  children,
}: ChartContainerProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <ChartContext.Provider value={{ config }}>
            <div className="w-full h-[300px]">
              <RechartsPrimitive.ResponsiveContainer>
                {children}
              </RechartsPrimitive.ResponsiveContainer>
            </div>
          </ChartContext.Provider>
        </div>
      </CardContent>
    </Card>
  )
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartLegend = RechartsPrimitive.Legend

export { ChartContainer, ChartTooltip, ChartLegend }