import { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./toaster";
import { Button } from "@/components/ui/button/button";
import { useToast } from "@/hooks/use-toast";

// Create a wrapper component to use the hook
const ToastDemo = () => {
  const { toast } = useToast();

  return (
    <div>
      <Button
        onClick={() => {
          toast({
            title: "Default Toast",
            description: "This is a default toast message",
          });
        }}
      >
        Show Default Toast
      </Button>
      <Toaster />
    </div>
  );
};

const ToastDestructiveDemo = () => {
  const { toast } = useToast();

  return (
    <div>
      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Destructive Toast",
            description: "This is a destructive toast message",
          });
        }}
      >
        Show Destructive Toast
      </Button>
      <Toaster />
    </div>
  );
};

const ToastWithActionDemo = () => {
  const { toast } = useToast();

  return (
    <div>
      <Button
        onClick={() => {
          toast({
            title: "Toast with Action",
            description: "This toast has an action button",
            action: (
              <Button variant="outline" size="sm" onClick={() => alert("Action clicked")}>
                Undo
              </Button>
            ),
          });
        }}
      >
        Show Toast with Action
      </Button>
      <Toaster />
    </div>
  );
};

const meta: Meta = {
  title: "Components/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ToastDemo />,
};

export const Destructive: Story = {
  render: () => <ToastDestructiveDemo />,
};

export const WithAction: Story = {
  render: () => <ToastWithActionDemo />,
};