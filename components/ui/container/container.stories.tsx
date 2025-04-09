import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "./container";
import React from "react";

type StoryArgs = {
  children: React.ReactNode;
  className?: string;
};

const meta = {
  title: "Components/Container",
  component: Container,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: {
      control: "text",
      description: "Contenido del contenedor",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el contenedor",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Contenedor básico
export const Default: Story = {
  args: {
    children: "Este es un contenedor básico.",
    className: "",
  },
  render: (args) => (
    <Container className={args.className}>{args.children}</Container>
  ),
};

// Contenedor con contenido personalizado
export const WithCustomContent: Story = {
  args: {
    children: (
      <div className="bg-blue-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold">Contenido Personalizado</h2>
        <p className="text-gray-700">
          Este es un ejemplo de contenido personalizado dentro del contenedor.
        </p>
      </div>
    ),
    className: "",
  },
  render: (args) => (
    <Container className={args.className}>{args.children}</Container>
  ),
};

// Contenedor con clases personalizadas
export const WithCustomClass: Story = {
  args: {
    children: "Este contenedor tiene clases personalizadas.",
    className: "bg-gray-100 p-6 rounded-lg shadow-md",
  },
  render: (args) => (
    <Container className={args.className}>{args.children}</Container>
  ),
};

// Contenedor con contenido largo
export const WithLongContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Contenido Largo</h2>
        <p className="text-gray-700">
          Este es un ejemplo de un contenedor con contenido largo. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
          ex ea commodo consequat.
        </p>
        <p className="text-gray-700">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </div>
    ),
    className: "",
  },
  render: (args) => (
    <Container className={args.className}>{args.children}</Container>
  ),
};