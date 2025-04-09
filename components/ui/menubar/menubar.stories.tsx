import type { Meta, StoryObj } from "@storybook/react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
} from "./menubar";
import React from "react";

type StoryArgs = {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  inset?: boolean;
  triggerText?: string;
};

const meta = {
  title: "Components/Menubar",
  component: Menubar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alineación del menú",
    },
    sideOffset: {
      control: "number",
      description: "Desplazamiento lateral del menú",
    },
    className: {
      control: "text",
      description: "Clases adicionales para el menú",
    },
    inset: {
      control: "boolean",
      description: "Si el elemento tiene sangría",
    },
    triggerText: {
      control: "text",
      description: "Texto del botón",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Menubar básico
export const Default: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    inset: false,
    triggerText: "Archivo",
  },
  render: (args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>{args.triggerText}</MenubarTrigger>
        <MenubarContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
          <MenubarItem>
            Nuevo archivo <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Abrir archivo <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Guardar <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

// Menubar con submenú
export const WithSubMenu: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    inset: false,
    triggerText: "Editar",
  },
  render: (args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>{args.triggerText}</MenubarTrigger>
        <MenubarContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
          <MenubarItem>
            Deshacer <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Rehacer <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Herramientas</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Formatear código</MenubarItem>
              <MenubarItem>Optimizar</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

// Menubar con checkbox y radio
export const WithCheckboxAndRadio: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    inset: false,
    triggerText: "Ver",
  },
  render: (args) => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>{args.triggerText}</MenubarTrigger>
        <MenubarContent align={args.align} sideOffset={args.sideOffset} className={args.className}>
          <MenubarCheckboxItem checked>
            Mostrar barra de herramientas
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            Mostrar barra de estado
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value="light">
            <MenubarLabel>Tema</MenubarLabel>
            <MenubarRadioItem value="light">Claro</MenubarRadioItem>
            <MenubarRadioItem value="dark">Oscuro</MenubarRadioItem>
            <MenubarRadioItem value="system">Sistema</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};