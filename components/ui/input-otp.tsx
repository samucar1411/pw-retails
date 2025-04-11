// "use client"

// import * as React from "react"
// import { OTPInput, OTPInputContext } from "input-otp"
// import { Dot } from "lucide-react"

// import { cn } from "@/lib/utils"

// const InputOTP = React.forwardRef<
//   React.ElementRef<typeof OTPInput>,
//   React.ComponentPropsWithoutRef<typeof OTPInput>
// >(({ className, containerClassName, ...props }, ref) => (
//   <OTPInput
//     ref={ref}
//     containerClassName={cn(
//       "flex items-center gap-2 has-[:disabled]:opacity-50",
//       containerClassName
//     )}
//     className={cn("disabled:cursor-not-allowed", className)}
//     {...props}
//   />
// ))
// InputOTP.displayName = "InputOTP"

// const InputOTPGroup = React.forwardRef<
//   React.ElementRef<"div">,
//   React.ComponentPropsWithoutRef<"div">
// >(({ className, ...props }, ref) => (
//   <div ref={ref} className={cn("flex items-center", className)} {...props} />
// ))
// InputOTPGroup.displayName = "InputOTPGroup"

// const InputOTPSlot = React.forwardRef<
//   React.ElementRef<"div">,
//   React.ComponentPropsWithoutRef<"div"> & { index: number }
// >(({ index, className, ...props }, ref) => {
//   const inputOTPContext = React.useContext(OTPInputContext)
//   const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

//   return (
//     <div
//       ref={ref}
//       className={cn(
//         "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
//         isActive && "z-10 ring-2 ring-ring ring-offset-background",
//         className
//       )}
//       {...props}
//     >
//       {char}
//       {hasFakeCaret && (
//         <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//           <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
//         </div>
//       )}
//     </div>
//   )
// })
// InputOTPSlot.displayName = "InputOTPSlot"

// const InputOTPSeparator = React.forwardRef<
//   React.ElementRef<"div">,
//   React.ComponentPropsWithoutRef<"div">
// >(({ ...props }, ref) => (
//   <div ref={ref} role="separator" {...props}>
//     <Dot />
//   </div>
// ))
// InputOTPSeparator.displayName = "InputOTPSeparator"

// export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }







"use client"

import * as React from "react"
import { Input, Label } from "visor-ui"
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