"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Componente DropdownMenu principal
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

// Trigger para el dropdown
const DropdownMenuTrigger = ({
  children,
  onClick,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  // Si asChild es true, simplemente renderizamos los children
  if (asChild) {
    return <>{children}</>;
  }
  
  return (
    <div
      className="inline-flex justify-center w-full rounded-md cursor-pointer"
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Contenido del dropdown
const DropdownMenuContent = ({
  children,
  align = "right",
  className,
  ...props
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "start" | "end";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const alignClass = align === "start" ? "left-0" : 
                     align === "end" ? "right-0" : 
                     align === "left" ? "left-0" : 
                     align === "right" ? "right-0" : 
                     "left-1/2 transform -translate-x-1/2";
  
  return (
    <div className={cn(`absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${alignClass}`, className)} {...props}>
      <div className="py-1">{children}</div>
    </div>
  );
};

// Grupo de items
const DropdownMenuGroup = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("py-1", className)} {...props}>{children}</div>;
};

// Etiqueta del menú
const DropdownMenuLabel = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("px-4 py-2 text-sm text-gray-700 font-medium", className)} {...props}>
      {children}
    </div>
  );
};

// Item del menú desplegable
const DropdownMenuItem = ({
  children,
  onClick,
  asChild,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  // Si asChild es true, simplemente renderizamos los children
  if (asChild) {
    return <>{children}</>;
  }
  
  return (
    <div
      className={cn("block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Checkbox item
const DropdownMenuCheckboxItem = ({
  children,
  checked,
  onClick,
  className,
  ...props
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      <input
        type="checkbox"
        className="mr-2"
        checked={checked}
        readOnly
      />
      {children}
    </div>
  );
};

// Radio item
const DropdownMenuRadioItem = ({
  children,
  selected,
  onClick,
  className,
  ...props
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      <input
        type="radio"
        className="mr-2"
        checked={selected}
        readOnly
      />
      {children}
    </div>
  );
};

// Separador
const DropdownMenuSeparator = ({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("my-1 h-px bg-gray-200", className)} {...props} />;
};

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};

const DropdownMenuSub = ({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
};

const DropdownMenuSubContent = ({
  children,
  align = "right",
  className,
  ...props
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "start" | "end";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const alignClass = align === "start" ? "left-0" : 
                     align === "end" ? "right-0" : 
                     align === "left" ? "left-0" : 
                     align === "right" ? "right-0" : 
                     "left-1/2 transform -translate-x-1/2";
  
  return (
    <div className={cn(`absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${alignClass}`, className)} {...props}>
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuSubTrigger = ({
  children,
  onClick,
  inset,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  inset?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer ${inset ? "pl-8" : ""}`, className)}
      onClick={onClick}
      {...props}
    >
      {children}
      <span className="ml-auto">→</span>
    </div>
  );
};

const DropdownMenuRadioGroup = ({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("py-1", className)} {...props}>
      {children}
    </div>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};