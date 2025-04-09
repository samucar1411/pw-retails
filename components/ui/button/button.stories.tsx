import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

type StoryArgs = {
  text: string;
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  className?: string;
};

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    text: {
      control: "text",
      description: "Texto que se muestra dentro del botón",
    },
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante de estilo del botón",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Tamaño del botón",
    },
    isLoading: {
      control: "boolean",
      description: "Indica si el botón está en estado de carga",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el botón",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Botón con variante por defecto
export const Default: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Click me",
    variant: "default",
    size: "default",
    isLoading: false,
    className: "",
  },
};

// Botón con variante destructiva
export const Destructive: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Delete",
    variant: "destructive",
    size: "default",
    isLoading: false,
    className: "",
  },
};

// Botón con variante outline
export const Outline: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Outline",
    variant: "outline",
    size: "default",
    isLoading: false,
    className: "",
  },
};

// Botón con variante secondary
export const Secondary: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Secondary",
    variant: "secondary",
    size: "default",
    isLoading: false,
    className: "",
  },
};

// Botón con estado de carga
export const Loading: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Loading",
    variant: "default",
    size: "default",
    isLoading: true,
    className: "",
  },
};

// Botón con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Custom Class",
    variant: "default",
    size: "default",
    isLoading: false,
    className: "bg-purple-500 text-white",
  },
};

// Botón con tamaño pequeño
export const Small: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Small",
    variant: "default",
    size: "sm",
    isLoading: false,
    className: "",
  },
};

// Botón con tamaño grande
export const Large: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Large",
    variant: "default",
    size: "lg",
    isLoading: false,
    className: "",
  },
};

// Botón con tamaño icono
export const Icon: Story = {
  render: (args) => (
    <Button variant={args.variant} size={args.size} isLoading={args.isLoading} className={args.className}>
      {args.text}
    </Button>
  ),
  args: {
    text: "Icon",
    variant: "default",
    size: "icon",
    isLoading: false,
    className: "",
  },
};