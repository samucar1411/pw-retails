// "use client"

// import * as React from "react"
// import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

// import { cn } from "@/lib/utils"

// const HoverCard = HoverCardPrimitive.Root

// const HoverCardTrigger = HoverCardPrimitive.Trigger

// const HoverCardContent = React.forwardRef<
//   React.ElementRef<typeof HoverCardPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
// >(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
//   <HoverCardPrimitive.Content
//     ref={ref}
//     align={align}
//     sideOffset={sideOffset}
//     className={cn(
//       "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
//       className
//     )}
//     {...props}
//   />
// ))
// HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

// export { HoverCard, HoverCardTrigger, HoverCardContent }




"use client"

import * as React from "react"
import { Input } from "visor-ui"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InputOTPProps {
  length: number
  value: string
  onChange: (value: string) => void
}

const InputOTP = ({ length, value, onChange }: InputOTPProps) => {
  const handleChange = (index: number, char: string) => {
    const newValue = value.split("")
    newValue[index] = char.slice(-1) // Solo mantener el último carácter
    onChange(newValue.join(""))
  }

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          className="h-10 w-10 text-center"
          maxLength={1}
        />
      ))}
    </div>
  )
}

const InputOTPGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center">{children}</div>
}

const InputOTPSlot = ({
  value,
  className,
}: {
  value: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border rounded-md",
        className
      )}
    >
      {value}
    </div>
  )
}

const InputOTPSeparator = () => {
  return (
    <div role="separator" className="flex items-center">
      <Dot />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }