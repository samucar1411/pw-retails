import { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Orientation of the separator",
      defaultValue: "horizontal",
    },
    decorative: {
      control: "boolean",
      description: "If true, the separator is purely decorative",
      defaultValue: true,
    },
    className: {
      control: "text",
      description: "Classes to apply to the separator element",
      defaultValue: "bg-border",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia para un separador horizontal
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    decorative: true,
    className: "bg-gray-500",
  },
  render: (args) => (
    <div>
      <p>Content above horizontal separator</p>
      <Separator {...args} />
      <p>Content below horizontal separator</p>
    </div>
  ),
};

// Historia para un separador vertical
export const Vertical: Story = {
  args: {
    orientation: "vertical",
    decorative: true,
    className: "bg-gray-500",
  },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", height: "100px" }}>
      <p>Left content</p>
      <Separator {...args} />
      <p>Right content</p>
    </div>
  ),
};

// Historia para un separador decorativo
export const Decorative: Story = {
  args: {
    decorative: true,
    orientation: "horizontal",
    className: "bg-gray-500",
  },
  render: (args) => (
    <div>
      <p>Content above decorative separator</p>
      <Separator {...args} />
      <p>Content below decorative separator</p>
    </div>
  ),
};

// Historia para un separador no decorativo
export const NonDecorative: Story = {
  args: {
    decorative: false,
    orientation: "horizontal",
    className: "bg-gray-500",
  },
  render: (args) => (
    <div>
      <p>Content above non-decorative separator</p>
      <Separator {...args} />
      <p>Content below non-decorative separator</p>
    </div>
  ),
};

// Historia para un separador con clase personalizada
export const CustomStyle: Story = {
  args: {
    orientation: "horizontal",
    decorative: true,
    className: "bg-blue-500 h-2",
  },
  render: (args) => (
    <div>
      <p>Content above custom styled separator</p>
      <Separator {...args} />
      <p>Content below custom styled separator</p>
    </div>
  ),
};
