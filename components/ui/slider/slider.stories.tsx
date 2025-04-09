import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Slider } from "./slider";

const meta: Meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: { control: "object" },
    max: { control: "number" },
    min: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    min: 0,
    step: 1,
    className: "w-full",
  },
  render: (args) => <Slider {...args} />,
};

export const Disabled: Story = {
  args: {
    defaultValue: [25],
    max: 100,
    min: 0,
    step: 1,
    disabled: true,
    className: "w-full",
  },
  render: (args) => <Slider {...args} />,
};

export const CustomRange: Story = {
  args: {
    defaultValue: [20, 80],
    max: 100,
    min: 0,
    step: 1,
    className: "w-full",
  },
  render: (args) => <Slider {...args} />,
};

export const CustomStep: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    min: 0,
    step: 10,
    className: "w-full",
  },
  render: (args) => <Slider {...args} />,
};

export const CustomMinMax: Story = {
  args: {
    defaultValue: [75],
    max: 200,
    min: -100,
    step: 5,
    className: "w-full",
  },
  render: (args) => <Slider {...args} />,
};

export const ControlledSlider: Story = {
  render: (args) => {
    const ControlledSliderComponent = () => {
      const [value, setValue] = React.useState<number[]>([50]);
      return <Slider {...args} value={value} onValueChange={setValue} />;
    };
    return <ControlledSliderComponent />;
  },
};
