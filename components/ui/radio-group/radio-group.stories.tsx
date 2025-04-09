import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "@/components/ui/label/label";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultValue: { control: "text", description: "Valor seleccionado por defecto" },
    className: { control: "text", description: "Clases CSS personalizadas" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "option1",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Vertical: Story = {
  args: {
    defaultValue: "optionA",
    className: "flex flex-col gap-4",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="optionA" id="optionA" />
        <Label htmlFor="optionA">Option A</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="optionB" id="optionB" />
        <Label htmlFor="optionB">Option B</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="optionC" id="optionC" />
        <Label htmlFor="optionC">Option C</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: "enabled",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="enabled" id="enabled" />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="disabled" id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
    </RadioGroup>
  ),
};

export const CustomStyle: Story = {
  args: {
    defaultValue: "custom",
    className: "grid gap-4",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom" id="custom" className="border-blue-500 text-blue-500" />
        <Label htmlFor="custom">Custom Style</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom2" id="custom2" className="border-green-500 text-green-500" />
        <Label htmlFor="custom2">Custom Style 2</Label>
      </div>
    </RadioGroup>
  ),
};
