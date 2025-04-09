import type { Meta, StoryObj } from "@storybook/react";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./input-otp";
import React from "react";

type StoryArgs = {
  length: number;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  separator?: string;
};

const meta = {
  title: "Components/InputOTP",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    length: {
      control: "number",
      description: "Número de dígitos del OTP",
      defaultValue: 6,
    },
    disabled: {
      control: "boolean",
      description: "Si el OTP está deshabilitado",
    },
    containerClassName: {
      control: "text",
      description: "Clases adicionales para el contenedor",
    },
    className: {
      control: "text",
      description: "Clases adicionales para el input",
    },
    separator: {
      control: "text",
      description: "Separador entre los dígitos",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// InputOTP básico
export const Default: Story = {
  args: {
    length: 6,
    disabled: false,
    containerClassName: "",
    className: "",
    separator: "-",
  },
  render: (args) => (
    <InputOTP
      maxLength={args.length}
      disabled={args.disabled}
      containerClassName={args.containerClassName}
      className={args.className}
    >
      <InputOTPGroup>
        {Array.from({ length: args.length }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

// InputOTP con separador personalizado
export const WithCustomSeparator: Story = {
  args: {
    length: 6,
    disabled: false,
    containerClassName: "",
    className: "",
    separator: "•",
  },
  render: (args) => (
    <InputOTP
      maxLength={args.length}
      disabled={args.disabled}
      containerClassName={args.containerClassName}
      className={args.className}
    >
      <InputOTPGroup>
        {Array.from({ length: args.length }).map((_, index) => (
          <React.Fragment key={index}>
            <InputOTPSlot index={index} />
            {index < args.length - 1 && <InputOTPSeparator>{args.separator}</InputOTPSeparator>}
          </React.Fragment>
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

// InputOTP deshabilitado
export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    containerClassName: "",
    className: "",
    separator: "-",
  },
  render: (args) => (
    <InputOTP
      maxLength={args.length}
      disabled={args.disabled}
      containerClassName={args.containerClassName}
      className={args.className}
    >
      <InputOTPGroup>
        {Array.from({ length: args.length }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

// InputOTP con clases personalizadas
export const WithCustomClasses: Story = {
  args: {
    length: 6,
    disabled: false,
    containerClassName: "bg-gray-100 p-4 rounded-lg",
    className: "text-lg font-bold",
    separator: "-",
  },
  render: (args) => (
    <InputOTP
      maxLength={args.length}
      disabled={args.disabled}
      containerClassName={args.containerClassName}
      className={args.className}
    >
      <InputOTPGroup>
        {Array.from({ length: args.length }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};