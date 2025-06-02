"use client"

import * as React from "react"
import { Menubar, MenubarItem, MenubarSeparator } from "visor-ui"
import { Check, Circle } from "lucide-react"

const ContextMenu = ({ children }: { children: React.ReactNode }) => {
  return <Menubar>{children}</Menubar>
}

const ContextMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const ContextMenuContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const ContextMenuItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => {
  return <MenubarItem onClick={onClick}>{children}</MenubarItem>
}

const ContextMenuSeparator = () => {
  return <MenubarSeparator />
}

const ContextMenuCheckboxItem = ({
  children,
  checked,
  onClick,
}: {
  children: React.ReactNode
  checked?: boolean
  onClick?: () => void
}) => {
  return (
    <MenubarItem onClick={onClick}>
      {checked && <Check className="mr-2 h-4 w-4 inline" />}
      {children}
    </MenubarItem>
  )
}

const ContextMenuRadioItem = ({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
}) => {
  return (
    <MenubarItem onClick={onClick}>
      {selected && <Circle className="mr-2 h-2 w-2 fill-current inline" />}
      {children}
    </MenubarItem>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
}