import { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./sonner";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";

const meta: Meta = {
  title: "Components/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultSonner: Story = {
  render: () => (
    <div>
      <Button
        onClick={() => {
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
          });
        }}
      >
        Show Sonner Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const SuccessSonner: Story = {
  render: () => (
    <div>
      <Button
        onClick={() => {
          toast.success("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
          });
        }}
      >
        Show Success Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const ErrorSonner: Story = {
  render: () => (
    <div>
      <Button
        variant="destructive"
        onClick={() => {
          toast.error("Error creating event", {
            description: "Please try again later",
          });
        }}
      >
        Show Error Toast
      </Button>
      <Toaster />
    </div>
  ),
};

export const WithActionSonner: Story = {
  render: () => (
    <div>
      <Button
        onClick={() => {
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          });
        }}
      >
        Show Toast with Action
      </Button>
      <Toaster />
    </div>
  ),
};
