import type { Meta, StoryObj } from "@storybook/react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./drawer";
import { Button } from "@/components/ui/button/button";
import React from "react";

type StoryArgs = {
  title?: string;
  description?: string;
  className?: string;
  shouldScaleBackground?: boolean;
};

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Título del cajón",
    },
    description: {
      control: "text",
      description: "Descripción del cajón",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el cajón",
    },
    shouldScaleBackground: {
      control: "boolean",
      description: "Escalar el fondo al abrir el cajón",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Cajón básico
export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Título del cajón",
    description: "Descripción del cajón",
    className: "",
    shouldScaleBackground: true,
  },
  render: (args) => (
    <Drawer shouldScaleBackground={args.shouldScaleBackground}>
      <DrawerTrigger asChild>
        <Button>Abrir cajón</Button>
      </DrawerTrigger>
      <DrawerContent className={args.className}>
        <DrawerHeader>
          <DrawerTitle>{args.title}</DrawerTitle>
          <DrawerDescription>{args.description}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Contenido del cajón</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
          <Button>Guardar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// Cajón con contenido personalizado
export const WithCustomContent: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Título del cajón",
    description: "Descripción del cajón",
    className: "",
    shouldScaleBackground: true,
  },
  render: (args) => (
    <Drawer shouldScaleBackground={args.shouldScaleBackground}>
      <DrawerTrigger asChild>
        <Button>Abrir cajón</Button>
      </DrawerTrigger>
      <DrawerContent className={args.className}>
        <DrawerHeader>
          <DrawerTitle>{args.title}</DrawerTitle>
          <DrawerDescription>{args.description}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Este es un contenido personalizado dentro del cajón.</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
          <Button>Guardar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

// Cajón sin título ni descripción
export const WithoutHeader: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    className: "",
    shouldScaleBackground: true,
  },
  render: (args) => (
    <Drawer shouldScaleBackground={args.shouldScaleBackground}>
      <DrawerTrigger asChild>
        <Button>Abrir cajón</Button>
      </DrawerTrigger>
      <DrawerContent className={args.className}>
        <div className="p-4">
          <p>Este cajón no tiene título ni descripción.</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
          <Button>Guardar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};