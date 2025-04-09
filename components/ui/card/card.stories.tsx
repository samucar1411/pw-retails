import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

type StoryArgs = {
  title: string;
  description: string;
  content: string;
  footer: string;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
};

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Título del card",
    },
    description: {
      control: "text",
      description: "Descripción del card",
    },
    content: {
      control: "text",
      description: "Contenido del card",
    },
    footer: {
      control: "text",
      description: "Texto del footer del card",
    },
    className: {
      control: "text",
      description: "Clases adicionales para el card",
    },
    headerClassName: {
      control: "text",
      description: "Clases adicionales para el header del card",
    },
    titleClassName: {
      control: "text",
      description: "Clases adicionales para el título del card",
    },
    descriptionClassName: {
      control: "text",
      description: "Clases adicionales para la descripción del card",
    },
    contentClassName: {
      control: "text",
      description: "Clases adicionales para el contenido del card",
    },
    footerClassName: {
      control: "text",
      description: "Clases adicionales para el footer del card",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Card básico
export const Default: Story = {
  render: (args) => (
    <Card className={args.className}>
      <CardHeader className={args.headerClassName}>
        <CardTitle className={args.titleClassName}>{args.title}</CardTitle>
        <CardDescription className={args.descriptionClassName}>
          {args.description}
        </CardDescription>
      </CardHeader>
      <CardContent className={args.contentClassName}>
        <p>{args.content}</p>
      </CardContent>
      <CardFooter className={args.footerClassName}>
        <p>{args.footer}</p>
      </CardFooter>
    </Card>
  ),
  args: {
    title: "Card Title",
    description: "This is a description of the card.",
    content: "This is the content of the card.",
    footer: "Card Footer",
    className: "",
    headerClassName: "",
    titleClassName: "",
    descriptionClassName: "",
    contentClassName: "",
    footerClassName: "",
  },
};

// Card con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Card className={args.className}>
      <CardHeader className={args.headerClassName}>
        <CardTitle className={args.titleClassName}>{args.title}</CardTitle>
        <CardDescription className={args.descriptionClassName}>
          {args.description}
        </CardDescription>
      </CardHeader>
      <CardContent className={args.contentClassName}>
        <p>{args.content}</p>
      </CardContent>
      <CardFooter className={args.footerClassName}>
        <p>{args.footer}</p>
      </CardFooter>
    </Card>
  ),
  args: {
    title: "Custom Card",
    description: "This card has custom classes applied.",
    content: "You can customize the styles of each part of the card.",
    footer: "Custom Footer",
    className: "bg-gray-100",
    headerClassName: "bg-blue-100 p-4",
    titleClassName: "text-blue-800",
    descriptionClassName: "text-blue-600",
    contentClassName: "bg-white p-4",
    footerClassName: "bg-blue-100 p-4",
  },
};

// Card sin footer
export const WithoutFooter: Story = {
  render: (args) => (
    <Card className={args.className}>
      <CardHeader className={args.headerClassName}>
        <CardTitle className={args.titleClassName}>{args.title}</CardTitle>
        <CardDescription className={args.descriptionClassName}>
          {args.description}
        </CardDescription>
      </CardHeader>
      <CardContent className={args.contentClassName}>
        <p>{args.content}</p>
      </CardContent>
    </Card>
  ),
  args: {
    title: "Card Without Footer",
    description: "This card does not have a footer.",
    content: "The footer section is omitted in this example.",
    footer: "",
    className: "",
    headerClassName: "",
    titleClassName: "",
    descriptionClassName: "",
    contentClassName: "",
    footerClassName: "",
  },
};

// Card con contenido largo
export const LongContent: Story = {
  render: (args) => (
    <Card className={args.className}>
      <CardHeader className={args.headerClassName}>
        <CardTitle className={args.titleClassName}>{args.title}</CardTitle>
        <CardDescription className={args.descriptionClassName}>
          {args.description}
        </CardDescription>
      </CardHeader>
      <CardContent className={args.contentClassName}>
        <p>{args.content}</p>
      </CardContent>
      <CardFooter className={args.footerClassName}>
        <p>{args.footer}</p>
      </CardFooter>
    </Card>
  ),
  args: {
    title: "Card with Long Content",
    description: "This card has a long content section.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    footer: "Long Content Footer",
    className: "",
    headerClassName: "",
    titleClassName: "",
    descriptionClassName: "",
    contentClassName: "",
    footerClassName: "",
  },
};