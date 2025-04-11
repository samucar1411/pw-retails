// "use client"

// import { useTheme } from "next-themes"
// import { Toaster as Sonner } from "sonner"

// type ToasterProps = React.ComponentProps<typeof Sonner>

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme()

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       toastOptions={{
//         classNames: {
//           toast:
//             "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
//           description: "group-[.toast]:text-muted-foreground",
//           actionButton:
//             "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
//           cancelButton:
//             "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
//         },
//       }}
//       {...props}
//     />
//   )
// }

// export { Toaster }







"use client";

import { useTheme } from "next-themes";
import { Toaster as VisorToaster } from "visor-ui";
import { cn } from "@/lib/utils";

type ToasterProps = {
  theme?: string;
  className?: string;
  toastOptions?: {
    classNames?: {
      toast?: string;
      description?: string;
      actionButton?: string;
      cancelButton?: string;
    };
  };
};

const Toaster = ({ theme: themeProp, className, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <VisorToaster
      {...props}
      {...(className ? { "data-class-name": cn("toaster group", className) } : {})}
      data-theme={themeProp || theme}
      data-toast-options={JSON.stringify(toastOptions)}
    />
  );
};

export { Toaster };