import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

type StoryArgs = {
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  success?: string;
  className?: string;
};

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Etiqueta del input",
    },
    type: {
      control: "select",
      options: ["text", "password", "email", "number"],
      description: "Tipo de input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder del input",
    },
    disabled: {
      control: "boolean",
      description: "Si el input está deshabilitado",
    },
    error: {
      control: "text",
      description: "Mensaje de error",
    },
    success: {
      control: "text",
      description: "Mensaje de éxito",
    },
    className: {
      control: "text",
      description: "Clases adicionales para el input",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Input básico
export const Default: Story = {
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Ingresa tu nombre",
    disabled: false,
    error: "",
    success: "",
    className: "",
  },
};

// Input con error
export const WithError: Story = {
  args: {
    label: "Correo electrónico",
    type: "email",
    placeholder: "Ingresa tu correo",
    disabled: false,
    error: "El correo electrónico es inválido",
    success: "",
    className: "",
  },
};

// Input con éxito
export const WithSuccess: Story = {
  args: {
    label: "Contraseña",
    type: "password",
    placeholder: "Ingresa tu contraseña",
    disabled: false,
    error: "",
    success: "Contraseña válida",
    className: "",
  },
};

// Input deshabilitado
export const Disabled: Story = {
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Ingresa tu nombre",
    disabled: true,
    error: "",
    success: "",
    className: "",
  },
};

// Input con clases personalizadas
export const WithCustomClasses: Story = {
  args: {
    label: "Nombre",
    type: "text",
    placeholder: "Ingresa tu nombre",
    disabled: false,
    error: "",
    success: "",
    className: "bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500",
  },
};