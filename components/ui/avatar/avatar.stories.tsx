import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

type StoryArgs = {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: "small" | "medium" | "large";
};

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    src: {
      control: "text",
      description: "URL de la imagen del avatar",
    },
    alt: {
      control: "text",
      description: "Texto alternativo para la imagen",
    },
    fallback: {
      control: "text",
      description: "Texto de respaldo si la imagen no está disponible",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el avatar",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Tamaño del avatar",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Avatar con imagen
export const WithImage: Story = {
  render: (args) => (
    <Avatar className={args.className}>
      <AvatarImage
        src={args.src}
        alt={args.alt}
        className={args.size === "small" ? "h-8 w-8" : args.size === "large" ? "h-12 w-12" : "h-10 w-10"}
      />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    src: "https://github.com/shadcn.png",
    alt: "Avatar de shadcn",
    fallback: "CN",
    className: "",
    size: "medium",
  },
};

// Avatar sin imagen (solo fallback)
export const WithoutImage: Story = {
  render: (args) => (
    <Avatar className={args.className}>
      <AvatarFallback className={args.size === "small" ? "h-8 w-8" : args.size === "large" ? "h-12 w-12" : "h-10 w-10"}>
        {args.fallback}
      </AvatarFallback>
    </Avatar>
  ),
  args: {
    fallback: "AB",
    className: "",
    size: "medium",
  },
};

// Avatar personalizado con tamaño grande
export const LargeAvatar: Story = {
  render: (args) => (
    <Avatar className={args.className}>
      <AvatarImage
        src={args.src}
        alt={args.alt}
        className="h-12 w-12"
      />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    src: "https://github.com/shadcn.png",
    alt: "Avatar de shadcn",
    fallback: "CN",
    className: "",
    size: "large",
  },
};

// Avatar personalizado con tamaño pequeño
export const SmallAvatar: Story = {
  render: (args) => (
    <Avatar className={args.className}>
      <AvatarImage
        src={args.src}
        alt={args.alt}
        className="h-8 w-8"
      />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
  args: {
    src: "https://github.com/shadcn.png",
    alt: "Avatar de shadcn",
    fallback: "CN",
    className: "",
    size: "small",
  },
};