import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";
import { Card, CardContent } from "@/components/ui/card/card";

type StoryArgs = {
  orientation?: "horizontal" | "vertical";
  showControls?: boolean;
  slides: { content: string }[];
  className?: string;
};

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Orientación del carousel",
    },
    showControls: {
      control: "boolean",
      description: "Mostrar u ocultar controles de navegación",
    },
    slides: {
      control: "object",
      description: "Contenido de los slides",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el carousel",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Carousel horizontal básico
export const Horizontal: Story = {
  render: (args) => (
    <Carousel orientation={args.orientation} className={args.className}>
      <CarouselContent>
        {args.slides.map((slide, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{slide.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {args.showControls && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  ),
  args: {
    orientation: "horizontal",
    showControls: true,
    slides: [
      { content: "1" },
      { content: "2" },
      { content: "3" },
      { content: "4" },
      { content: "5" },
    ],
    className: "",
  },
};

// Carousel vertical básico
export const Vertical: Story = {
  render: (args) => (
    <Carousel orientation={args.orientation} className={args.className}>
      <CarouselContent>
        {args.slides.map((slide, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{slide.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {args.showControls && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  ),
  args: {
    orientation: "vertical",
    showControls: true,
    slides: [
      { content: "1" },
      { content: "2" },
      { content: "3" },
      { content: "4" },
      { content: "5" },
    ],
    className: "",
  },
};

// Carousel sin controles
export const WithoutControls: Story = {
  render: (args) => (
    <Carousel orientation={args.orientation} className={args.className}>
      <CarouselContent>
        {args.slides.map((slide, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{slide.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  ),
  args: {
    orientation: "horizontal",
    showControls: false,
    slides: [
      { content: "1" },
      { content: "2" },
      { content: "3" },
      { content: "4" },
      { content: "5" },
    ],
    className: "",
  },
};

// Carousel con clases personalizadas
export const CustomClass: Story = {
  render: (args) => (
    <Carousel orientation={args.orientation} className={args.className}>
      <CarouselContent>
        {args.slides.map((slide, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{slide.content}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {args.showControls && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  ),
  args: {
    orientation: "horizontal",
    showControls: true,
    slides: [
      { content: "1" },
      { content: "2" },
      { content: "3" },
      { content: "4" },
      { content: "5" },
    ],
    className: "w-full max-w-md",
  },
};