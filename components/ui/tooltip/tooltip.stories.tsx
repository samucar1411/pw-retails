import { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
import { Button } from "@/components/ui/button/button";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ padding: "5rem" }}>
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={4}
        side="top"
        align="center"
      >
        Tooltip content
      </TooltipContent>
    </Tooltip>
  ),
};

export const CustomPosition: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={8}
        side="right"
        align="start"
      >
        This tooltip is on the right side.
      </TooltipContent>
    </Tooltip>
  ),
};

export const CustomStyle: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={4}
        side="bottom"
        align="center"
        className="bg-blue-500 text-white"
      >
        This tooltip has custom styles.
      </TooltipContent>
    </Tooltip>
  ),
};