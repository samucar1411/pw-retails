import type { Meta, StoryObj } from "@storybook/react";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./form";
import { Input } from "@/components/ui/input/input";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { action } from "@storybook/addon-actions";
import React from "react";

type StoryArgs = {
  label?: string;
  description?: string;
  error?: string;
};

const meta = {
  title: "Components/Form",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Etiqueta del campo",
    },
    description: {
      control: "text",
      description: "Descripción del campo",
    },
    error: {
      control: "text",
      description: "Mensaje de error",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Formulario básico
export const Default: Story = {
  args: {
    label: "Nombre",
    description: "Introduce tu nombre completo",
    error: "",
  },
  render: (args) => {
    const FormComponent = () => {
      const form = useForm();

      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(action("onSubmit"))}
            className="space-y-8"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{args.label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormDescription>{args.description}</FormDescription>
                  <FormMessage>{args.error}</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit">Enviar</Button>
          </form>
        </Form>
      );
    };

    return <FormComponent />;
  },
};

// Formulario con error
export const WithError: Story = {
  args: {
    label: "Nombre",
    description: "Introduce tu nombre completo",
    error: "El nombre es requerido",
  },
  render: (args) => {
    const FormComponent = () => {
      const form = useForm();

      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(action("onSubmit"))}
            className="space-y-8"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{args.label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormDescription>{args.description}</FormDescription>
                  <FormMessage>{args.error}</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit">Enviar</Button>
          </form>
        </Form>
      );
    };

    return <FormComponent />;
  },
};

// Formulario con múltiples campos
export const WithMultipleFields: Story = {
  args: {
    label: "Nombre",
    description: "Introduce tu nombre completo",
    error: "",
  },
  render: (args) => {
    const FormComponent = () => {
      const form = useForm();

      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(action("onSubmit"))}
            className="space-y-8"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{args.label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormDescription>{args.description}</FormDescription>
                  <FormMessage>{args.error}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormDescription>Introduce tu email</FormDescription>
                  <FormMessage>El email es requerido</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit">Enviar</Button>
          </form>
        </Form>
      );
    };

    return <FormComponent />;
  },
};