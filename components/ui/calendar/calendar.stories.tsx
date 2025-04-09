import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./calendar";
import { addDays } from "date-fns";

type StoryArgs = {
  showOutsideDays?: boolean;
  className?: string;
  selectedDate?: Date;
  disabledDates?: Date[];
};

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showOutsideDays: {
      control: "boolean",
      description: "Mostrar u ocultar días fuera del mes actual",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el calendario",
    },
    selectedDate: {
      control: "date",
      description: "Fecha seleccionada",
    },
    disabledDates: {
      control: "object",
      description: "Fechas deshabilitadas",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Calendario básico
export const Default: Story = {
  render: (args) => (
    <Calendar
      showOutsideDays={args.showOutsideDays}
      className={args.className}
      selected={args.selectedDate}
      disabled={args.disabledDates}
    />
  ),
  args: {
    showOutsideDays: true,
    className: "",
    selectedDate: new Date(),
    disabledDates: [addDays(new Date(), 1), addDays(new Date(), 2)],
  },
};

// Calendario con días fuera del mes ocultos
export const HideOutsideDays: Story = {
  render: (args) => (
    <Calendar
      showOutsideDays={args.showOutsideDays}
      className={args.className}
      selected={args.selectedDate}
      disabled={args.disabledDates}
    />
  ),
  args: {
    showOutsideDays: false,
    className: "",
    selectedDate: new Date(),
    disabledDates: [],
  },
};

// Calendario con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Calendar
      showOutsideDays={args.showOutsideDays}
      className={args.className}
      selected={args.selectedDate}
      disabled={args.disabledDates}
    />
  ),
  args: {
    showOutsideDays: true,
    className: "bg-gray-100 p-6 rounded-lg",
    selectedDate: new Date(),
    disabledDates: [],
  },
};

// Calendario con fechas deshabilitadas
export const DisabledDates: Story = {
  render: (args) => (
    <Calendar
      showOutsideDays={args.showOutsideDays}
      className={args.className}
      selected={args.selectedDate}
      disabled={args.disabledDates}
    />
  ),
  args: {
    showOutsideDays: true,
    className: "",
    selectedDate: new Date(),
    disabledDates: [addDays(new Date(), 1), addDays(new Date(), 2)],
  },
};

// Calendario con rango de fechas seleccionadas
export const DateRange: Story = {
  render: (args) => (
    <Calendar
      showOutsideDays={args.showOutsideDays}
      className={args.className}
      selected={{
        from: new Date(),
        to: addDays(new Date(), 7),
      }}
      disabled={args.disabledDates}
    />
  ),
  args: {
    showOutsideDays: true,
    className: "",
    selectedDate: undefined,
    disabledDates: [],
  },
};