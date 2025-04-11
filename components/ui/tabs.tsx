// "use client"

// import * as React from "react"
// import * as TabsPrimitive from "@radix-ui/react-tabs"

// import { cn } from "@/lib/utils"

// const Tabs = TabsPrimitive.Root

// const TabsList = React.forwardRef<
//   React.ElementRef<typeof TabsPrimitive.List>,
//   React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
// >(({ className, ...props }, ref) => (
//   <div className="relative w-full">
//     <div className="absolute left-0 right-0 h-px bottom-0 bg-border" />
//     <div className="overflow-auto scrollbar-none">
//       <TabsPrimitive.List
//         ref={ref}
//         className={cn(
//           "relative inline-flex min-w-full h-10 items-center justify-start rounded-none bg-transparent p-0 text-muted-foreground",
//           className
//         )}
//         {...props}
//       />
//     </div>
//   </div>
// ))
// TabsList.displayName = TabsPrimitive.List.displayName

// const TabsTrigger = React.forwardRef<
//   React.ElementRef<typeof TabsPrimitive.Trigger>,
//   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.Trigger
//     ref={ref}
//     className={cn(
//       "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground",
//       className
//     )}
//     {...props}
//   />
// ))
// TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// const TabsContent = React.forwardRef<
//   React.ElementRef<typeof TabsPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.Content
//     ref={ref}
//     className={cn(
//       "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
//       className
//     )}
//     {...props}
//   />
// ))
// TabsContent.displayName = TabsPrimitive.Content.displayName

// export { Tabs, TabsList, TabsTrigger, TabsContent }







"use client";

import * as React from "react";
import {
  Tabs as VisorTabs,
  TabsList as VisorTabsList,
  TabsTrigger as VisorTabsTrigger,
  TabsContent as VisorTabsContent,
} from "visor-ui";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
  React.ElementRef<typeof VisorTabs>,
  React.ComponentPropsWithoutRef<typeof VisorTabs>
>(({ className, ...props }, ref) => (
  <VisorTabs ref={ref} className={cn("flex flex-col", className)} {...props} />
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof VisorTabsList>,
  React.ComponentPropsWithoutRef<typeof VisorTabsList>
>(({ className, ...props }, ref) => (
  <div className="relative w-full">
    <div className="absolute left-0 right-0 h-px bottom-0 bg-border" />
    <div className="overflow-auto scrollbar-none">
      <VisorTabsList
        ref={ref}
        className={cn(
          "relative inline-flex min-w-full h-10 items-center justify-start rounded-none bg-transparent p-0 text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof VisorTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof VisorTabsTrigger>
>(({ className, ...props }, ref) => (
  <VisorTabsTrigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof VisorTabsContent>,
  React.ComponentPropsWithoutRef<typeof VisorTabsContent>
>(({ className, ...props }, ref) => (
  <VisorTabsContent
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };