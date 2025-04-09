// import { Meta, StoryObj } from "@storybook/react";
// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogFooter,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogAction,
//   AlertDialogCancel,
// } from "./alert-dialog";
// import { Button } from "@/components/ui/button/button";

// const meta: Meta = {
//   title: "Components/AlertDialog",
//   component: AlertDialog,
//   tags: ["autodocs"],
//   argTypes: {
//     title: {
//       control: "text",
//       description: "Título del diálogo",
//     },
//     description: {
//       control: "text",
//       description: "Descripción del diálogo",
//     },
//   },
// };

// export default meta;
// type Story = StoryObj<typeof meta>;

// export const Default: Story = {
//   render: (args) => (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button variant="destructive">Delete Account</Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>{args.title}</AlertDialogTitle>
//           <AlertDialogDescription>{args.description}</AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction>Continue</AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   ),
//   args: {
//     title: "Are you absolutely sure?",
//     description:
//       "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
//   },
// };

// export const CustomTitleAndDescription: Story = {
//   render: (args) => (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button>Open Dialog</Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>{args.title}</AlertDialogTitle>
//           <AlertDialogDescription>{args.description}</AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction>Confirm</AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   ),
//   args: {
//     title: "Custom Title",
//     description: "This is a custom description for the alert dialog.",
//   },
// };

// export const WithoutCancelButton: Story = {
//   render: (args) => (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button>Force Action</Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>{args.title}</AlertDialogTitle>
//           <AlertDialogDescription>{args.description}</AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogAction>Proceed</AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   ),
//   args: {
//     title: "Important Action",
//     description: "This action must be completed.",
//   },
// };





import type { Meta, StoryObj } from "@storybook/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
import { Button } from "@/components/ui/button/button";

// Definimos un tipo adicional para las props personalizadas de Storybook
type StoryArgs = {
  title: string;
  description: string;
  actionText: string;
  cancelText: string;
  triggerText: string;
  className?: string;
};

const meta = {
  title: "Components/AlertDialog",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Título del diálogo",
    },
    description: {
      control: "text",
      description: "Descripción del diálogo",
    },
    actionText: {
      control: "text",
      description: "Texto del botón de acción",
    },
    cancelText: {
      control: "text",
      description: "Texto del botón de cancelar",
    },
    triggerText: {
      control: "text",
      description: "Texto del botón que abre el diálogo",
    },
    className: {
      control: "text",
      description: "Clases adicionales para personalizar el diálogo",
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

// Diálogo de alerta básico
export const Default: Story = {
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{args.triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={args.className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{args.title}</AlertDialogTitle>
          <AlertDialogDescription>{args.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{args.cancelText}</AlertDialogCancel>
          <AlertDialogAction>{args.actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  args: {
    title: "Are you absolutely sure?",
    description:
      "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    actionText: "Continue",
    cancelText: "Cancel",
    triggerText: "Delete Account",
    className: "",
  },
};

// Diálogo de alerta con título y descripción personalizados
export const CustomTitleAndDescription: Story = {
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>{args.triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={args.className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{args.title}</AlertDialogTitle>
          <AlertDialogDescription>{args.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{args.cancelText}</AlertDialogCancel>
          <AlertDialogAction>{args.actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  args: {
    title: "Custom Title",
    description: "This is a custom description for the alert dialog.",
    actionText: "Confirm",
    cancelText: "Cancel",
    triggerText: "Open Dialog",
    className: "",
  },
};

// Diálogo de alerta sin botón de cancelar
export const WithoutCancelButton: Story = {
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>{args.triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={args.className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{args.title}</AlertDialogTitle>
          <AlertDialogDescription>{args.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{args.actionText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  args: {
    title: "Important Action",
    description: "This action must be completed.",
    actionText: "Proceed",
    triggerText: "Force Action",
    className: "",
  },
};