import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "./chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartConfig } from "./chart";
import React from "react";

type StoryArgs = {
  data: { name: string; value?: number; value1?: number; value2?: number }[];
  colors: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  config: ChartConfig;
};

const meta = {
  title: "Components/Chart",
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: "Datos del gráfico",
    },
    colors: {
      control: "object",
      description: "Colores del gráfico",
    },
    showTooltip: {
      control: "boolean",
      description: "Mostrar u ocultar tooltip",
    },
    showLegend: {
      control: "boolean",
      description: "Mostrar u ocultar leyenda",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el gráfico",
    },
    config: {
      control: "object",
      description: "Configuración del gráfico",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Configuración de colores y temas
const defaultConfig: ChartConfig = {
  value: {
    label: "Valor",
    color: "#8884d8",
  },
  value1: {
    label: "Valor 1",
    color: "#82ca9d",
  },
  value2: {
    label: "Valor 2",
    color: "#ff8042",
  },
};

// Gráfico de línea básico
export const LineChartExample: Story = {
  render: (args) => (
    <ChartContainer config={args.config} className={args.className}>
      <LineChart width={500} height={300} data={args.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {args.showTooltip && (
          <Tooltip content={<ChartTooltipContent />} />
        )}
        {args.showLegend && (
          <Legend content={<ChartLegendContent />} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={args.colors[0]}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ChartContainer>
  ),
  args: {
    data: [
      { name: "Enero", value: 400 },
      { name: "Febrero", value: 300 },
      { name: "Marzo", value: 200 },
      { name: "Abril", value: 278 },
      { name: "Mayo", value: 189 },
      { name: "Junio", value: 239 },
      { name: "Julio", value: 349 },
    ],
    colors: ["#8884d8"],
    showTooltip: true,
    showLegend: true,
    className: "",
    config: defaultConfig,
  },
};

// Gráfico de línea con múltiples líneas
export const MultipleLines: Story = {
  render: (args) => (
    <ChartContainer config={args.config} className={args.className}>
      <LineChart width={500} height={300} data={args.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {args.showTooltip && (
          <Tooltip content={<ChartTooltipContent />} />
        )}
        {args.showLegend && (
          <Legend content={<ChartLegendContent />} />
        )}
        <Line
          type="monotone"
          dataKey="value1"
          stroke={args.colors[0]}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="value2"
          stroke={args.colors[1]}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ChartContainer>
  ),
  args: {
    data: [
      { name: "Enero", value1: 400, value2: 240 },
      { name: "Febrero", value1: 300, value2: 139 },
      { name: "Marzo", value1: 200, value2: 980 },
      { name: "Abril", value1: 278, value2: 390 },
      { name: "Mayo", value1: 189, value2: 480 },
      { name: "Junio", value1: 239, value2: 380 },
      { name: "Julio", value1: 349, value2: 430 },
    ],
    colors: ["#8884d8", "#82ca9d"],
    showTooltip: true,
    showLegend: true,
    className: "",
    config: defaultConfig,
  },
};

// Gráfico de línea sin tooltip
export const WithoutTooltip: Story = {
  render: (args) => (
    <ChartContainer config={args.config} className={args.className}>
      <LineChart width={500} height={300} data={args.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {args.showLegend && (
          <Legend content={<ChartLegendContent />} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={args.colors[0]}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ChartContainer>
  ),
  args: {
    data: [
      { name: "Enero", value: 400 },
      { name: "Febrero", value: 300 },
      { name: "Marzo", value: 200 },
      { name: "Abril", value: 278 },
      { name: "Mayo", value: 189 },
      { name: "Junio", value: 239 },
      { name: "Julio", value: 349 },
    ],
    colors: ["#8884d8"],
    showTooltip: false,
    showLegend: true,
    className: "",
    config: defaultConfig,
  },
};

// Gráfico de línea sin leyenda
export const WithoutLegend: Story = {
  render: (args) => (
    <ChartContainer config={args.config} className={args.className}>
      <LineChart width={500} height={300} data={args.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {args.showTooltip && (
          <Tooltip content={<ChartTooltipContent />} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={args.colors[0]}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ChartContainer>
  ),
  args: {
    data: [
      { name: "Enero", value: 400 },
      { name: "Febrero", value: 300 },
      { name: "Marzo", value: 200 },
      { name: "Abril", value: 278 },
      { name: "Mayo", value: 189 },
      { name: "Junio", value: 239 },
      { name: "Julio", value: 349 },
    ],
    colors: ["#8884d8"],
    showTooltip: true,
    showLegend: false,
    className: "",
    config: defaultConfig,
  },
};

// Gráfico de línea con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <ChartContainer config={args.config} className={args.className}>
      <LineChart width={500} height={300} data={args.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {args.showTooltip && (
          <Tooltip content={<ChartTooltipContent />} />
        )}
        {args.showLegend && (
          <Legend content={<ChartLegendContent />} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={args.colors[0]}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ChartContainer>
  ),
  args: {
    data: [
      { name: "Enero", value: 400 },
      { name: "Febrero", value: 300 },
      { name: "Marzo", value: 200 },
      { name: "Abril", value: 278 },
      { name: "Mayo", value: 189 },
      { name: "Junio", value: 239 },
      { name: "Julio", value: 349 },
    ],
    colors: ["#8884d8"],
    showTooltip: true,
    showLegend: true,
    className: "bg-gray-100 p-6 rounded-lg",
    config: defaultConfig,
  },
};