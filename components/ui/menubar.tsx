// "use client"

// import * as React from "react"
// import * as MenubarPrimitive from "@radix-ui/react-menubar"
// import { Check, ChevronRight, Circle } from "lucide-react"

// import { cn } from "@/lib/utils"

// const MenubarMenu = MenubarPrimitive.Menu

// const MenubarGroup = MenubarPrimitive.Group

// const MenubarPortal = MenubarPrimitive.Portal

// const MenubarSub = MenubarPrimitive.Sub

// const MenubarRadioGroup = MenubarPrimitive.RadioGroup

// const Menubar = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
// >(({ className, ...props }, ref) => (
//   <MenubarPrimitive.Root
//     ref={ref}
//     className={cn(
//       "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
//       className
//     )}
//     {...props}
//   />
// ))
// Menubar.displayName = MenubarPrimitive.Root.displayName

// const MenubarTrigger = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Trigger>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
// >(({ className, ...props }, ref) => (
//   <MenubarPrimitive.Trigger
//     ref={ref}
//     className={cn(
//       "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
//       className
//     )}
//     {...props}
//   />
// ))
// MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

// const MenubarSubTrigger = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
//     inset?: boolean
//   }
// >(({ className, inset, children, ...props }, ref) => (
//   <MenubarPrimitive.SubTrigger
//     ref={ref}
//     className={cn(
//       "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
//       inset && "pl-8",
//       className
//     )}
//     {...props}
//   >
//     {children}
//     <ChevronRight className="ml-auto h-4 w-4" />
//   </MenubarPrimitive.SubTrigger>
// ))
// MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

// const MenubarSubContent = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.SubContent>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
// >(({ className, ...props }, ref) => (
//   <MenubarPrimitive.SubContent
//     ref={ref}
//     className={cn(
//       "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
//       className
//     )}
//     {...props}
//   />
// ))
// MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

// const MenubarContent = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
// >(
//   (
//     { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
//     ref
//   ) => (
//     <MenubarPrimitive.Portal>
//       <MenubarPrimitive.Content
//         ref={ref}
//         align={align}
//         alignOffset={alignOffset}
//         sideOffset={sideOffset}
//         className={cn(
//           "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
//           className
//         )}
//         {...props}
//       />
//     </MenubarPrimitive.Portal>
//   )
// )
// MenubarContent.displayName = MenubarPrimitive.Content.displayName

// const MenubarItem = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Item>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
//     inset?: boolean
//   }
// >(({ className, inset, ...props }, ref) => (
//   <MenubarPrimitive.Item
//     ref={ref}
//     className={cn(
//       "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       inset && "pl-8",
//       className
//     )}
//     {...props}
//   />
// ))
// MenubarItem.displayName = MenubarPrimitive.Item.displayName

// const MenubarCheckboxItem = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
// >(({ className, children, checked, ...props }, ref) => (
//   <MenubarPrimitive.CheckboxItem
//     ref={ref}
//     className={cn(
//       "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       className
//     )}
//     checked={checked}
//     {...props}
//   >
//     <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
//       <MenubarPrimitive.ItemIndicator>
//         <Check className="h-4 w-4" />
//       </MenubarPrimitive.ItemIndicator>
//     </span>
//     {children}
//   </MenubarPrimitive.CheckboxItem>
// ))
// MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

// const MenubarRadioItem = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.RadioItem>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
// >(({ className, children, ...props }, ref) => (
//   <MenubarPrimitive.RadioItem
//     ref={ref}
//     className={cn(
//       "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       className
//     )}
//     {...props}
//   >
//     <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
//       <MenubarPrimitive.ItemIndicator>
//         <Circle className="h-2 w-2 fill-current" />
//       </MenubarPrimitive.ItemIndicator>
//     </span>
//     {children}
//   </MenubarPrimitive.RadioItem>
// ))
// MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

// const MenubarLabel = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Label>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
//     inset?: boolean
//   }
// >(({ className, inset, ...props }, ref) => (
//   <MenubarPrimitive.Label
//     ref={ref}
//     className={cn(
//       "px-2 py-1.5 text-sm font-semibold",
//       inset && "pl-8",
//       className
//     )}
//     {...props}
//   />
// ))
// MenubarLabel.displayName = MenubarPrimitive.Label.displayName

// const MenubarSeparator = React.forwardRef<
//   React.ElementRef<typeof MenubarPrimitive.Separator>,
//   React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
// >(({ className, ...props }, ref) => (
//   <MenubarPrimitive.Separator
//     ref={ref}
//     className={cn("-mx-1 my-1 h-px bg-muted", className)}
//     {...props}
//   />
// ))
// MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

// const MenubarShortcut = ({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLSpanElement>) => {
//   return (
//     <span
//       className={cn(
//         "ml-auto text-xs tracking-widest text-muted-foreground",
//         className
//       )}
//       {...props}
//     />
//   )
// }
// MenubarShortcut.displayname = "MenubarShortcut"

// export {
//   Menubar,
//   MenubarMenu,
//   MenubarTrigger,
//   MenubarContent,
//   MenubarItem,
//   MenubarSeparator,
//   MenubarLabel,
//   MenubarCheckboxItem,
//   MenubarRadioGroup,
//   MenubarRadioItem,
//   MenubarPortal,
//   MenubarSubContent,
//   MenubarSubTrigger,
//   MenubarGroup,
//   MenubarSub,
//   MenubarShortcut,
// }





"use client";

import * as React from "react";
import { Menubar as VisorMenubar, MenubarItem, MenubarGroup, MenubarSeparator } from "visor-ui";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const Menubar = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof VisorMenubar>) => {
  return (
    <VisorMenubar
      className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
      {...props}
    >
      {children}
    </VisorMenubar>
  );
};

const MenubarTrigger = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarItem>) => {
  return (
    <MenubarItem className={cn("cursor-pointer px-3 py-1.5 text-sm font-medium", className)} {...props}>
      {children}
    </MenubarItem>
  );
};

const MenubarContent = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarGroup>) => {
  return (
    <MenubarGroup className={cn("rounded-md bg-popover p-1 shadow-md", className)} {...props}>
      {children}
    </MenubarGroup>
  );
};

const MenubarCheckboxItem = ({
  children,
  checked,
  className,
  ...props
}: {
  children: React.ReactNode;
  checked?: boolean;
  className?: string;
}) => {
  return (
    <MenubarItem className={cn("flex items-center px-2 py-1.5 text-sm", className)} {...props}>
      {checked && <Check className="mr-2 h-4 w-4" />}
      {children}
    </MenubarItem>
  );
};

const MenubarRadioItem = ({
  children,
  selected,
  className,
  ...props
}: {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
}) => {
  return (
    <MenubarItem className={cn("flex items-center px-2 py-1.5 text-sm", className)} {...props}>
      {selected && <Circle className="mr-2 h-2 w-2 fill-current" />}
      {children}
    </MenubarItem>
  );
};

const MenubarLabel = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof MenubarItem>) => {
  return (
    <span className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...{ ...props, onSelect: undefined }}>
      {children}
    </span>
  );
};

const MenubarShortcut = ({
  children,
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLSpanElement>, "onSelect">) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props}>
      {children}
    </span>
  );
};

export {
  Menubar,
  MenubarTrigger,
  MenubarContent,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
};