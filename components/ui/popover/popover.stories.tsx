import { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "@/components/ui/button/button";

interface PopoverStoryProps {
  triggerText: string;
  popoverContent: string;
  align: "start" | "center" | "end";
  sideOffset: number;
  contentClassName?: string;
}

const meta: Meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    triggerText: {
      control: "text",
      description: "Texto del botón que abre el popover",
    },
    popoverContent: {
      control: "text",
      description: "Contenido dentro del popover",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alineación del contenido del popover",
      table: {
        category: "PopoverContent Props",
      },
    },
    sideOffset: {
      control: { type: "number", min: 0 },
      description: "Desplazamiento lateral del popover",
      table: {
        category: "PopoverContent Props",
      },
    },
    contentClassName: {
      control: "text",
      description: "Clases CSS personalizadas para el contenido del popover",
      table: {
        category: "PopoverContent Props",
      },
    },
  },
};

export default meta;

type Story = StoryObj<PopoverStoryProps>;

const Template = (args: PopoverStoryProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button>{args.triggerText}</Button>
    </PopoverTrigger>
    <PopoverContent
      align={args.align}
      sideOffset={args.sideOffset}
      className={args.contentClassName}
    >
      {args.popoverContent}
    </PopoverContent>
  </Popover>
);

export const Default: Story = {
  args: {
    triggerText: "Abrir Popover",
    popoverContent: "Este es el contenido del popover.",
    align: "center",
    sideOffset: 4,
    contentClassName: "",
  },
  render: Template,
};

export const CustomAlignment: Story = {
  args: {
    triggerText: "Popover Alineado a la Izquierda",
    popoverContent: "Popover alineado a la izquierda con un desplazamiento mayor.",
    align: "start",
    sideOffset: 8,
    contentClassName: "",
  },
  render: Template,
};

export const CustomClassName: Story = {
  args: {
    triggerText: "Popover con Estilo Personalizado",
    popoverContent: "Popover con un estilo personalizado.",
    align: "center",
    sideOffset: 4,
    contentClassName: "border-blue-500 bg-blue-100",
  },
  render: Template,
};

export const LongContent: Story = {
  args: {
    triggerText: "Popover con Contenido Largo",
    popoverContent:
      "Este es un popover con un contenido muy largo que se extenderá más allá del ancho predeterminado del popover.",
    align: "center",
    sideOffset: 4,
    contentClassName: "",
  },
  render: Template,
};
