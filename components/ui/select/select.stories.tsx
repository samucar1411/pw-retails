import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select";

const meta: Meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    Layout: "centered"
  },
  argTypes: {
    triggerClassName: { control: 'text' },
    contentClassName: { control: 'text' },
    itemClassName: { control: 'text' },
    selectItems: { 
      control: 'object',
      defaultValue: ["Apple", "Banana", "Orange", "Grape"],
    },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia predeterminada, con modificaciones en los atributos desde los controles
export const Default: Story = {
  args: {
    triggerClassName: "border-2 border-gray-400 rounded-md p-2",
    contentClassName: "bg-white shadow-md rounded-md",
    itemClassName: "text-red-500 hover:bg-red-100",
    selectItems: ["Apple", "Banana", "Orange", "Grape"],
    placeholder: "Select a Item",
  },
  render: (args) => (
    <Select>
      <SelectTrigger className={args.triggerClassName}>
        <SelectValue placeholder={args.placeholder} />
      </SelectTrigger>
      <SelectContent className={args.contentClassName}>
        {args.selectItems.map((item: string, index: number) => (
          <SelectItem key={index} value={item} className={args.itemClassName}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

// Historia con agrupación y la posibilidad de cambiar los valores
export const Grouped: Story = {
  args: {
    triggerClassName: "border-2 border-gray-400 rounded-md p-2",
    contentClassName: "bg-white shadow-md rounded-md",
    groupClassName: "text-blue-600",
    selectItems: ["Apple", "Banana", "Orange", "Strawberry", "Blueberry", "Raspberry"],
    placeholder: "Select a Item",
  },
  render: (args) => (
    <Select>
      <SelectTrigger className={args.triggerClassName}>
        <SelectValue placeholder={args.placeholder} />
      </SelectTrigger>
      <SelectContent className={args.contentClassName}>
        <SelectGroup>
          <SelectLabel className={args.groupClassName}>Fruits</SelectLabel>
          {args.selectItems.slice(0, 3).map((item: string, index: number) => (
            <SelectItem key={index} value={item} className={args.itemClassName}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className={args.groupClassName}>Berries</SelectLabel>
          {args.selectItems.slice(3).map((item: string, index: number) => (
            <SelectItem key={index} value={item} className={args.itemClassName}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Historia con un ítem deshabilitado, y con estilos modificables
export const DisabledItem: Story = {
  args: {
    triggerClassName: "border-2 border-gray-400 rounded-md p-2",
    contentClassName: "bg-white shadow-md rounded-md",
    itemClassName: "hover:bg-gray-100",
    disabledItemClassName: "text-gray-400 cursor-not-allowed",
    selectItems: ["Enabled", "Disabled"],
    placeholder: "Select an option",
  },
  render: (args) => (
    <Select>
      <SelectTrigger className={args.triggerClassName}>
        <SelectValue placeholder={args.placeholder} />
      </SelectTrigger>
      <SelectContent className={args.contentClassName}>
        {args.selectItems.map((item: string, index: number) => (
          <SelectItem
            key={index}
            value={item}
            className={item === "Disabled" ? args.disabledItemClassName : args.itemClassName}
            disabled={item === "Disabled"}
          >
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

// Historia con estilos personalizados y atributos modificables
export const CustomStyle: Story = {
  args: {
    triggerClassName: "border-4 border-blue-500 rounded-md p-2",
    contentClassName: "bg-gray-100 border-green-500 shadow-md rounded-md",
    itemClassName: "bg-blue-100 hover:bg-blue-200 text-blue-500",
    selectItems: ["Option 1", "Option 2"],
    placeholder: "Custom Select",
  },
  render: (args) => (
    <Select>
      <SelectTrigger className={args.triggerClassName}>
        <SelectValue placeholder={args.placeholder} />
      </SelectTrigger>
      <SelectContent className={args.contentClassName}>
        {args.selectItems.map((item: string, index: number) => (
          <SelectItem key={index} value={item} className={args.itemClassName}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};
