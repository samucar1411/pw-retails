// import * as React from "react"

// import { cn } from "@/lib/utils"

// export interface InputProps
//   extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string
//   error?: string
//   success?: string
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type, label, error, success, ...props }, ref) => {
//     return (
//       <div className="space-y-2">
//         {label && (
//           <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//             {label}
//           </label>
//         )}
//         <input
//           type={type}
//           className={cn(
//             "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//             error && "border-destructive focus-visible:ring-destructive",
//             success && "border-success focus-visible:ring-success",
//             className
//           )}
//           ref={ref}
//           {...props}
//         />
//         {error && (
//           <p className="text-sm text-destructive">{error}</p>
//         )}
//         {success && (
//           <p className="text-sm text-success">{success}</p>
//         )}
//       </div>
//     )
//   }
// )
// Input.displayName = "Input"

// export { Input }






import * as React from "react"
import { Input as VisorInput, Label as VisorLabel } from "visor-ui"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, success, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <VisorLabel
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </VisorLabel>
        )}
        <VisorInput
          id={props.id}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-success focus-visible:ring-success",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }