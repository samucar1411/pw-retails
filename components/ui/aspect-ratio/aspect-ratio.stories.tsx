import { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./aspect-ratio";

const meta: Meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: { type: "number" },
      description: "La relación de aspecto (ancho/alto).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        Square (1:1)
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 1,
  },
};

export const Wide: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <div
        style={{
          backgroundColor: "#e0e0e0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        Wide (16:9)
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 16 / 9,
  },
};

export const Tall: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <div
        style={{
          backgroundColor: "#d0d0d0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        Tall (9:16)
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 9 / 16,
  },
};

export const CustomRatio: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <div
        style={{
          backgroundColor: "#c0c0c0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        Custom Ratio (3:2)
      </div>
    </AspectRatio>
  ),
  args: {
    ratio: 3 / 2,
  },
};