import type { Meta, StoryObj } from "@storybook/react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";
import { Button } from "@/components/ui/button/button";
import { Search } from "lucide-react";
import { action } from "@storybook/addon-actions";
import React, { useState } from "react";

type StoryArgs = {
  placeholder?: string;
  items: { label: string; shortcut?: string }[];
  className?: string;
  open?: boolean;
};

const meta = {
  title: "Components/Command",
  component: Command,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder del input",
    },
    items: {
      control: "object",
      description: "Items del comando",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el comando",
    },
    open: {
      control: "boolean",
      description: "Estado del diálogo (abierto/cerrado)",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Comando básico
export const Default: Story = {
  render: (args) => (
    <Command className={args.className}>
      <CommandInput placeholder={args.placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {args.items.map((item, index) => (
            <CommandItem key={index} onSelect={action(`onSelect: ${item.label}`)}>
              <Search className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={action("onSelect: Profile")}>Profile</CommandItem>
          <CommandItem onSelect={action("onSelect: Billing")}>Billing</CommandItem>
          <CommandItem onSelect={action("onSelect: Settings")}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  args: {
    placeholder: "Type a command or search...",
    items: [
      { label: "Calendar", shortcut: "⌘C" },
      { label: "Search Emoji", shortcut: "⌘E" },
      { label: "Calculator", shortcut: "⌘K" },
    ],
    className: "",
  },
};

// Comando en diálogo
export const InDialog: Story = {
  render: (args) => {
    const DialogComponent = () => {
      const [open, setOpen] = useState(args.open);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open Command</Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <Command>
              <CommandInput placeholder={args.placeholder} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {args.items.map((item, index) => (
                    <CommandItem key={index} onSelect={action(`onSelect: ${item.label}`)}>
                      <Search className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem onSelect={action("onSelect: Profile")}>Profile</CommandItem>
                  <CommandItem onSelect={action("onSelect: Billing")}>Billing</CommandItem>
                  <CommandItem onSelect={action("onSelect: Settings")}>Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CommandDialog>
        </>
      );
    };

    return <DialogComponent />;
  },
  args: {
    placeholder: "Type a command or search...",
    items: [
      { label: "Calendar", shortcut: "⌘C" },
      { label: "Search Emoji", shortcut: "⌘E" },
      { label: "Calculator", shortcut: "⌘K" },
    ],
    className: "",
    open: false,
  },
};

// Comando con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Command className={args.className}>
      <CommandInput placeholder={args.placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {args.items.map((item, index) => (
            <CommandItem key={index} onSelect={action(`onSelect: ${item.label}`)}>
              <Search className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={action("onSelect: Profile")}>Profile</CommandItem>
          <CommandItem onSelect={action("onSelect: Billing")}>Billing</CommandItem>
          <CommandItem onSelect={action("onSelect: Settings")}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  args: {
    placeholder: "Type a command or search...",
    items: [
      { label: "Calendar", shortcut: "⌘C" },
      { label: "Search Emoji", shortcut: "⌘E" },
      { label: "Calculator", shortcut: "⌘K" },
    ],
    className: "w-full max-w-md",
  },
};