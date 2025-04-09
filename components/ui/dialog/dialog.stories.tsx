import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";
import { Button } from "@/components/ui/button/button";
import React from "react";

type StoryArgs = {
  title?: string;
  description?: string;
  className?: string;
};

const meta = {
  title: "Components/Dialog",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Título del diálogo",
    },
    description: {
      control: "text",
      description: "Descripción del diálogo",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el diálogo",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Diálogo básico
export const Default: Story = {
  args: {
    title: "Título del diálogo",
    description: "Descripción del diálogo",
    className: "",
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent className={args.className}>
        <DialogHeader>
          <DialogTitle>{args.title}</DialogTitle>
          <DialogDescription>{args.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Contenido del diálogo</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Diálogo con contenido personalizado
export const WithCustomContent: Story = {
  args: {
    title: "Título del diálogo",
    description: "Descripción del diálogo",
    className: "",
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent className={args.className}>
        <DialogHeader>
          <DialogTitle>{args.title}</DialogTitle>
          <DialogDescription>{args.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Este es un contenido personalizado dentro del diálogo.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Diálogo sin título ni descripción
export const WithoutHeader: Story = {
  args: {
    className: "",
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir diálogo</Button>
      </DialogTrigger>
      <DialogContent className={args.className}>
        <div className="grid gap-4 py-4">
          <p>Este diálogo no tiene título ni descripción.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};