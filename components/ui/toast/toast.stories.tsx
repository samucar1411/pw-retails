import { Meta, StoryObj } from "@storybook/react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem" }}>
        <ToastProvider>
          <Story />
          <ToastViewport />
        </ToastProvider>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  render: (args) => (
    <Toast {...args}>
      <div className="grid gap-1">
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>Toast description goes here.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const WithAction: Story = {
  args: {
    variant: "default",
  },
  render: (args) => (
    <Toast {...args}>
      <div className="grid gap-1">
        <ToastTitle>Toast with Action</ToastTitle>
        <ToastDescription>This toast has an action button.</ToastDescription>
      </div>
      <ToastAction altText="Try again">
        Try again
      </ToastAction>
      <ToastClose />
    </Toast>
  ),
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (args) => (
    <Toast {...args}>
      <div className="grid gap-1">
        <ToastTitle>Destructive Toast</ToastTitle>
        <ToastDescription>This is a destructive toast.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};