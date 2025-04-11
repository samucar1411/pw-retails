// import { cn } from "@/lib/utils"
// import { ReactNode } from "react"

// interface ContainerProps {
//   children: ReactNode
//   className?: string
// }

// export function Container({ children, className }: ContainerProps) {
//   return (
//     <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
//       {children}
//     </div>
//   )
// } 



"use client";

import * as React from "react";
import { Checkbox as VisorCheckbox } from "visor-ui";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof VisorCheckbox>,
  React.ComponentPropsWithoutRef<typeof VisorCheckbox>
>(({ className, ...props }, ref) => (
  <VisorCheckbox
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

export { Checkbox };