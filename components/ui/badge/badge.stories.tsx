import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

type StoryArgs = {
  text: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success";
  className?: string;
};

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    text: {
      control: "text",
      description: "Texto que se muestra dentro del badge",
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success"],
      description: "Variante de estilo del badge",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el badge",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Badge con variante por defecto
export const Default: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Default Badge",
    variant: "default",
    className: "",
  },
};

// Badge con variante secondary
export const Secondary: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Secondary Badge",
    variant: "secondary",
    className: "",
  },
};

// Badge con variante destructive
export const Destructive: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Destructive Badge",
    variant: "destructive",
    className: "",
  },
};

// Badge con variante outline
export const Outline: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Outline Badge",
    variant: "outline",
    className: "",
  },
};

// Badge con variante success
export const Success: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Success Badge",
    variant: "success",
    className: "",
  },
};

// Badge personalizado con clases adicionales
export const CustomClass: Story = {
  render: (args) => (
    <Badge variant={args.variant} className={args.className}>
      {args.text}
    </Badge>
  ),
  args: {
    text: "Custom Badge",
    variant: "default",
    className: "bg-purple-500 text-white",
  },
};