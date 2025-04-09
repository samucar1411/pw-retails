import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import React from "react";

type StoryArgs = {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  triggerText?: string;
  linkText?: string;
  linkHref?: string;
  contentText?: string;
  viewportClassName?: string;
  indicatorClassName?: string;
};

const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
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
    triggerText: {
      control: "text",
      description: "Texto del botón",
    },
    linkText: {
      control: "text",
      description: "Texto del enlace",
    },
    linkHref: {
      control: "text",
      description: "URL del enlace",
    },
    contentText: {
      control: "text",
      description: "Texto del contenido",
    },
    viewportClassName: {
      control: "text",
      description: "Clases adicionales para el viewport",
    },
    indicatorClassName: {
      control: "text",
      description: "Clases adicionales para el indicador",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// NavigationMenu básico
export const Default: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    triggerText: "Productos",
    linkText: "Ver más",
    linkHref: "#",
    contentText: "Este es el contenido del menú.",
    viewportClassName: "",
    indicatorClassName: "",
  },
  render: (args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            {args.triggerText}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-2">
              <li>
                <NavigationMenuLink href={args.linkHref}>
                  {args.linkText} 1
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href={args.linkHref}>
                  {args.linkText} 2
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href={args.linkHref}>
                  {args.linkText} 3
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href={args.linkHref}>
                  {args.linkText} 4
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            Soluciones
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">Solución A</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Solución B</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Solución C</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Solución D</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            Precios
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[200px]">
              <li>
                <NavigationMenuLink href="#">Planes</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Comparar</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator className={args.indicatorClassName} />
      <NavigationMenuViewport className={args.viewportClassName} />
    </NavigationMenu>
  ),
};

// NavigationMenu con contenido personalizado
export const CustomContent: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    triggerText: "Personalizado",
    contentText: "Este es un contenido personalizado dentro del menú.",
    viewportClassName: "",
    indicatorClassName: "",
  },
  render: (args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            {args.triggerText}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-6">
              <h3>Contenido Personalizado</h3>
              <p>{args.contentText}</p>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator className={args.indicatorClassName} />
      <NavigationMenuViewport className={args.viewportClassName} />
    </NavigationMenu>
  ),
};

// NavigationMenu con diseño de columnas
export const DifferentLayout: Story = {
  args: {
    align: "start",
    sideOffset: 4,
    className: "",
    triggerText: "Diseño de Columnas",
    viewportClassName: "",
    indicatorClassName: "",
  },
  render: (args) => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            {args.triggerText}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <h3>Columna 1</h3>
                  <NavigationMenuLink href="#" className="block text-sm text-blue-500 hover:underline">
                    Enlace 1
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block text-sm text-blue-500 hover:underline">
                    Enlace 2
                  </NavigationMenuLink>
                </div>
                <div className="w-1/2">
                  <h3>Columna 2</h3>
                  <NavigationMenuLink href="#" className="block text-sm text-blue-500 hover:underline">
                    Enlace 3
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block text-sm text-blue-500 hover:underline">
                    Enlace 4
                  </NavigationMenuLink>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator className={args.indicatorClassName} />
      <NavigationMenuViewport className={args.viewportClassName} />
    </NavigationMenu>
  ),
};