import type { Meta, StoryObj } from "@storybook/react";
import Map from "./map";

type StoryArgs = {
  locations: {
    lat: number;
    lng: number;
    title: string;
  }[];
};

const meta = {
  title: "Components/Map",
  component: Map,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    locations: {
      control: "object",
      description: "Lista de ubicaciones para mostrar en el mapa",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Mapa básico con una ubicación
export const Default: Story = {
  args: {
    locations: [
      {
        lat: -25.2867,
        lng: -57.3333,
        title: "Asunción, Paraguay",
      },
    ],
  },
};

// Mapa con múltiples ubicaciones
export const WithMultipleLocations: Story = {
  args: {
    locations: [
      {
        lat: -25.2867,
        lng: -57.3333,
        title: "Asunción, Paraguay",
      },
      {
        lat: -25.2967,
        lng: -57.3433,
        title: "Casa de la Música",
      },
      {
        lat: -25.2767,
        lng: -57.3233,
        title: "Costanera de Asunción",
      },
    ],
  },
};

// Mapa sin ubicaciones
export const NoLocations: Story = {
  args: {
    locations: [],
  },
};