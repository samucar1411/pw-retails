"use client";

import * as React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = ({ children, ...props }: React.ComponentProps<"form">) => {
  return <form {...props}>{children}</form>;
};

const FormItem = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
};

const FormLabel = ({ children, htmlFor, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium", className)}
      {...props}
    >
      {children}
    </label>
  );
};

const FormControl = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input 
      ref={ref} 
      className={cn("w-full rounded-md border border-input bg-background px-3 py-2 text-sm", className)} 
      {...props} 
    />
  )
);
FormControl.displayName = "FormControl";

const FormDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

const FormMessage = ({ error, className, ...props }: { error?: string } & React.HTMLAttributes<HTMLParagraphElement>) => {
  if (!error) return null;

  return (
    <p className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {error}
    </p>
  );
};

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };