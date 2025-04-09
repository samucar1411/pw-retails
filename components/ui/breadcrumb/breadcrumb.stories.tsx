import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";
import { ChevronRight } from "lucide-react";

type StoryArgs = {
  items: { text: string; href?: string; isCurrent?: boolean }[];
  separator?: React.ReactNode;
  className?: string;
};

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    items: {
      control: "object",
      description: "Elementos del breadcrumb",
    },
    separator: {
      control: "text",
      description: "Separador personalizado (puede ser un texto o un ícono)",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el breadcrumb",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Breadcrumb básico
export const Default: Story = {
  render: (args) => (
    <Breadcrumb className={args.className}>
      <BreadcrumbList>
        {args.items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.text}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.text}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < args.items.length - 1 && (
              <BreadcrumbSeparator>
                {args.separator ?? <ChevronRight />}
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  ),
  args: {
    items: [
      { text: "Home", href: "#" },
      { text: "Documents", href: "#" },
      { text: "Project", isCurrent: true },
    ],
    separator: undefined,
    className: "",
  },
};

// Breadcrumb con separador personalizado
export const CustomSeparator: Story = {
  render: (args) => (
    <Breadcrumb className={args.className}>
      <BreadcrumbList>
        {args.items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.text}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.text}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < args.items.length - 1 && (
              <BreadcrumbSeparator>
                {args.separator ?? <ChevronRight />}
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  ),
  args: {
    items: [
      { text: "Home", href: "#" },
      { text: "Documents", href: "#" },
      { text: "Project", isCurrent: true },
    ],
    separator: ">",
    className: "",
  },
};

// Breadcrumb con ellipsis
export const WithEllipsis: Story = {
  render: (args) => (
    <Breadcrumb className={args.className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          {args.separator ?? <ChevronRight />}
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          {args.separator ?? <ChevronRight />}
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Project</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  args: {
    items: [],
    separator: undefined,
    className: "",
  },
};

// Breadcrumb con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Breadcrumb className={args.className}>
      <BreadcrumbList>
        {args.items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.text}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.text}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < args.items.length - 1 && (
              <BreadcrumbSeparator>
                {args.separator ?? <ChevronRight />}
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  ),
  args: {
    items: [
      { text: "Home", href: "#" },
      { text: "Documents", href: "#" },
      { text: "Project", isCurrent: true },
    ],
    separator: undefined,
    className: "text-lg",
  },
};