import type { Meta, StoryObj } from "@storybook/react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
import { Button } from "@/components/ui/button/button";
import React from "react";

type StoryArgs = {
  isOpen?: boolean;
  triggerText: string;
  content: string;
  className?: string;
};

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Estado del collapsible (abierto/cerrado)",
    },
    triggerText: {
      control: "text",
      description: "Texto del botón que abre/cierra el collapsible",
    },
    content: {
      control: "text",
      description: "Contenido del collapsible",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el collapsible",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Collapsible básico
export const Default: Story = {
  render: (args) => (
    <Collapsible open={args.isOpen} className={args.className}>
      <CollapsibleTrigger asChild>
        <Button>{args.triggerText}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>{args.content}</CollapsibleContent>
    </Collapsible>
  ),
  args: {
    isOpen: false,
    triggerText: "Toggle Collapsible",
    content: "This is the content inside the collapsible.",
    className: "",
  },
};

// Collapsible abierto por defecto
export const OpenByDefault: Story = {
  render: (args) => (
    <Collapsible open={args.isOpen} className={args.className}>
      <CollapsibleTrigger asChild>
        <Button>{args.triggerText}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>{args.content}</CollapsibleContent>
    </Collapsible>
  ),
  args: {
    isOpen: true,
    triggerText: "Toggle Collapsible",
    content: "This is the content inside the collapsible.",
    className: "",
  },
};

// Collapsible con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Collapsible open={args.isOpen} className={args.className}>
      <CollapsibleTrigger asChild>
        <Button>{args.triggerText}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-gray-100 rounded-lg">
        {args.content}
      </CollapsibleContent>
    </Collapsible>
  ),
  args: {
    isOpen: false,
    triggerText: "Toggle Collapsible",
    content: "This is the content inside the collapsible.",
    className: "w-full max-w-md",
  },
};