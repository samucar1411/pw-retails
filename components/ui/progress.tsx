// "use client"

// import * as React from "react"
// import * as ProgressPrimitive from "@radix-ui/react-progress"

// import { cn } from "@/lib/utils"

// const Progress = React.forwardRef<
//   React.ElementRef<typeof ProgressPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
// >(({ className, value, ...props }, ref) => (
//   <ProgressPrimitive.Root
//     ref={ref}
//     className={cn(
//       "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
//       className
//     )}
//     {...props}
//   >
//     <ProgressPrimitive.Indicator
//       className="h-full w-full flex-1 bg-primary transition-all"
//       style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
//     />
//   </ProgressPrimitive.Root>
// ))
// Progress.displayName = ProgressPrimitive.Root.displayName

// export { Progress }






"use client";

import * as React from "react";
import { Progress as VisorProgress } from "visor-ui";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof VisorProgress> {
  value: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <VisorProgress
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </VisorProgress>
  )
);
Progress.displayName = "Progress";

export { Progress };