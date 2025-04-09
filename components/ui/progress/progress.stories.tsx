import { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

interface ProgressStoryProps {
  value: number;
  className?: string;
}

const meta: Meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100 },
      description: "Valor actual del progreso (0-100)",
    },
    className: {
      control: "text",
      description: "Clases CSS personalizadas para el Progress",
    },
  },
};

export default meta;

type Story = StoryObj<ProgressStoryProps>;

const Template = (args: ProgressStoryProps) => <Progress {...args} />;

export const Default: Story = {
  args: {
    value: 50,
    className: "",
  },
  render: Template,
};

export const LowProgress: Story = {
  args: {
    value: 20,
    className: "",
  },
  render: Template,
};

export const HighProgress: Story = {
  args: {
    value: 80,
    className: "",
  },
  render: Template,
};

export const CustomStyled: Story = {
  args: {
    value: 60,
    className: "bg-red-500",
  },
  render: Template,
};
