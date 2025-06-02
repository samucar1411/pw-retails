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