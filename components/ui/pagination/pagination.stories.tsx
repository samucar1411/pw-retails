import { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    currentPage: {
      control: { type: "number", min: 1 },
      description: "Página actual",
    },
    totalPages: {
      control: { type: "number", min: 1 },
      description: "Total de páginas",
    },
    onPageChange: {
      action: "onPageChange",
      description: "Función para manejar el cambio de página",
    },
    className: {
      control: "text",
      description: "Clases CSS personalizadas",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const CustomPages: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const CustomClassName: Story = {
  args: {
    currentPage: 3,
    totalPages: 15,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
    className: "border border-red-500 rounded-md p-2",
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 5,
    totalPages: 5,
    onPageChange: (page) => console.log(`Page changed to: ${page}`),
  },
};