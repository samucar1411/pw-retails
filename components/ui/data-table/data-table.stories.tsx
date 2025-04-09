import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { action } from "@storybook/addon-actions";

interface ExampleData {
  id: number;
  name: string;
  age: number;
  email: string;
}

const columns: ColumnDef<ExampleData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "age",
    header: "Edad",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

// Datos de ejemplo
const exampleData: ExampleData[] = [
  { id: 1, name: "Juan Pérez", age: 25, email: "juan@example.com" },
  { id: 2, name: "María Gómez", age: 30, email: "maria@example.com" },
  { id: 3, name: "Carlos López", age: 28, email: "carlos@example.com" },
];

type StoryArgs = {
  columns: ColumnDef<ExampleData>[];
  data: ExampleData[];
  searchKey?: keyof ExampleData & string;
  loading?: boolean;
  onAdd?: () => void;
};

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    columns: {
      control: false,
      description: "Columnas de la tabla",
    },
    data: {
      control: false,
      description: "Datos de la tabla",
    },
    searchKey: {
      control: "select",
      options: ["name", "email"],
      description: "Clave de búsqueda para filtrar los datos",
    },
    loading: {
      control: "boolean",
      description: "Indica si la tabla está en estado de carga",
    },
    onAdd: {
      action: "onAdd",
      description: "Función que se ejecuta al hacer clic en el botón Agregar",
    },
  },
} satisfies Meta<typeof DataTable<ExampleData, unknown>>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Tabla básica
export const Default: Story = {
  args: {
    columns,
    data: exampleData,
    searchKey: "name",
    loading: false,
    onAdd: action("onAdd"),
  },
  render: (args) => <DataTable {...args} />,
};

// Tabla en estado de carga
export const Loading: Story = {
  args: {
    columns,
    data: exampleData,
    searchKey: "name",
    loading: true,
    onAdd: action("onAdd"),
  },
  render: (args) => <DataTable {...args} />,
};

// Tabla sin datos
export const Empty: Story = {
  args: {
    columns,
    data: [],
    searchKey: "name",
    loading: false,
    onAdd: action("onAdd"),
  },
  render: (args) => <DataTable {...args} />,
};

// Tabla con búsqueda
export const WithSearch: Story = {
  args: {
    columns,
    data: exampleData,
    searchKey: "name",
    loading: false,
    onAdd: action("onAdd"),
  },
  render: (args) => <DataTable {...args} />,
};

// Tabla con botón de agregar
export const WithAddButton: Story = {
  args: {
    columns,
    data: exampleData,
    searchKey: "name",
    loading: false,
    onAdd: action("onAdd"),
  },
  render: (args) => <DataTable {...args} />,
};