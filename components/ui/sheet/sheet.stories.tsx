import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./sheet";

const meta: Meta = {
  title: "Components/Sheet",
  component: SheetContent,
  tags: ["autodocs"],
  parameters: {
    Layout: "centered",
  },
  argTypes: {
    side: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
      description: "The side from which the sheet will slide in",
      defaultValue: "right",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to customize the appearance",
      defaultValue: "bg-white p-6",
    },
    children: {
      control: "text",
      description: "Content inside the sheet",
      defaultValue: "This is a sample content inside the sheet.",
    },
    title: {
      control: "text",
      description: "Title of the sheet",
      defaultValue: "Sheet Title",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia para un Sheet desde la derecha
export const RightSide: Story = {
  args: {
    side: "right",
    className: "bg-white p-6",
    children: "This is a right-side sheet.",
    title: "Right Side Sheet",
  },
  render: (args) => (
    <Sheet open>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>{args.title}</SheetTitle>
          <SheetDescription>
            This is the description of the sheet.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

// Historia para un Sheet desde la izquierda
export const LeftSide: Story = {
  args: {
    side: "left",
    className: "bg-white p-6",
    children: "This is a left-side sheet.",
    title: "Left Side Sheet",
  },
  render: (args) => (
    <Sheet open>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>{args.title}</SheetTitle>
          <SheetDescription>
            This is the description of the sheet.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

// Historia para un Sheet desde arriba
export const TopSide: Story = {
  args: {
    side: "top",
    className: "bg-white p-6",
    children: "This is a top-side sheet.",
    title: "Top Side Sheet",
  },
  render: (args) => (
    <Sheet open>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>{args.title}</SheetTitle>
          <SheetDescription>
            This is the description of the sheet.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

// Historia para un Sheet desde abajo
export const BottomSide: Story = {
  args: {
    side: "bottom",
    className: "bg-white p-6",
    children: "This is a bottom-side sheet.",
    title: "Bottom Side Sheet",
  },
  render: (args) => (
    <Sheet open>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>{args.title}</SheetTitle>
          <SheetDescription>
            This is the description of the sheet.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

// Historia con contenido personalizado
export const CustomContent: Story = {
  args: {
    side: "right",
    className: "bg-white p-6",
    children: "This is custom content inside the sheet.",
    title: "Custom Content Sheet",
  },
  render: (args) => (
    <Sheet open>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>{args.title}</SheetTitle>
          <SheetDescription>
            This is a custom content description.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <button className="btn">Close</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
