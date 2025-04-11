// "use client"

// import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

// const Collapsible = CollapsiblePrimitive.Root

// const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

// const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

// export { Collapsible, CollapsibleTrigger, CollapsibleContent }


"use client"

import * as React from "react"
import { Button, Card, CardHeader, CardContent } from "visor-ui"
import { ChevronDown } from "lucide-react"

type CollapsibleProps = {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

const Collapsible = ({ title, children, isOpen = false, onToggle }: CollapsibleProps) => {
  const [open, setOpen] = React.useState(isOpen)

  const handleToggle = () => {
    setOpen(!open)
    if (onToggle) onToggle()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <span>{title}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          aria-expanded={open}
          aria-label="Toggle collapsible"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  )
}

export { Collapsible }