import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";

type StoryArgs = {
  checked?: boolean;
  disabled?: boolean;
  className?: string;
};

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Estado del checkbox (checked/unchecked)",
    },
    disabled: {
      control: "boolean",
      description: "Estado deshabilitado",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el checkbox",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Checkbox básico
export const Default: Story = {
  render: (args) => (
    <Checkbox
      checked={args.checked}
      disabled={args.disabled}
      className={args.className}
    />
  ),
  args: {
    checked: false,
    disabled: false,
    className: "",
  },
};

// Checkbox marcado
export const Checked: Story = {
  render: (args) => (
    <Checkbox
      checked={args.checked}
      disabled={args.disabled}
      className={args.className}
    />
  ),
  args: {
    checked: true,
    disabled: false,
    className: "",
  },
};

// Checkbox deshabilitado
export const Disabled: Story = {
  render: (args) => (
    <Checkbox
      checked={args.checked}
      disabled={args.disabled}
      className={args.className}
    />
  ),
  args: {
    checked: false,
    disabled: true,
    className: "",
  },
};

// Checkbox con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Checkbox
      checked={args.checked}
      disabled={args.disabled}
      className={args.className}
    />
  ),
  args: {
    checked: false,
    disabled: false,
    className: "border-2 border-red-500",
  },
};