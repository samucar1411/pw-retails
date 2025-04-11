"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex overflow-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0",
        className
      )}
      {...props}
    >
      <div className="flex gap-2 min-w-full lg:flex-col lg:gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "whitespace-nowrap justify-start"
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
