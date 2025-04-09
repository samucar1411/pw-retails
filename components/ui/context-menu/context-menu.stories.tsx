import type { Meta, StoryObj } from "@storybook/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./context-menu";
import { ChevronRight } from "lucide-react";
import { action } from "@storybook/addon-actions";
import React, { useState } from "react";

type StoryArgs = {
  inset?: boolean;
  className?: string;
};

const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Menú contextual básico
export const Default: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Haz clic derecho aquí
      </ContextMenuTrigger>
      <ContextMenuContent className={args.className}>
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Nuevo")}>
          Nuevo
        </ContextMenuItem>
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Abrir")}>
          Abrir
        </ContextMenuItem>
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Guardar")}>
          Guardar
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Salir")}>
          Salir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

// Menú contextual con ítems de checkbox
export const WithCheckboxItems: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Haz clic derecho aquí
      </ContextMenuTrigger>
      <ContextMenuContent className={args.className}>
        <ContextMenuCheckboxItem
          checked={true}
          onCheckedChange={action("onCheckedChange: Mostrar línea de números")}
        >
          Mostrar línea de números
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          checked={false}
          onCheckedChange={action("onCheckedChange: Mostrar espacios en blanco")}
        >
          Mostrar espacios en blanco
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem
          checked={true}
          onCheckedChange={action("onCheckedChange: Mostrar minimapa")}
        >
          Mostrar minimapa
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

// Menú contextual con ítems de radio
export const WithRadioItems: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => {
    const RadioItemsComponent = () => {
      const [value, setValue] = useState("light");

      return (
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Haz clic derecho aquí
          </ContextMenuTrigger>
          <ContextMenuContent className={args.className}>
            <ContextMenuRadioGroup value={value} onValueChange={setValue}>
              <ContextMenuRadioItem
                value="light"
                onSelect={action("onSelect: Light")}
              >
                Light
              </ContextMenuRadioItem>
              <ContextMenuRadioItem
                value="dark"
                onSelect={action("onSelect: Dark")}
              >
                Dark
              </ContextMenuRadioItem>
              <ContextMenuRadioItem
                value="system"
                onSelect={action("onSelect: System")}
              >
                System
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      );
    };

    return <RadioItemsComponent />;
  },
};

// Menú contextual con submenú
export const WithSubMenu: Story = {
  args: {
    inset: false,
    className: "",
  },
  render: (args) => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Haz clic derecho aquí
      </ContextMenuTrigger>
      <ContextMenuContent className={args.className}>
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Nuevo")}>
          Nuevo
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset={args.inset}>
            Más opciones
            <ChevronRight className="ml-auto h-4 w-4" />
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={action("onSelect: Opción 1")}>
              Opción 1
            </ContextMenuItem>
            <ContextMenuItem onSelect={action("onSelect: Opción 2")}>
              Opción 2
            </ContextMenuItem>
            <ContextMenuItem onSelect={action("onSelect: Opción 3")}>
              Opción 3
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem inset={args.inset} onSelect={action("onSelect: Salir")}>
          Salir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};