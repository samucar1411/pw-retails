import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react";
import { action } from "@storybook/addon-actions";
import React, { useState } from "react";

type StoryArgs = {
  inset?: boolean;
  className?: string;
};

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<StoryArgs>;

// Menú desplegable básico
export const Default: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Abrir menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={args.className}>
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Nuevo")}>
          Nuevo
        </DropdownMenuItem>
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Abrir")}>
          Abrir
        </DropdownMenuItem>
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Guardar")}>
          Guardar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Salir")}>
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Componente para manejar los radio buttons
const RadioItemsComponent = ({ className }: { className?: string }) => {
  const [value, setValue] = useState("light");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Abrir menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={className}>
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          <DropdownMenuRadioItem value="light" onSelect={action("onSelect: Light")}>
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" onSelect={action("onSelect: Dark")}>
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" onSelect={action("onSelect: System")}>
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Menú desplegable con ítems de radio
export const WithRadioItems: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => <RadioItemsComponent className={args.className} />,
};

// Menú desplegable con ítems de checkbox
export const WithCheckboxItems: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Abrir menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={args.className}>
        <DropdownMenuCheckboxItem
          checked={true}
          onCheckedChange={action("onCheckedChange: Mostrar línea de números")}
        >
          Mostrar línea de números
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={action("onCheckedChange: Mostrar espacios en blanco")}
        >
          Mostrar espacios en blanco
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={true}
          onCheckedChange={action("onCheckedChange: Mostrar minimapa")}
        >
          Mostrar minimapa
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Menú desplegable con submenú
export const WithSubMenu: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Abrir menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={args.className}>
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Nuevo")}>
          Nuevo
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset={args.inset}>
            Más opciones
            <ChevronRight className="ml-auto" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={action("onSelect: Opción 1")}>
              Opción 1
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={action("onSelect: Opción 2")}>
              Opción 2
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={action("onSelect: Opción 3")}>
              Opción 3
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset={args.inset} onSelect={action("onSelect: Salir")}>
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
