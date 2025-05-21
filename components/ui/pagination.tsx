// components/ui/pagination.tsx
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"          // helper de clases de shadcn

/* ────────────────────────────
   Contenedor raíz <nav>
   ──────────────────────────── */
export function Pagination(
  props: React.HTMLAttributes<HTMLElement>
) {
  const { className, ...rest } = props
  return (
    <nav
      role="navigation"
      aria-label="Pagination navigation"
      className={cn("flex w-full items-center justify-center", className)}
      {...rest}
    />
  )
}

/* ────────────────────────────
   <ul> agrupa botones/links
   ──────────────────────────── */
export function PaginationContent(
  props: React.HTMLAttributes<HTMLUListElement>
) {
  const { className, ...rest } = props
  return (
    <ul
      className={cn("flex items-center gap-1", className)}
      {...rest}
    />
  )
}

/* ────────────────────────────
   Wrapper opcional para <li>
   ──────────────────────────── */
export function PaginationItem(
  props: React.LiHTMLAttributes<HTMLLIElement>
) {
  const { className, ...rest } = props
  return <li className={cn("text-sm", className)} {...rest} />
}

/* ────────────────────────────
   Link numérico (1, 2, 3…)
   ──────────────────────────── */
export function PaginationLink(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    isActive?: boolean
  }
) {
  const { isActive = false, className, ...rest } = props
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-input text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...rest}
    />
  )
}

/* ────────────────────────────
   Flecha «Anterior»
   ──────────────────────────── */
export function PaginationPrevious(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  const { className, ...rest } = props
  return (
    <a
      aria-label="Página anterior"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent",
        className
      )}
      {...rest}
    >
      <ChevronLeft className="h-4 w-4" />
    </a>
  )
}

/* ────────────────────────────
   Flecha «Siguiente»
   ──────────────────────────── */
export function PaginationNext(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  const { className, ...rest } = props
  return (
    <a
      aria-label="Página siguiente"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent",
        className
      )}
      {...rest}
    >
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}

/* ────────────────────────────
   Puntos suspensivos (…) opcional
   ──────────────────────────── */
export function PaginationEllipsis(
  props: React.LiHTMLAttributes<HTMLLIElement>
) {
  const { className, ...rest } = props
  return (
    <li
      className={cn("flex h-8 w-8 items-center justify-center", className)}
      {...rest}
    >
      <MoreHorizontal className="h-4 w-4" />
    </li>
  )
}