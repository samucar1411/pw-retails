import { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";

const meta: Meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Defines if the switch is checked or unchecked",
    },
    disabled: {
      control: "boolean",
      description: "Defines if the switch is disabled",
    },
    className: {
      control: "text",
      description: "Custom className for styling the switch",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia por defecto
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    className: "",
  },
  render: (args) => <Switch {...args} />,
};

// Historia para switch habilitado
export const Enabled: Story = {
  args: {
    checked: true,
    disabled: false,
    className: "",
  },
  render: (args) => <Switch {...args} />,
};

// Historia para switch deshabilitado
export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    className: "",
  },
  render: (args) => <Switch {...args} />,
};

// Historia para switch con clases personalizadas
export const CustomClass: Story = {
  args: {
    checked: true,
    disabled: false,
    className: "bg-green-500",
  },
  render: (args) => <Switch {...args} />,
};
