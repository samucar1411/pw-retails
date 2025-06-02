"use client";

import * as React from "react";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "visor-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationMenu = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const NavigationMenuList = ({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) => {
  return (
    <ul
      className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
};

const NavigationMenuItem = ({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => {
  return (
    <li className={cn("list-none", className)} {...props}>
      {children}
    </li>
  );
};

const NavigationMenuTrigger = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <DropdownMenuTrigger
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </DropdownMenuTrigger>
  );
};

const NavigationMenuContent = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <DropdownMenuContent
      className={cn(
        "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  );
};

const NavigationMenuLink = ({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:text-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
};