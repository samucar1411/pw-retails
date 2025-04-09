import { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
      description: "Clases CSS personalizadas",
    },
    placeholder: {
      control: "text",
      description: "Texto de marcador de posición",
    },
    defaultValue: {
      control: "text",
      description: "Valor por defecto",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilitar Textarea",
    },
    readOnly: {
      control: "boolean",
      description: "Solo lectura",
    },
    rows: {
      control: "number",
      description: "Número de filas",
    },
    cols: {
      control: "number",
      description: "Número de columnas",
    },
    maxLength: {
      control: "number",
      description: "Longitud máxima de caracteres",
    },
    minLength: {
      control: "number",
      description: "Longitud mínima de caracteres",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Escribe algo aquí...",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "No puedes escribir aquí...",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: "Este texto es de solo lectura.",
    readOnly: true,
  },
};

export const CustomRowsAndCols: Story = {
  args: {
    placeholder: "Ajusta el tamaño...",
    rows: 5,
    cols: 50,
  },
};

export const MaxLength: Story = {
  args: {
    placeholder: "Máximo 10 caracteres...",
    maxLength: 10,
  },
};

export const MinLength: Story = {
  args: {
    placeholder: "Mínimo 5 caracteres...",
    minLength: 5,
  },
};

export const CustomStyle: Story = {
  args: {
    placeholder: "Estilo personalizado...",
    className: "border-2 border-red-500 rounded-lg p-4",
  },
};