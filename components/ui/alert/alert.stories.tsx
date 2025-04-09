import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "@/components/ui/button/button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Terminal,
  X,
} from "lucide-react";

// Definición de un tipo adicional para las props personalizadas de Storybook
type StoryArgs = {
  title: string;
  description: string;
} & React.ComponentProps<typeof Alert>;

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description: "Variante de estilo de la alerta",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar la alerta",
    },
    title: {
      control: "text",
      description: "Título de la alerta",
    },
    description: {
      control: "text",
      description: "Descripción de la alerta",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Alerta básica
export const Básica: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "",
    title: "¡Atención!",
    description: "Esta es una alerta básica para mostrar información importante.",
  },
};

// Alerta destructiva
export const Destructiva: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
  args: {
    variant: "destructive",
    className: "",
    title: "Error",
    description:
      "Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
  },
};

// Alerta con icono de información
export const ConIconoInfo: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <Info className="h-4 w-4" />
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "",
    title: "Información",
    description: "Tu perfil ha sido actualizado correctamente.",
  },
};

// Alerta con icono de éxito
export const ConIconoÉxito: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "border-green-500/50 text-green-600 dark:text-green-500",
    title: "¡Éxito!",
    description: "La operación se ha completado correctamente.",
  },
};

// Alerta con icono de advertencia
export const ConIconoAdvertencia: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "border-yellow-500/50 text-yellow-600 dark:text-yellow-500",
    title: "Advertencia",
    description:
      "Tu suscripción está a punto de expirar. Renuévala para seguir disfrutando del servicio.",
  },
};

// Alerta con acciones
export const ConAcciones: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <Info className="h-4 w-4" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
        <div>
          <AlertTitle>{args.title}</AlertTitle>
          <AlertDescription>{args.description}</AlertDescription>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Button variant="outline" size="sm">
            Más tarde
          </Button>
          <Button size="sm">Actualizar</Button>
        </div>
      </div>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "",
    title: "Actualización disponible",
    description: "Hay una nueva versión disponible. ¿Deseas actualizar ahora?",
  },
};

// Alerta con botón de cerrar
export const ConBotónCerrar: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <div className="flex-1">
        <AlertTitle>{args.title}</AlertTitle>
        <AlertDescription>{args.description}</AlertDescription>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "flex justify-between items-start",
    title: "Cookies",
    description:
      "Utilizamos cookies para mejorar tu experiencia en nuestro sitio web.",
  },
};

// Alerta con código
export const ConCódigo: Story = {
  render: (args) => (
    <Alert variant={args.variant} className={args.className}>
      <Terminal className="h-4 w-4" />
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto text-white">
          <code className="text-xs font-mono">{args.description}</code>
        </pre>
      </AlertDescription>
    </Alert>
  ),
  args: {
    variant: "default",
    className: "",
    title: "Ejemplo de código",
    description: "npm install @/components/ui",
  },
};

// Alerta con bordes personalizados
export const ConBordesPersonalizados: Story = {
  render: (args) => (
    <div className="space-y-4">
      <Alert variant={args.variant} className={args.className}>
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>{args.title}</AlertTitle>
        <AlertDescription>{args.description}</AlertDescription>
      </Alert>

      <Alert variant={args.variant} className={args.className}>
        <Info className="h-4 w-4 text-purple-500" />
        <AlertTitle>{args.title}</AlertTitle>
        <AlertDescription>{args.description}</AlertDescription>
      </Alert>

      <Alert variant={args.variant} className={args.className}>
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertTitle>{args.title}</AlertTitle>
        <AlertDescription>{args.description}</AlertDescription>
      </Alert>
    </div>
  ),
  args: {
    variant: "default",
    className: "border-l-4 border-l-blue-500 rounded-l-none",
    title: "Información",
    description: "Esta alerta tiene un borde izquierdo personalizado.",
  },
};

// Alerta con fondo personalizado
export const ConFondoPersonalizado: Story = {
  render: (args) => (
    <div className="space-y-4">
      <Alert variant={args.variant} className={args.className}>
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">
          {args.title}
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          {args.description}
        </AlertDescription>
      </Alert>

      <Alert variant={args.variant} className={args.className}>
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">
          {args.title}
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          {args.description}
        </AlertDescription>
      </Alert>

      <Alert variant={args.variant} className={args.className}>
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertTitle className="text-red-800 dark:text-red-300">
          {args.title}
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-400">
          {args.description}
        </AlertDescription>
      </Alert>

      <Alert variant={args.variant} className={args.className}>
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">
          {args.title}
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
          {args.description}
        </AlertDescription>
      </Alert>
    </div>
  ),
  args: {
    variant: "default",
    className:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    title: "Información",
    description: "Esta alerta tiene un fondo azul personalizado.",
  },
};
