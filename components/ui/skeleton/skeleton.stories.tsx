import { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./skeleton";

const meta: Meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: { control: "text" },
    style: { control: "object" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Historia predeterminada
export const Default: Story = {
  render: (args) => <Skeleton {...args} />,
};

// Historia con dimensiones personalizadas (ancho y alto)
export const CustomWidthHeight: Story = {
  args: {
    style: {
      width: "200px",
      height: "50px",
    },
  },
  render: (args) => <Skeleton {...args} />,
};

// Historia circular
export const Circular: Story = {
  args: {
    style: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
    },
  },
  render: (args) => <Skeleton {...args} />,
};

// Historia con clase personalizada
export const CustomClassName: Story = {
  args: {
    className: "bg-red-200 rounded-full w-32 h-8",
  },
  render: (args) => <Skeleton {...args} />,
};

// Historia con múltiples Skeletons
export const MultipleSkeletons: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton style={{ width: "150px", height: "20px" }} />
      <Skeleton style={{ width: "250px", height: "20px" }} />
      <Skeleton style={{ width: "100px", height: "20px" }} />
    </div>
  ),
};
