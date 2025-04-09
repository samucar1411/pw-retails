import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
import { Button } from "@/components/ui/button/button";
import React from "react";

type StoryArgs = {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  triggerText?: string;
  contentText?: string;
};

const meta = {
  title: "Components/HoverCard",
  component: HoverCardContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alineación del contenido",
    },
    sideOffset: {
      control: "number",
      description: "Desplazamiento lateral del contenido",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el contenido",
    },
    triggerText: {
      control: "text",
      description: "Texto del botón que activa el HoverCard",
    },
    contentText: {
      control: "text",
      description: "Texto del contenido del HoverCard",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Tarjeta flotante básica
export const Default: Story = {
  args: {
    align: "center",
    sideOffset: 4,
    className: "",
    triggerText: "Hover me",
    contentText: "This is the content of the hover card.",
  },
  render: (args) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button>{args.triggerText}</Button>
      </HoverCardTrigger>
      <HoverCardContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
        <p>{args.contentText}</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

// Tarjeta flotante con contenido personalizado
export const WithCustomContent: Story = {
  args: {
    align: "center",
    sideOffset: 4,
    className: "",
    triggerText: "Hover me",
    contentText: "This is a custom content inside the hover card.",
  },
  render: (args) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button>{args.triggerText}</Button>
      </HoverCardTrigger>
      <HoverCardContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Título</h3>
          <p className="text-sm">{args.contentText}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

// Tarjeta flotante con alineación personalizada
export const WithCustomAlignment: Story = {
  args: {
    align: "end",
    sideOffset: 4,
    className: "",
    triggerText: "Hover me",
    contentText: "This content is aligned to the right.",
  },
  render: (args) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button>{args.triggerText}</Button>
      </HoverCardTrigger>
      <HoverCardContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
        <p>{args.contentText}</p>
      </HoverCardContent>
    </HoverCard>
  ),
};
