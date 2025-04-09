import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

type StoryArgs = {
  children?: string;
  className?: string;
  htmlFor?: string;
};

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: {
      control: "text",
      description: "Texto del label",
    },
    className: {
      control: "text",
      description: "Clases adicionales para el label",
    },
    htmlFor: {
      control: "text",
      description: "Atributo 'for' del label",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Label básico
export const Default: Story = {
  args: {
    children: "Nombre",
    className: "",
    htmlFor: "input-name",
  },
};

// Label con clases personalizadas
export const WithCustomClasses: Story = {
  args: {
    children: "Correo electrónico",
    className: "text-blue-500 font-bold",
    htmlFor: "input-email",
  },
};

// Label con atributo "for" personalizado
export const WithCustomHtmlFor: Story = {
  args: {
    children: "Contraseña",
    className: "",
    htmlFor: "input-password",
  },
};